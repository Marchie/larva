import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  Context,
} from "aws-lambda";

export async function handler(
  event: APIGatewayProxyEventV2,
  context: Context,
): Promise<APIGatewayProxyResultV2> {
  if (!process.env.ACCOUNT_ID) {
    return {
      body: `ACCOUNT_ID is not defined`,
      statusCode: 500,
    };
  }

  if (!process.env.STAGE_NAME) {
    return {
      body: `STAGE_NAME is not defined`,
      statusCode: 500,
    };
  }

  return {
    body: `Hello from ${
      process.env.STAGE_NAME
    } (${process.env.ACCOUNT_ID.substring(0, 4)})!`,
    statusCode: 400,
  };
}
