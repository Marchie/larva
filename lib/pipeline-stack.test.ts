import {App} from "aws-cdk-lib";
import {Template} from "aws-cdk-lib/assertions";
import {PipelineStack} from "./pipeline-stack";

describe('PipelineStack', () => {
    const app = new App();
    const stack = new PipelineStack(app, 'MyTestStack', {
        env: {
            account: '111111111111',
            region: 'mars-north-1',
        },
        stages: {
            dev: {
                env: {
                    account: '222222222222',
                    region: 'mars-south-2',
                }
            },
            test: {
                env: {
                    account: '333333333333',
                    region: 'mars-west-3',
                }
            }
        }
    });

    const template = Template.fromStack(stack);

    test(`Given a CDK App
When a PipelineStack is synthesised
Then a CodePipeline is created`, () => {
        template.hasResourceProperties("AWS::CodePipeline::Pipeline", {
            Stages: [
                {
                    Name: "Source"
                },
                {
                    Name: "Build"
                },
                {
                    Name: "UpdatePipeline"
                },
                {
                    Name: "Assets"
                },
                {
                    Name: "DevWebService"
                },
                {
                    Name: "TestWebService"
                }
            ]
        })
    })
})
