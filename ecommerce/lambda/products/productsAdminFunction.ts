import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Context } from "vm";
import { Product, ProductRepository } from "/opt/nodejs/productsLayer";
import { DynamoDB , Lambda } from "aws-sdk"
import { ProductEvent, ProductEventType } from "/opt/nodejs/productEventsLayer";

const productsDdb = process.env.PRODUCTS_DDB!
const productEventsFunctionName = process.env.PRODUCT_EVENTS_FUNCTION_NAME!
const ddbClient = new DynamoDB.DocumentClient()
const productRepository = new ProductRepository(ddbClient, productsDdb)
const lambdaClient = new Lambda()


export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

    
    const lambdaContextId = context.awsRequestId;
    const requestEventID = event.requestContext.requestId;
    const method = event.httpMethod


    if (event.resource === "/products") {
        if (method === "POST") {
            const product = JSON.parse(event.body!) as Product
            try {
                const process = await productRepository.createProduct(product)
                await sendProductEvent(product,ProductEventType.CREATED,"marcioadr@hotmail.com",requestEventID)
                return {
                    statusCode: 201,
                    body: JSON.stringify(process)
                }
            } catch (erro) {
                return {
                    statusCode: 201,
                    body: JSON.stringify((<Error>erro).message)
                }
            }
        } else if (method === "DELETE") {
            const param = event.pathParameters!.id as string
            try {
                const deletedProduct = await productRepository.deleteProduct(param)
                await sendProductEvent(deletedProduct,ProductEventType.UPDATED,"marcioadr@hotmail.com",requestEventID)
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
        } else if (method === "PUT") {
            const param = event.pathParameters!.id as string
            const product = JSON.parse(event.body!) as Product
            try {
                const updatedProduct = await productRepository.updateProduct(param, product)
                await sendProductEvent(updatedProduct,ProductEventType.UPDATED,"marcioadr@hotmail.com",requestEventID)
                return {
                    statusCode: 200,
                    body: JSON.stringify(updatedProduct)
                }
            } catch (ConditionalCheckFailedException) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ message: 'product not found' })
                }
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

function sendProductEvent(product : Product , eventType : ProductEventType ,
                          email : string , lambdaRequestId: string ){
   const event: ProductEvent = {
      email: email,
      eventType: eventType,
      productCode: product.code ,
      productId: product.id ,
      productPrice: product.price ,
      requestId: lambdaRequestId
   }
   return lambdaClient.invoke({
     FunctionName : productEventsFunctionName ,
     Payload: JSON.stringify(event),
     InvocationType: "RequestResponse"
   }).promise()
}
