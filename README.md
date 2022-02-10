# larva
_An immature, grub-like bee intermediate between egg and pupal stages_

My experimentation with AWS CDK Pipelines!

## Goals
* [x] Check out the possibility of deploying a "serverless" application from a central CI/CD account to
        multiple workload accounts using an AWS CodePipeline. (i.e. One pipeline to deploy to "Dev", "Test", ..., 
        "Pre-prod", "Prod".)
* [x] Code for the infrastructure and the application should live together in the same repository. (i.e.
        It should be within the gift of the development team to define the application infrastructure and 
        easily add stages to the pipeline when appropriate.)
* [ ] Checks that run automatically on creation of a GitHub pull request. (i.e. We should be able to validate work
        before it gets merged into a named branch, e.g. `main`, `develop`, etc.)
* [ ] Synthetic load to test canary deployments during stage deployments.

## CDK

The `cdk.json` file tells the CDK Toolkit how to execute your app.

The `cdk.context.json` file contains context for the app:

* `DEV_WORKLOAD_ACCOUNT`   AWS Account ID for the "Dev" workload account
* `DEV_WORKLOAD_REGION`    AWS Region for the "Dev" workload account
* `TEST_WORKLOAD_ACCOUNT`  AWS Account ID for the "Test" workload account
* `TEST_WORKLOAD_REGION`   AWS Region for the "Test" workload account

Obviously if you are using this code yourself, replace these values as appropriate. (_No, you may not have access
to my AWS Accounts!_ :upside_down_face:)

### A note on cdk.context.json

**TODO:** My preference would be to store these values in AWS Systems Manager Parameter Store in the CI/CD account, 
but I have struggled to find a way to do this while having the values accessible in the "Dev" and "Test" stages in the
pipeline.

Trying to bring in the values using `ParameterString.fromStringParameterName()` results in:

```shell
[Container] 2022/02/07 15:56:59 Running command npx cdk synth
You cannot add a dependency from 'PipelineStack/DevWebService/WebService' (in Stage 'PipelineStack/DevWebService') to 'PipelineStack' (in the App): dependency cannot cross stage boundaries
```

I have found [a blog post](https://medium.com/swlh/aws-cdk-pipelines-real-world-tips-and-tricks-part-1-544601c3e90b#:~:text=Passing%20variables%20between%20stages%20is,value%20in%20the%20target%20stage.)
which suggests a way of achieving this, but I would like to reassure myself about how secure the parameter store access
is by doing this. (On first glance, it feels messy and I don't really like it...!)

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy the pipeline to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

**NB:** You can specify a profile for the `cdk` commands using the `--profile` flag; 
e.g. `cdk deploy --profile my-ci-cd-account`

## Useful resources

* [CDK Pipelines documentation](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.pipelines-readme.html): Official
    documentation.
* [CDK Pipelines: Continuous delivery for AWS CDK applications](https://aws.amazon.com/blogs/developer/cdk-pipelines-continuous-delivery-for-aws-cdk-applications/):
    A really useful guide into how to go about building a CDK Pipeline. I have largely followed this, but updated my
    code to use AWS CDK v2.
* [Enhanced CI/CD with AWS CDK - AWS Online Tech Talks](https://www.youtube.com/watch?v=1ps0Wh19MHQ): A video introducing
    concepts around CDK Pipelines and demonstrating how to create one. The language used in the demonstration is Python,
    however the Python API seems very similar to Typescript API, so it was easy enough to follow. It gets particularly 
    interesting later on in the video where the pipeline includes a canary deployment. (i.e. the updated code is served
    to a proportion of users for a period of time; if the updated code triggers a CloudWatch Alarm once it has been
    deployed, then CodeDeploy automatically cancels the deployment and rolls back to the previous version.)
* [GitHub repository for the demo in the Enhanced CI/CD with AWS CDK - AWS Online Tech Talks video](https://github.com/aws-samples/cdk-pipelines-demo/tree/typescript):
    Typescript source for the demo.
* [AWS re:Invent 2021 - Automating cross-account CI/CD pipelines](https://www.youtube.com/watch?v=AF-pSRSGNks): A video
    which goes a bit more in depth on how one might build a CodePipeline in a more "traditional" way. (i.e. _not_ using
    the CDK Pipelines construct library.) This is a bit heavier on "raw" CloudFormation - probably a bit beyond where
    I am, but useful to see how parameters are being passed into the pipeline.
* [GitHub repository for the demo in the Automating cross-account CI/CD pipelines video](https://github.com/aws-samples/automate-cross-account-cicd-cfn-cdk):
    Always nice to look at the source!
* [Automating safe, hands-off deployments](https://aws.amazon.com/builders-library/automating-safe-hands-off-deployments/): 
    Something to aspire to!
