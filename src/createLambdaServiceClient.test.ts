import { createLambdaServiceClient } from './createLambdaServiceClient';
import { executeLambdaInvocation } from './executeLambdaInvocation';

jest.mock('./executeLambdaInvocation');
const executeLambdaInvocationMock = executeLambdaInvocation as jest.Mock;

describe('createLambdaServiceClient', () => {
  it('should be possible to create the client', () => {
    const invokeLambdaFunction = createLambdaServiceClient({ serviceName: 'awesome-svc', stage: 'prod' });
    expect(invokeLambdaFunction).toBeDefined(); // sanity check
  });
  it('should call executeLambdaInvocation correctly', async () => {
    const exampleEvent = '__EVENT__';
    const invokeLambdaFunction = createLambdaServiceClient({ serviceName: 'awesome-svc', stage: 'prod' });
    await invokeLambdaFunction({ functionName: 'doCoolThing', event: exampleEvent });
    expect(executeLambdaInvocationMock).toHaveBeenCalledWith({
      serviceName: 'awesome-svc',
      stage: 'prod',
      functionName: 'doCoolThing',
      event: exampleEvent,
    });
  });
  it('should call logDebug if passed in', async () => {
    const logDebugMock = jest.fn();
    const exampleEvent = '__EVENT__';
    const invokeLambdaFunction = createLambdaServiceClient({ serviceName: 'awesome-svc', stage: 'prod', logDebug: logDebugMock });
    await invokeLambdaFunction({ functionName: 'doCoolThing', event: exampleEvent });
    expect(logDebugMock).toHaveBeenCalledTimes(2);
    expect(logDebugMock).toHaveBeenCalledWith(`awesome-svc-prod-doCoolThing.invoke.input`, { event: exampleEvent });
    expect(logDebugMock).toHaveBeenCalledWith(`awesome-svc-prod-doCoolThing.invoke.output`, { result: undefined });
  });
});
