import LambdaServiceClient from './index';
import executeLambdaInvocationMock from './execute';

jest.mock('./execute');

const errorResponse = {
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
  public async doAwesomeThing() {
    return await super.execute({ handlerName: 'doAwesomeThing', event: { test: 'awesome' } });
  }
}
const testClient = new ServiceImagesClient();

// run the test
describe('LambdaServiceClient', () => {
  beforeEach(() => jest.clearAllMocks());
  describe('execute', () => {
    it('should request execution with the accurate handlerName and namespace', async () => {
      await testClient.doAwesomeThing();
      expect((executeLambdaInvocationMock as jest.Mock).mock.calls.length).toEqual(1);
      expect((executeLambdaInvocationMock as jest.Mock).mock.calls[0][0]).toMatchObject({
        handlerName: 'doAwesomeThing',
        namespace : 'awesome-service-dev',
      });
    });
    it('should forward the accurate event data to the execution method', async () => {
      await testClient.doAwesomeThing();
      expect((executeLambdaInvocationMock as jest.Mock).mock.calls.length).toEqual(1);
      expect((executeLambdaInvocationMock as jest.Mock).mock.calls[0][0]).toMatchObject({
        event: {
          test: 'awesome',
        },
      });
    });
    it('should resolve the execution response', async () => {
      const testResponse = { hello: 'there' };
      (executeLambdaInvocationMock as jest.Mock).mockReturnValueOnce(testResponse);
      const response = await testClient.doAwesomeThing();
      expect(response).toEqual(testResponse);
    });
  });
  describe('error handling', () => {
    it('should throw a helpful error if the lambda resolves successfuly with an error object', async () => {
      (executeLambdaInvocationMock as jest.Mock).mockReturnValueOnce(errorResponse);
      try {
        await testClient.doAwesomeThing();
        throw new Error('should not reach here');
      } catch (error) {
        // console.log(error);
        // throw new Error(error);
        expect(error).toHaveProperty('event');
        expect(error).toHaveProperty('lambda');
        expect(error).toHaveProperty('response');
        expect(error.message).toEqual(`An error was returned as the lambda invocation response for the lambda 'awesome-service-dev-doAwesomeThing': \"Data must be a string or a buffer\". See error properties for more details.`);
        expect(error.event).toEqual({ test: 'awesome' });
        expect(error.response).toEqual(errorResponse);
        expect(error.lambda).toEqual('awesome-service-dev-doAwesomeThing');
      }
    });
  });
  describe('prior edge cases', () => {
    it('should be able to handle a `null` response', async () => {
      (executeLambdaInvocationMock as jest.Mock).mockReturnValueOnce(null);
      const response = await testClient.doAwesomeThing();
      expect(response).toEqual(null);
    });
  });
});
