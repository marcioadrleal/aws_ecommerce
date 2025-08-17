import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Context } from "vm";

export async function handler(event: APIGatewayProxyEvent, context: Context):
    Promise<APIGatewayProxyResult> {

    const lambdaContextId = context.awsRequestId;
    const requestEventID = event.requestContext.requestId;
    console.log(`API GATEWAY Request Id: ${requestEventID} - Lambda RequestId: ${lambdaContextId}`)
    const method = event.httpMethod
    if (event.resource === "/products") {
        if (method === 'GET') {
            console.log('GET')
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "GET Products OK"
                })
            }
        }
    }

    return {
        statusCode: 400,
        body: JSON.stringify({
            message: "BAD REQUEST"
        })
    }
}