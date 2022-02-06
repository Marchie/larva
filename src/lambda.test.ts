import {APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context} from "aws-lambda";
import {handler} from "./lambda";

describe(`When handler is called`, () => {
    const event: APIGatewayProxyEventV2 = givenAPIGatewayProxyEventV2()
    const context: Context = givenContext()

    test(`Then the status code is 200 and the body is "Hello world!"`, async () => {
        const result: APIGatewayProxyResultV2 = await handler(event, context)

        const expectation: APIGatewayProxyResultV2 = {
            body: "Hello world!",
            statusCode: 200,
        }

        expect(result).toEqual(expectation)
    })
})

function givenAPIGatewayProxyEventV2(): APIGatewayProxyEventV2 {
    return {
        "version": "2.0",
        "routeKey": "$default",
        "rawPath": "/my/path",
        "rawQueryString": "parameter1=value1&parameter1=value2&parameter2=value",
        "cookies": [
            "cookie1",
            "cookie2"
        ],
        "headers": {
            "header1": "value1",
            "header2": "value1,value2"
        },
        "queryStringParameters": {
            "parameter1": "value1,value2",
            "parameter2": "value"
        },
        "requestContext": {
            "accountId": "123456789012",
            "apiId": "api-id",
            "authentication": {
                "clientCert": {
                    "clientCertPem": "CERT_CONTENT",
                    "subjectDN": "www.example.com",
                    "issuerDN": "Example issuer",
                    "serialNumber": "a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1",
                    "validity": {
                        "notBefore": "May 28 12:30:02 2019 GMT",
                        "notAfter": "Aug  5 09:36:04 2021 GMT"
                    }
                }
            },
            "domainName": "id.execute-api.us-east-1.amazonaws.com",
            "domainPrefix": "id",
            "http": {
                "method": "POST",
                "path": "/my/path",
                "protocol": "HTTP/1.1",
                "sourceIp": "IP",
                "userAgent": "agent"
            },
            "requestId": "id",
            "routeKey": "$default",
            "stage": "$default",
            "time": "12/Mar/2020:19:03:58 +0000",
            "timeEpoch": 1583348638390
        },
        "body": "Hello from Lambda",
        "pathParameters": {
            "parameter1": "value1"
        },
        "isBase64Encoded": false,
        "stageVariables": {
            "stageVariable1": "value1",
            "stageVariable2": "value2"
        }
    }
}

function givenContext(): Context {
    return {
        awsRequestId: "id",
        callbackWaitsForEmptyEventLoop: false,
        functionName: "lambda",
        functionVersion: "1",
        invokedFunctionArn: "aws:arn",
        logGroupName: "foo",
        logStreamName: "bar",
        memoryLimitInMB: "128",
        done(error?: Error, result?: any): void {
        },
        fail(error: Error | string): void {
        },
        getRemainingTimeInMillis(): number {
            return 0;
        },
        succeed(message: any, object?: any): void {
        }
    }
}
