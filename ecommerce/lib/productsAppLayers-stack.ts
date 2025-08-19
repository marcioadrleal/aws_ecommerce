import * as cdk from "aws-cdk-lib"
import * as lambda from "aws-cdk-lib/aws-lambda"
import { Construct } from "constructs"
import * as ssm from "aws-cdk-lib/aws-ssm"


export class ProductsAppLayersStack extends cdk.Stack{

    readonly productsLayer: lambda.LayerVersion
    
    constructor(scope : Construct , id : string , props?: cdk.StackProps){
        super(scope,id, props)
        this.productsLayer = new lambda.LayerVersion(this,
            "ProductLayer" ,
            { code: lambda.Code.fromAsset('lambda/products/layers/productLayer') ,
              compatibleRuntimes : [ lambda.Runtime.NODEJS_22_X ] ,
              layerVersionName: "ProductLayer",
              removalPolicy: cdk.RemovalPolicy.RETAIN
            }
        )
        new ssm.StringParameter(this,"ProductsLayerVersionArn" , {
            parameterName: "ProductsLayerVersionArn" ,
            stringValue: this.productsLayer.layerVersionArn  
        })
    }

}