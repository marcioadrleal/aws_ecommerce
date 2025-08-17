#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { ProductsAppStack } from '../lib/productsApp-stack';
import { EcommerceApiStack } from '../lib/ecommerceApi-stack';

const app = new cdk.App();

const env: cdk.Environment = {
    account: "576463325238" ,
    region: "us-east-1"
}

const tags = {
    cost: "ECommerce" ,
    team: "marcioadrleal"
}

const produtsAppStack = new ProductsAppStack(app,"ProductsApp",{ tags: tags , env: env })

const eCommerceApiStack = 
   new EcommerceApiStack(app,"ECommerceApi",
     { produsFetchHandler: produtsAppStack.productsFetchHandles ,tags: tags , env : env })

eCommerceApiStack.addDependency(produtsAppStack)     

