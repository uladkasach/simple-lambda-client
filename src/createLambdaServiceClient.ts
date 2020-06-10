import { executeLambdaInvocation } from './executeLambdaInvocation';

export type LogMethod = (message: string, metadata: any) => void;
export const createLambdaServiceClient = ({ serviceName, stage, logDebug }: { serviceName: string; stage: string; logDebug?: LogMethod }) => {
  const invokeLambdaFunction = async <O = any, I = any>({ functionName, event }: { functionName: string; event: I }): Promise<O> => {
    if (logDebug) logDebug(`${serviceName}-${stage}-${functionName}.invoke.input`, { event });
    const result = await executeLambdaInvocation({ serviceName, stage, functionName, event });
    if (logDebug) logDebug(`${serviceName}-${stage}-${functionName}.invoke.output`, { result });
    return result;
  };
  return invokeLambdaFunction;
};
