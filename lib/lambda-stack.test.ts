import {App, CfnOutput} from 'aws-cdk-lib';
import {Template} from 'aws-cdk-lib/assertions';
import {LambdaStack, LambdaStage} from "./lambda-stack";
import {FunctionProps} from "aws-cdk-lib/aws-lambda/lib/function";
import {Code, Runtime} from "aws-cdk-lib/aws-lambda";
import {resolve} from "path";
import {HttpApiProps, HttpIntegrationProps} from "@aws-cdk/aws-apigatewayv2-alpha";
import {HttpLambdaIntegrationProps} from "@aws-cdk/aws-apigatewayv2-integrations-alpha";

describe('LambdaStack', () => {
    const app = new App();
    const stack = new LambdaStack(app, 'MyTestStack', {
        env: {
            account: '111111111111',
            region: 'mars-north-8',
        },
        stageName: 'unittest'
    });
    const template = Template.fromStack(stack);

    test(`Given a CDK App
When a LambdaStack is synthesised
Then a Lambda function is created`, () => {
        template.hasResourceProperties('AWS::Lambda::Function', {
            Runtime: Runtime.NODEJS_14_X.toString(),
            Handler: "lambda.handler",
            Environment: {
                Variables: {
                    ACCOUNT_ID: '111111111111',
                    STAGE_NAME: 'unittest',
                }
            }
        });
    })

    test(`Given a CDK App
When a LambdaStack is synthesised
Then a Lambda function Alias is created`, () => {
        template.hasResourceProperties('AWS::Lambda::Alias', {});
    })

    test(`Given a CDK App
When a LambdaStack is synthesised
Then an API Gateway is created`, () => {
        template.hasResourceProperties("AWS::ApiGatewayV2::Api", {
            Name: "LarvaGateway",
            ProtocolType: "HTTP",
        })

        template.hasResourceProperties("AWS::ApiGatewayV2::Stage", {
            StageName: "$default",
            AutoDeploy: true,
        })

        template.hasResourceProperties("AWS::ApiGatewayV2::Integration", {
            IntegrationType: "AWS_PROXY",
            PayloadFormatVersion: "2.0",
        })

        template.hasResourceProperties("AWS::Lambda::Permission", {
            Action: "lambda:InvokeFunction",
            Principal: "apigateway.amazonaws.com",
        })

        template.hasResourceProperties("AWS::ApiGatewayV2::Route", {
            RouteKey: "GET /",
            AuthorizationType: "NONE"
        })
    })

    test(`Given a CDK App
When a LambdaStack is synthesised
Then a CloudWatch Alarm for API Gateway 5XX errors is created`, () => {
        template.hasResourceProperties("AWS::CloudWatch::Alarm", {
            ComparisonOperator: "GreaterThanOrEqualToThreshold",
            EvaluationPeriods: 1,
            Threshold: 1,
            MetricName: "5XXError",
            Namespace: "AWS/ApiGateway",
            Period: 60,
            Statistic: "Sum",
            Dimensions: [
                {
                    Name: "ApiName",
                    Value: "LarvaGateway"
                }
            ]
        })
    })

    test(`Given a CDK App
When a LambdaStack is synthesised
Then a CodeDeploy DeploymentGroup is created`, () => {
        template.hasResourceProperties("AWS::CodeDeploy::DeploymentGroup", {
            DeploymentConfigName: "CodeDeployDefault.LambdaCanary10Percent5Minutes",
            AutoRollbackConfiguration: {
                Enabled: true,
                Events: [
                    "DEPLOYMENT_FAILURE",
                    "DEPLOYMENT_STOP_ON_ALARM"
                ]
            },
            AlarmConfiguration: {
                Enabled: true
            }
        })
    })

    test(`Given a CDK App
When a LambdaStack is synthesised
Then the Service URL is output`, () => {
        template.hasOutput("LarvaURL", {})
    })
});
