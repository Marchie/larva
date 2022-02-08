import {Construct} from "constructs";
import {CfnOutput, Environment, Fn, SecretValue, Stack, StackProps} from "aws-cdk-lib";
import {CodePipeline, CodePipelineSource, ShellStep} from "aws-cdk-lib/pipelines";
import {GitHubTrigger} from "aws-cdk-lib/aws-codepipeline-actions";
import {LambdaStage} from "./lambda-stack";
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

        const devWorkloadAccountIdExportName = "devWorkloadAccountId"
        new CfnOutput(this, "DevWorkloadAccountId", {
            value: StringParameter.fromStringParameterName(this, "devWorkloadAccountId", "/dev/workload/accountId").stringValue,
            exportName: devWorkloadAccountIdExportName,
        })

        const devWorkloadRegionExportName = "devWorkloadRegion"
        new CfnOutput(this, "DevWorkloadRegion", {
            value: StringParameter.fromStringParameterName(this, "devWorkloadRegion", "/dev/workload/region").stringValue,
            exportName: devWorkloadRegionExportName,
        })

        const deployLambdaStage = new LambdaStage(this, id, {
            env: {
                account: Fn.importValue(devWorkloadAccountIdExportName),
                region: Fn.importValue(devWorkloadRegionExportName),
            }
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
