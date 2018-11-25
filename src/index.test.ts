import LambdaServiceClient from './index';

const payload = {
  some: 'responseData',
  StatusCode: 200, // the mock function looks for this to decide which status code to display
};
const errorPayload = {
  StatusCode: 200, // the mock function looks for this to decide which status code to display
  errorMessage: 'Data must be a string or a buffer',
  errorType: 'TypeError',
  stackTrace: [
    'Hash.update (crypto.js:99:16)',
    'AsyncFunction.sha256sync [as sync] (/var/task/node_modules/simple-sha256/index.js:12:6)',
    'new Description (/var/task/dist/models/description.js:19:61)',
    'Object.<anonymous> (/var/task/dist/services/idea/recordIdeaFromEvent.js:30:25)',
    'Generator.next (<anonymous>)',
    '/var/task/dist/services/idea/recordIdeaFromEvent.js:7:71',
    'new Promise (<anonymous>)',
    '__awaiter (/var/task/dist/services/idea/recordIdeaFromEvent.js:3:12)',
    'Object.recordIdeaFromEvent [as default] (/var/task/dist/services/idea/recordIdeaFromEvent.js:22:40)',
    'Object.<anonymous> (/var/task/dist/handlers/recordNewIdea.js:26:53)',
  ],
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
  it('should throw a helpful error if an error response is detected', async () => {
    try {
      await testClient.doAwesomeThing(errorPayload);
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.constructor.name).toEqual('LambdaInvocationError');
    }
  });
});
