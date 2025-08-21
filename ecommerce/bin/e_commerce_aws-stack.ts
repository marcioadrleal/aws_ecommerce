#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { ProductsAppStack } from '../lib/productsApp-stack';
import { EcommerceApiStack } from '../lib/ecommerceApi-stack';
import { ProductsAppLayersStack  } from '../lib/productsAppLayers-stack';
import { EventsDdbStack } from '../lib/eventsDdb-stack';


const app = new cdk.App();

const env: cdk.Environment = {
    account: "576463325238" ,
    region: "us-east-1"
}

const tags = {
    cost: "ECommerce" ,
    team: "marcioadrleal"
}

const productsAppLayerStack = new ProductsAppLayersStack(app,
     "ProductsAppLayer", { tags: tags , env : env})

const eventsDdbStack = new EventsDdbStack(app,"EventsDdb",{ tags: tags , env : env})

const produtsAppStack = new ProductsAppStack(app,"ProductsApp",{
    eventsDbd : eventsDdbStack.table ,
    tags: tags , 
    env: env })
produtsAppStack.addDependency(productsAppLayerStack)
produtsAppStack.addDependency(eventsDdbStack)
const eCommerceApiStack = 
   new EcommerceApiStack(app,"ECommerceApi",
     { productsFetchHandler: produtsAppStack.productsFetchHandler , productsAdminHandler: produtsAppStack.productsAdminHandler, tags: tags , env : env })

eCommerceApiStack.addDependency(produtsAppStack)     

