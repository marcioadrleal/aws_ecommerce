import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Context } from "vm";
import { ProductRepository } from "/opt/nodejs/productsLayer";
import { DynamoDB } from "aws-sdk"

const productsDdb = process.env.PRODUCTS_DDB!
const ddbClient = new DynamoDB.DocumentClient()
const productRepository = new ProductRepository(ddbClient, productsDdb)

export async function handler(event: APIGatewayProxyEvent, context: Context):
    Promise<APIGatewayProxyResult> {

    const lambdaContextId = context.awsRequestId;
    const requestEventID = event.requestContext.requestId;
    console.log(`API GATEWAY Request Id: ${requestEventID} - Lambda RequestId: ${lambdaContextId}`)
    const method = event.httpMethod
    if (event.resource === "/products") {
        if (method === 'GET') {

            const products = await productRepository.getAllProducts()

            return {
                statusCode: 200,
                body: JSON.stringify(products)
            }
        }
    } else if (event.resource === "/products/{id}") {
        const param = event.pathParameters!.id as string
        try {
            const product = await productRepository.getProductById(param)

            return {
                statusCode: 200,
                body: JSON.stringify(product)
            }
        } catch (error) {
            return {
                statusCode: 404,
                body: JSON.stringify((<Error>error).message)
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