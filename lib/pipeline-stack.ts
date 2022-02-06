import {Construct} from "constructs";
import {Stack, StackProps} from "aws-cdk-lib";
import {CodePipeline, CodePipelineSource, ShellStep} from "aws-cdk-lib/pipelines";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";

export class PipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const codePipeline = new CodePipeline(this, "Pipeline", {
            pipelineName: "Larva",
            crossAccountKeys: true,
            selfMutation: true,
            synth: new ShellStep("Synth", {
                input: CodePipelineSource.gitHub("Marchie/larva", "main"),
                commands: [
                    "npm ci",
                    "npm run build",
                    "npx cdk synth",
                ],
            }),
            codeBuildDefaults: {
                rolePolicy: [
                    new PolicyStatement({
                        actions: [
                            "sts:AssumeRole",
                            "iam:PassRole",
                        ],
                        effect: Effect.ALLOW,
                        resources: [
                            `arn:aws:iam::${this.account}:role/cdk-hnb659fds-lookup-role-${this.account}-${this.region}`,
                            `arn:aws:iam::${this.account}:role/cdk-hnb659fds-deploy-role-${this.account}-${this.region}`,
                        ]
                    })
                ]
            }
        })
    }
}
