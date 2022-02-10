import {
  CfnOutput,
  Duration,
  Environment,
  Stack,
  StackProps,
  Stage,
  StageProps,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { Alias, Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { resolve } from "path";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import {
  LambdaDeploymentConfig,
  LambdaDeploymentGroup,
} from "aws-cdk-lib/aws-codedeploy";
import { Alarm, Metric } from "aws-cdk-lib/aws-cloudwatch";

interface LambdaStackProps extends StackProps {
  env: {
    account: string;
    region: string;
  };
  stageName: string;
}

export class LambdaStack extends Stack {
  public readonly urlOutput: CfnOutput;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const {
      env: { account },
      stageName,
    } = props;

    const handler = new Function(this, "LarvaLambda", {
      code: Code.fromAsset(resolve(__dirname, "..", "src")),
      handler: "lambda.handler",
      runtime: Runtime.NODEJS_14_X,
      environment: {
        ACCOUNT_ID: account,
        STAGE_NAME: stageName,
      },
    });

    const alias = new Alias(this, "LarvaLambdaAlias", {
      aliasName: "Current",
      version: handler.currentVersion,
    });

    const apiGatewayIntegration = new HttpLambdaIntegration(
      "LarvaGatewayIntegation",
      alias,
    );

    const gatewayId = "LarvaGateway";
    const gateway = new HttpApi(this, gatewayId, {
      description: "Endpoint for a simple Lambda-powered web service",
    });

    gateway.addRoutes({
      path: "/",
      methods: [HttpMethod.GET],
      integration: apiGatewayIntegration,
    });

    const gateway5XXFailureAlarm = new Alarm(this, "Larva5XXFailureAlarm", {
      alarmDescription: "A 5XX error code is returned to the API Gateway",
      metric: new Metric({
        metricName: "5XXError",
        namespace: "AWS/ApiGateway",
        dimensionsMap: {
          ApiName: gatewayId,
        },
        period: Duration.minutes(1),
        statistic: "Sum",
      }),
      evaluationPeriods: 1,
      threshold: 1,
    });

    new LambdaDeploymentGroup(this, "LarvaDeploymentGroup", {
      alias,
      deploymentConfig: LambdaDeploymentConfig.CANARY_10PERCENT_5MINUTES,
      alarms: [gateway5XXFailureAlarm],
    });

    this.urlOutput = new CfnOutput(this, "LarvaURL", {
      value: gateway.apiEndpoint,
    });
  }
}

interface LambdaStageProps extends StageProps {
  env: {
    account: string;
    region: string;
  };
  stageName: string;
}

export class LambdaStage extends Stage {
  public readonly urlOutput: CfnOutput;

  constructor(scope: Construct, id: string, props: LambdaStageProps) {
    super(scope, id, props);

    const service = new LambdaStack(this, "Webservice", props);

    this.urlOutput = service.urlOutput;
  }
}
