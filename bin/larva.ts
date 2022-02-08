#!/usr/bin/env node
import 'source-map-support/register';
import {App} from 'aws-cdk-lib';
import {PipelineStack} from "../lib/pipeline-stack";

const app = new App();

new PipelineStack(app, "PipelineStack", {
    description: "Deploys the Pipeline to the CI/CD account",
    env: {
        account: process.env.AWS_CI_CD_ACCOUNT,
        region: process.env.AWS_CI_CD_REGION,
    },
    stages: [
        {
            id: "Dev",
            env: {
                account: process.env.AWS_DEV_WORKLOAD_ACCOUNT,
                region: process.env.AWS_DEV_WORKLOAD_REGION,
            }
        }
    ]
})

app.synth();
