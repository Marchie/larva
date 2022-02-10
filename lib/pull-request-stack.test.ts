import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { PullRequestStack } from "./pull-request-stack";

describe("PullRequestStack", () => {
  const app = new App();
  const stack = new PullRequestStack(app, "MyTestStack");
  const template = Template.fromStack(stack);

  test(`Given a CDK App
When a PullRequestStack is synthesized
Then a CodeBuild SourceCredential resource for GitHub is created`, () => {
    template.hasResourceProperties("AWS::CodeBuild::SourceCredential", {
      AuthType: "PERSONAL_ACCESS_TOKEN",
      ServerType: "GITHUB",
      Token: "{{resolve:secretsmanager:github-token:SecretString:::}}",
    });
  });

  test(`Given a CDK App
When a PullRequestStack is synthesized
Then a CodeBuild Project is created`, () => {
    template.hasResourceProperties("AWS::CodeBuild::Project", {
      Artifacts: {
        Type: "NO_ARTIFACTS",
      },
      Environment: {
        ComputeType: "BUILD_GENERAL1_SMALL",
        Image: "aws/codebuild/standard:5.0",
      },
      Source: {
        Type: "GITHUB",
        ReportBuildStatus: true,
        Location: "https://github.com/Marchie/larva.git",
      },
      Triggers: {
        FilterGroups: [
          [
            {
              Pattern:
                "PULL_REQUEST_CREATED, PULL_REQUEST_UPDATED, PULL_REQUEST_REOPENED",
              Type: "EVENT",
            },
            {
              Pattern: "refs/heads/main",
              Type: "BASE_REF",
            },
          ],
        ],
        Webhook: true,
      },
    });
  });
});
