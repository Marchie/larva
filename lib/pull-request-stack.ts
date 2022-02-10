import { SecretValue, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  BuildSpec,
  ComputeType,
  EventAction,
  FilterGroup,
  GitHubSourceCredentials,
  LinuxBuildImage,
  Project,
  Source,
} from "aws-cdk-lib/aws-codebuild";

export class PullRequestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new GitHubSourceCredentials(this, "GitHubSourceCredentials", {
      accessToken: SecretValue.secretsManager("github-token"),
    });

    const source = Source.gitHub({
      owner: "Marchie",
      repo: "larva",
      reportBuildStatus: true,
      webhook: true,
      webhookFilters: [
        FilterGroup.inEventOf(
          EventAction.PULL_REQUEST_CREATED,
          EventAction.PULL_REQUEST_UPDATED,
          EventAction.PULL_REQUEST_REOPENED,
        ).andBaseBranchIs("main"),
      ],
    });

    new Project(this, "PullRequestChecks", {
      projectName: "Larva pull request checks",
      description:
        "Runs unit tests, linting checks and static analysis of dependencies for known security vulnerabilities",
      badge: true,
      source,
      environment: {
        buildImage: LinuxBuildImage.STANDARD_5_0,
        computeType: ComputeType.SMALL,
      },
      buildSpec: BuildSpec.fromObject({
        version: "0.2",
        phases: {
          pre_build: {
            commands: ["npm ci"],
          },
          build: {
            commands: ["npm run test -- --ci", "npm run lint", "npm audit"],
          },
        },
      }),
    });
  }
}
