import {Construct} from "constructs";
import {Stack, StackProps} from "aws-cdk-lib";
import {CodePipeline, CodePipelineSource, ShellStep} from "aws-cdk-lib/pipelines";

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
            })
        })
    }
}
