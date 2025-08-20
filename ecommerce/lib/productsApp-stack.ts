import * as lambda from "aws-cdk-lib/aws-lambda"
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs"
import * as cdk from "aws-cdk-lib"
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import { Construct } from "constructs"
import * as ssm from "aws-cdk-lib/aws-ssm"

export class ProductsAppStack extends cdk.Stack {

   readonly productsAdminHandler: lambdaNodeJS.NodejsFunction;
   readonly productsFetchHandler: lambdaNodeJS.NodejsFunction;
   readonly productsDbd: dynamodb.Table



   constructor(scope: Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);
      this.productsDbd = new dynamodb.Table(this, "ProductsDbd", {
         tableName: "products",
         removalPolicy: cdk.RemovalPolicy.DESTROY,
         partitionKey: {
            name: "id",
            type: dynamodb.AttributeType.STRING
         },
         billingMode: dynamodb.BillingMode.PROVISIONED,
         readCapacity: 1,
         writeCapacity: 1
      })

      const productsLayerArn = ssm.StringParameter.valueForStringParameter(this, "ProductsLayerVersionArn")
      const productLayer = lambda.LayerVersion.fromLayerVersionArn(this, "ProductsLayerVersionArn", productsLayerArn)




      this.productsAdminHandler = new lambdaNodeJS.NodejsFunction(this, "ProductsAdminFunction", {
         runtime: lambda.Runtime.NODEJS_22_X,
         functionName: "ProductsAdminFunction",
         entry: "lambda/products/productsAdminFunction.ts",
         memorySize: 512,
         timeout: cdk.Duration.seconds(10),
         bundling: {
            minify: true,
            sourceMap: false
         },
         environment: {
            PRODUCTS_DDB: this.productsDbd.tableName
         },
         layers: [productLayer],
         tracing: lambda.Tracing.ACTIVE

      })

      this.productsFetchHandler = new lambdaNodeJS.NodejsFunction(this, "ProductsFetchFunction", {
         runtime: lambda.Runtime.NODEJS_22_X,
         functionName: "ProductsFetchFunction",
         entry: "lambda/products/productsFetchFunction.ts",
         handler: "handler",
         memorySize: 512,
         timeout: cdk.Duration.seconds(10),
         bundling: {
            minify: true,
            sourceMap: false
         },
         environment: {
            PRODUCTS_DDB: this.productsDbd.tableName
         },
         layers: [productLayer],
         tracing: lambda.Tracing.ACTIVE
      })
      this.productsDbd.grantReadData(this.productsFetchHandler)
      this.productsDbd.grantWriteData(this.productsAdminHandler)
   }
}