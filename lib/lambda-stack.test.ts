import {App, CfnOutput} from 'aws-cdk-lib';
import {Template} from 'aws-cdk-lib/assertions';
import {LambdaStack} from "./lambda-stack";
import {FunctionProps} from "aws-cdk-lib/aws-lambda/lib/function";
import {Code, Runtime} from "aws-cdk-lib/aws-lambda";
import {resolve} from "path";
import {HttpApiProps, HttpIntegrationProps} from "@aws-cdk/aws-apigatewayv2-alpha";
import {HttpLambdaIntegrationProps} from "@aws-cdk/aws-apigatewayv2-integrations-alpha";

describe('Given Larva app', () => {
    const app = new App();

    describe('When a Lambda stack is created', () => {
        const stack = new LambdaStack(app, 'MyTestStack');
        const template = Template.fromStack(stack);

        test(`Then a Lambda function is created`, () => {
            template.hasResourceProperties('AWS::Lambda::Function', {
                Runtime: Runtime.NODEJS_14_X.toString(),
                Handler: "lambda.handler",
            });
        })

        test(`Then an API Gateway is created`, () => {
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
    })
});
