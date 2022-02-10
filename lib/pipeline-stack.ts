import { Construct } from "constructs";
import { SecretValue, Stack, StackProps } from "aws-cdk-lib";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import { GitHubTrigger } from "aws-cdk-lib/aws-codepipeline-actions";
import { LambdaStage } from "./lambda-stack";

interface RequiredEnvironment {
  account: string;
  region: string;
}

interface PipelineStackProps extends StackProps {
  env: RequiredEnvironment;
  stages: {
    dev: {
      env: RequiredEnvironment;
    };
    test: {
      env: RequiredEnvironment;
    };
  };
}

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    const codePipeline = new CodePipeline(this, "Pipeline", {
      pipelineName: "Larva",
      crossAccountKeys: true,
      selfMutation: true,
      synth: new ShellStep("Synth", {
        input: CodePipelineSource.gitHub("Marchie/larva", "main", {
          authentication: SecretValue.secretsManager("github-token"),
          trigger: GitHubTrigger.WEBHOOK,
        }),
        commands: [
          "npm ci",
          "npm run test -- --ci",
          "npm run lint",
          "npm run audit",
          "npm run build",
          "npx cdk synth",
        ],
      }),
    });

    const deployDevLambdaStage = new LambdaStage(this, "DevWebService", {
      env: props.stages.dev.env,
      stageName: "DEV",
    });

    codePipeline.addStage(deployDevLambdaStage, {
      post: [
        new ShellStep("TestDevService", {
          commands: ["curl -Ssf $ENDPOINT_URL"],
          envFromCfnOutputs: {
            ENDPOINT_URL: deployDevLambdaStage.urlOutput,
          },
        }),
      ],
    });

    const deployTestLambdaStage = new LambdaStage(this, "TestWebService", {
      env: props.stages.test.env,
      stageName: "TEST",
    });

    codePipeline.addStage(deployTestLambdaStage, {
      post: [
        new ShellStep("TestTestService", {
          commands: ["curl -Ssf $ENDPOINT_URL"],
          envFromCfnOutputs: {
            ENDPOINT_URL: deployTestLambdaStage.urlOutput,
          },
        }),
      ],
    });
  }
}
