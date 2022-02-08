import {Construct} from "constructs";
import {SecretValue, Stack, StackProps} from "aws-cdk-lib";
import {CodePipeline, CodePipelineSource, ShellStep} from "aws-cdk-lib/pipelines";
import {GitHubTrigger} from "aws-cdk-lib/aws-codepipeline-actions";
import {LambdaStage} from "./lambda-stack";
import {ssmStringParameterLookupWithDummyValue} from "./ssm-string-parameter-lookup-with-dummy-value";

interface PipelineStackProps extends StackProps {
    env: {
        account: string
        region: string
    }
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
                    "npm run test",
                    "npm run build",
                    "npx cdk synth",
                ],
            }),
        })

        const devWorkloadAccountId = ssmStringParameterLookupWithDummyValue(this, "/dev/workload/accountId", "accountid")
        const devWorkloadRegion = ssmStringParameterLookupWithDummyValue(this, "/dev/workload/region", "mars-north-8")

        const deployLambdaStage = new LambdaStage(this, "DevWebService", {
            env: {
                account: devWorkloadAccountId,
                region: devWorkloadRegion,
            },
            stageName: "DEV"
        })

        codePipeline.addStage(deployLambdaStage, {
            post: [
                new ShellStep("TestService", {
                    commands: [
                        'curl -Ssf $ENDPOINT_URL'
                    ],
                    envFromCfnOutputs: {
                        ENDPOINT_URL: deployLambdaStage.urlOutput,
                    }
                })
            ]
        })
    }
}
