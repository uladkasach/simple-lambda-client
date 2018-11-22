import executeLambdaInvocation from './execute';

const payload = {
  some: 'responseData',
  StatusCode: 200, // the mock function looks for this to decide which status code to display
};

const payloadError = {
  some: 'responseData',
  StatusCode: 400, // the mock function looks for this to decide which status code to display
};

describe('execute', () => {
  it('should be able to execute a call to invoke a lambda', async () => {
    const response = await executeLambdaInvocation({
      namespace: 'your-very-awesome-lambda-and-stage',
      handlerName: 'doAwesomeFunctionality',
      event: payload,
    });
    expect(response.FunctionName).toEqual('your-very-awesome-lambda-and-stage-doAwesomeFunctionality'); // function name should be accurate
    expect(response.Payload).toEqual(JSON.stringify(payload)); // payload should be accurate
  });
  it('should throw the expected error if status code is not accurate', async () => {
    try {
      await executeLambdaInvocation({
        namespace: 'your-very-awesome-lambda-and-stage',
        handlerName: 'doAwesomeFunctionality',
        event: payloadError,
      });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.constructor.name).toEqual('UnsuccessfulStatusCodeError');
    }
  });
});
