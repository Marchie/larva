import {Construct} from "constructs";
import {Environment, SecretValue, Stack, StackProps} from "aws-cdk-lib";
import {CodePipeline, CodePipelineSource, ShellStep} from "aws-cdk-lib/pipelines";
import {GitHubTrigger} from "aws-cdk-lib/aws-codepipeline-actions";
import {LambdaStage} from "./lambda-stage";
import {StringParameter} from "aws-cdk-lib/aws-ssm";

export class PipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
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
                    "npm run test",
                    "npm run build",
                    "npx cdk synth",
                ],
            }),
        })

        const devEnv: Environment = {
            account: StringParameter.valueForStringParameter(this, "/dev/workloadAccountId"),
            region: StringParameter.valueForStringParameter(this, "/dev/workloadRegion"),
        }

        codePipeline.addStage(new LambdaStage(this, "Dev", {
            env: devEnv,
        }))
    }
}
