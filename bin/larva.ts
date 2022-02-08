#!/usr/bin/env node
import 'source-map-support/register';
import {App} from 'aws-cdk-lib';
import {PipelineStack} from "../lib/pipeline-stack";

if (!process.env.CDK_DEFAULT_ACCOUNT) {
    throw new Error("CDK_DEFAULT_ACCOUNT is not set in environment")
}

if (!process.env.CDK_DEFAULT_REGION) {
    throw new Error("CDK_DEFAULT_REGION is not set in environment")
}

const app = new App();

new PipelineStack(app, "PipelineStack", {
    description: "Deploys the Pipeline to the CI/CD account",
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    }
})

app.synth();
