import sha256 from 'simple-sha256';
import { UnsuccessfulStatusCodeError, LambdaInvocationError } from './errors';
import executeLambdaInvocation from './execute';

export enum Determinism {
  NOT_DETERMINISTIC = 'NOT_DETERMINISTIC',
  DETERMINISTIC = 'DETERMINISTIC', // for any explicit inputs
  TIME_DETERMINISTIC = 'TIME_DETERMINISTIC', // deterministic as long as we consider the implicit time as an input
}
export default class LambdaServiceClient {
  protected namespace: string; // lambda service namespace
  protected pendingRequests: { [index: string]: Promise<any> }; // cache of currently pending requests, for use in time-deterministic request merging
  constructor({ namespace }: { namespace: string }) {
    this.namespace = namespace;
    this.pendingRequests = {}; // initialize fresh
  }

  protected async execute({ handlerName, event, determinism = Determinism.NOT_DETERMINISTIC }: { handlerName: string, event: any, determinism?: Determinism }) { // wrap execute method with automatically injecting the namespace
    // if not deterministic, simply invoke the lambda and return the response
    if (determinism === Determinism.NOT_DETERMINISTIC) return executeLambdaInvocation({ namespace: this.namespace, handlerName, event });

    // if deterministic of any kind, see if we're already waiting for that response - if so, merge the requests and return the same promise
    const requestHash = sha256.sync(handlerName + JSON.stringify(event));
    const existingPendingRequest = this.pendingRequests[requestHash];
    if (existingPendingRequest) return existingPendingRequest; // if we've found it, return it. NOTE: this "merges" the requests - any two "execute" calls with the same parameters will get the same response - litteraly

    // if deterministic and that request does not already exist, create it and store it; also, make sure it knows how to clean self up
    const pendingRequest = executeLambdaInvocation({ namespace: this.namespace, handlerName, event })
      .then((response) => {
        // 1. remove request from pendingRequests now that it has resolved
        delete this.pendingRequests[requestHash];  // NOTE: this is _required_ for TIME_DETERMINISTIC requests, but not for DETERMINISTIC requests (those we can cache infinately, we just dont support it yet)

        // 2. return the response
        return response;
      });
    this.pendingRequests[requestHash] = pendingRequest;
    return pendingRequest;
  }
}

export {
  UnsuccessfulStatusCodeError, // import { UnsuccessfulStatusCodeError } from 'lambda-service-client';
  LambdaInvocationError, // import { LambdaInvocationError } from 'lambda-service-client';
};
