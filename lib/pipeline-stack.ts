import {Construct} from "constructs";
import {Environment, SecretValue, Stack, StackProps} from "aws-cdk-lib";
import {CodePipeline, CodePipelineSource, ShellStep} from "aws-cdk-lib/pipelines";
import {GitHubTrigger} from "aws-cdk-lib/aws-codepipeline-actions";
import {LambdaStage} from "./lambda-stack";

interface PipelineStackProps extends StackProps {
    stages: {
        id: string,
        env: Environment,
    }[]
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

        const {stages} = props

        stages.forEach(({id, env}) => {
            const deployLambdaStage = new LambdaStage(this, id, {
                env,
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
        })
    }
}
