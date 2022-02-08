import {Construct} from "constructs";
import {ContextProvider as cxContextProvider} from '@aws-cdk/cloud-assembly-schema';
import {ContextProvider} from "aws-cdk-lib";

export function ssmStringParameterLookupWithDummyValue(
    scope: Construct,
    parameterName: string,
    dummyValue: string
): string {
    return ContextProvider.getValue(scope, {
        provider: cxContextProvider.SSM_PARAMETER_PROVIDER,
        props: {
            parameterName,
        },
        dummyValue: dummyValue,
    }).value;
}
