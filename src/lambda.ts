import {APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context} from 'aws-lambda';

export async function handler(event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResultV2> {
    return {
        body: 'Hello world!',
        statusCode: 200,
    }
}
