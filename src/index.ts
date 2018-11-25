import { UnsuccessfulStatusCodeError, LambdaInvocationError } from './errors';
import executeLambdaInvocation from './execute';

export default class LambdaServiceClient {
  protected namespace: string; // lambda service namespace
  constructor({ namespace }: { namespace: string }) {
    this.namespace = namespace;
  }

  protected async execute({ handlerName, event }: { handlerName: string, event: any }) { // wrap execute method with automatically injecting the namespace
    const response = await executeLambdaInvocation({ namespace: this.namespace, handlerName, event });
    const isAnErrorPayload = false // check if any of the following properties exist in the payload (since some responses may exclude one or the other)
      || response.errorMessage
      || response.errorType
      || response.stackTrace;
    if (isAnErrorPayload) throw new LambdaInvocationError({ response, lambda: [this.namespace, handlerName].join('-'), event });
    return response;
  }
}

export {
  UnsuccessfulStatusCodeError, // import { UnsuccessfulStatusCodeError } from 'lambda-service-client';
  LambdaInvocationError, // import { LambdaInvocationError } from 'lambda-service-client';
};
