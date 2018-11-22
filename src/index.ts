import { UnsuccessfulStatusCodeError } from './errors';
import executeLambdaInvocation from './execute';

export default class LambdaServiceClient {
  protected namespace: string; // lambda service namespace
  constructor({ namespace }: { namespace: string }) {
    this.namespace = namespace;
  }

  protected async execute({ handlerName, event }: { handlerName: string, event: any }) { // wrap execute method with automatically injecting the namespace
    return executeLambdaInvocation({ namespace: this.namespace, handlerName, event });
  }
}

export {
  UnsuccessfulStatusCodeError, // import { UnsuccessfulStatusCodeError } from 'lambda-service-client';
};
