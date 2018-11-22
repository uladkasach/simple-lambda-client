import LambdaServiceClient from './index';

const payload = {
  some: 'responseData',
  StatusCode: 200, // the mock function looks for this to decide which status code to display
};
class ServiceImagesClient extends LambdaServiceClient {
  constructor() {
    super({ namespace: 'awesome-service-dev' });
  }
  public async doAwesomeThing(payload: any) {
    return await super.execute({ handlerName: 'doAwesomeThing', event: payload });
  }
}
const testClient = new ServiceImagesClient();

// run the test
describe('lambda-service-client', () => {
  it('should be able to invoke an aws-lambda-function with the namespace', async () => {
    const response = await testClient.doAwesomeThing(payload);
    expect(response.FunctionName).toEqual('awesome-service-dev-doAwesomeThing'); // function name should be accurate
    expect(response.Payload).toEqual(JSON.stringify(payload)); // payload should be accurate
  });
});
