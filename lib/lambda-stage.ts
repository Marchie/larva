import {CfnOutput, Stage, StageProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {LambdaStack} from "./lambda-stack";

export class LambdaStage extends Stage {
    public readonly urlOutput: CfnOutput;

    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        const service = new LambdaStack(this, "Webservice");

        this.urlOutput = service.urlOutput
    }
}
