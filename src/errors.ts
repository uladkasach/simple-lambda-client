// tslint:disable max-classes-per-file
export class UnsuccessfulStatusCodeError extends Error {
  constructor({ code, payload }: { code: number | undefined, payload: any }) {
    const message = `Status code does not indicate success: ${code};
    ${JSON.stringify(payload)}`;
    super(message);
  }
}

export class LambdaInvocationError extends Error {
  private lambda: string;
  private response: any;
  private event: any;
  constructor({ lambda, response, event }: { lambda: string, response: any, event: any }) {
    const message = `An error was returned as the lambda invocation response for the lambda '${lambda}'. See error properties for details.`;
    super(message);
    this.lambda = lambda;
    this.response = response;
    this.event = event;
  }
}
