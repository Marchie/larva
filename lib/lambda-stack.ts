import {CfnOutput, Stack, StackProps, Stage, StageProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Code, Function, Runtime} from 'aws-cdk-lib/aws-lambda';
import {resolve} from "path";
import {HttpApi, HttpMethod} from "@aws-cdk/aws-apigatewayv2-alpha"
import {HttpLambdaIntegration} from "@aws-cdk/aws-apigatewayv2-integrations-alpha"

export class LambdaStack extends Stack {
    public readonly urlOutput: CfnOutput;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const handler = new Function(this, "LarvaLambda", {
            code: Code.fromAsset(resolve(__dirname, "..", "src")),
            handler: "lambda.handler",
            runtime: Runtime.NODEJS_14_X,
        });

        const gwIntegration = new HttpLambdaIntegration("LarvaGatewayIntegation", handler);

        const gw = new HttpApi(this, "LarvaGateway", {
            description: "Endpoint for a simple Lambda-powered web service",
        });

        gw.addRoutes({
            path: "/",
            methods: [
                HttpMethod.GET,
            ],
            integration: gwIntegration,
        })

        this.urlOutput = new CfnOutput(this, 'URL', {
            value: gw.apiEndpoint
        })
    }
}

export class LambdaStage extends Stage {
    public readonly urlOutput: CfnOutput;

    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        const service = new LambdaStack(this, "Webservice");

        this.urlOutput = service.urlOutput
    }
}
