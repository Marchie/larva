#!/usr/bin/env node
import "source-map-support/register";
import { App } from "aws-cdk-lib";
import { PipelineStack } from "../lib/pipeline-stack";
import { PullRequestStack } from "../lib/pull-request-stack";

function getValueFromContextOrEnvironment(key: string): string {
  const value = app.node.tryGetContext(key) || process.env[key];
  if (!value) {
    throw new Error(`no ${key} in context or environment`);
  }

  return value;
}

const app = new App();

const ciCdAccount = getValueFromContextOrEnvironment("CDK_DEFAULT_ACCOUNT");
const ciCdRegion = getValueFromContextOrEnvironment("CDK_DEFAULT_REGION");
const devWorkloadAccount = getValueFromContextOrEnvironment(
  "DEV_WORKLOAD_ACCOUNT",
);
const devWorkloadRegion = getValueFromContextOrEnvironment(
  "DEV_WORKLOAD_REGION",
);
const testWorkloadAccount = getValueFromContextOrEnvironment(
  "TEST_WORKLOAD_ACCOUNT",
);
const testWorkloadRegion = getValueFromContextOrEnvironment(
  "TEST_WORKLOAD_REGION",
);

new PipelineStack(app, "PipelineStack", {
  description: "Deploys the Pipeline to the CI/CD account",
  env: {
    account: ciCdAccount,
    region: ciCdRegion,
  },
  stages: {
    dev: {
      env: {
        account: devWorkloadAccount,
        region: devWorkloadRegion,
      },
    },
    test: {
      env: {
        account: testWorkloadAccount,
        region: testWorkloadRegion,
      },
    },
  },
});

new PullRequestStack(app, "PullRequestStack", {
  description: "Runs checks on GitHub pull requests",
});

app.synth();
