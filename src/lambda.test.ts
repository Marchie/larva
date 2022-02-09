import {APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context} from "aws-lambda";
import {handler} from "./lambda";

describe(`Lambda function`, () => {
    const originalEnvironment = process.env
    const stageName = "foo"
    const accountId = "123456789012"
    const event = givenAPIGatewayProxyEventV2()
    const context = givenContext()

    beforeEach(() => {
        jest.resetModules()
        process.env = {...originalEnvironment}
    })

    afterAll(() => {
        process.env = originalEnvironment
    })

    test(`Given the environment is correctly configured
When the Lambda function is invoked
Then the status code is 200 and the stage name and first four digits of the account ID are included in the body`, async () => {
        process.env.ACCOUNT_ID = accountId
        process.env.STAGE_NAME = stageName

        const result: APIGatewayProxyResultV2 = await handler(event, context)

        const expectation: APIGatewayProxyResultV2 = {
            body: `Hello from foo (1234)!`,
            statusCode: 200,
        }

        expect(result).toEqual(expectation)
    })

    test(`Given the environment is missing the ACCOUNT_ID
When the Lambda function is invoked 
Then the status code is 500 and the body describes the error"`, async () => {
        process.env.STAGE_NAME = stageName

        const result: APIGatewayProxyResultV2 = await handler(event, context)

        const expectation: APIGatewayProxyResultV2 = {
            body: `ACCOUNT_ID is not defined`,
            statusCode: 500,
        }

        expect(result).toEqual(expectation)
    })

    test(`Given the environment is missing the STAGE_NAME
When the Lambda function is invoked
Then the status code is 500 and the body describes the error"`, async () => {
        process.env.ACCOUNT_ID = accountId

        const result: APIGatewayProxyResultV2 = await handler(event, context)

        const expectation: APIGatewayProxyResultV2 = {
            body: `STAGE_NAME is not defined`,
            statusCode: 500,
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
