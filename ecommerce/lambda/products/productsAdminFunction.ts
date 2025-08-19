import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Context } from "vm";
import { Product, ProductRepository } from "/opt/nodejs/productsLayer";
import { DynamoDB } from "aws-sdk"


const productsDdb = process.env.PRODUCTS_DDB!
const ddbClient = new DynamoDB.DocumentClient()
const productRepository = new ProductRepository(ddbClient, productsDdb)

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

    const lambdaContextId = context.awsRequestId;
    const requestEventID = event.requestContext.requestId;
    const method = event.httpMethod
    if (event.resource === "/products") {
        if (method === 'POST') {
            const product = JSON.parse(event.body!) as Product
            const process = await productRepository.createProduct(product)
            return {
                statusCode: 201,
                body: JSON.stringify(process)
            }
        }
    } else if (event.resource === "/products/{id}") {
        const param = event.pathParameters!.id as string

        if (method === "PUT") {
            const product = JSON.parse(event.body!) as Product
            const updatedProduct = await productRepository.updateProduct(param, product)
            return {
                statusCode: 200,
                body: JSON.stringify(updatedProduct)
            }

        } else if (method === "DELETE") {
            try {
                const deletedProduct = await productRepository.deleteProduct(param)
                return {
                    statusCode: 200,
                    body: JSON.stringify(deletedProduct)
                }
            } catch (erro) {
                return {
                    statusCode: 400,
                    body: JSON.stringify(
                        {
                            message: (<Error>erro).message
                        }
                    )
                }
            }

        }


        return {
            statusCode: 400,
            body: JSON.stringify({
                message: `Erro: Invalid Method ${param}`
            })
        }
    }


    return {
        statusCode: 400,
        body: JSON.stringify({
            message: "BAD REQUEST"
        })
    }

}