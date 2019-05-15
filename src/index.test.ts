import sha256 from 'simple-sha256';
import LambdaServiceClient, { Determinism } from './index';
import executeLambdaInvocation from './execute';

jest.mock('./execute');
const executeLambdaInvocationMock = executeLambdaInvocation as jest.Mock;
executeLambdaInvocationMock.mockResolvedValue('__EXECUTION_RESULT__');

class ServiceImagesClient extends LambdaServiceClient {
  constructor() {
    super({ namespace: 'awesome-service-dev' });
  }
  public async doAwesomeThing() {
    return await super.execute({ handlerName: 'doAwesomeThing', event: { test: 'awesome' } });
  }
  public async doAwesomeTimeDeterministicThing() {
    return await super.execute({
      handlerName: 'doAwesomeTimeDeterministicThing',
      event: { test: 'awesome' },
      determinism: Determinism.TIME_DETERMINISTIC,
    });
  }
}

// run the test
describe('LambdaServiceClient', () => {
  beforeEach(() => jest.clearAllMocks());
  describe('execute', () => {
    describe('non-deterministic', () => {
      it('should request execution with the accurate handlerName and namespace', async () => {
        const testClient = new ServiceImagesClient();
        await testClient.doAwesomeThing();
        expect((executeLambdaInvocationMock as jest.Mock).mock.calls.length).toEqual(1);
        expect((executeLambdaInvocationMock as jest.Mock).mock.calls[0][0]).toMatchObject({
          handlerName: 'doAwesomeThing',
          namespace : 'awesome-service-dev',
        });
      });
      it('should forward the accurate event data to the execution method', async () => {
        const testClient = new ServiceImagesClient();
        await testClient.doAwesomeThing();
        expect((executeLambdaInvocationMock as jest.Mock).mock.calls.length).toEqual(1);
        expect((executeLambdaInvocationMock as jest.Mock).mock.calls[0][0]).toMatchObject({
          event: {
            test: 'awesome',
          },
        });
      });
      it('should resolve the execution response', async () => {
        const testClient = new ServiceImagesClient();
        const testResponse = { hello: 'there' };
        (executeLambdaInvocationMock as jest.Mock).mockReturnValueOnce(testResponse);
        const response = await testClient.doAwesomeThing();
        expect(response).toEqual(testResponse);
      });
      it('should not record anything to the cache', () => {
        const testClient = new ServiceImagesClient();
        testClient.doAwesomeThing();
        expect(Object.keys((testClient as any).pendingRequests).length).toEqual(0); // no entries in client
      });
    });
    describe('time-deterministic', () => {
      const handlerName = 'doAwesomeTimeDeterministicThing';
      const expectedCacheName = sha256.sync(handlerName + JSON.stringify({ test: 'awesome' }));
      it('should return the promise from the cache if it exists in the cache', async () => {
        const testClient = new ServiceImagesClient();
        (testClient as any).pendingRequests[expectedCacheName] = Promise.resolve('__RESULT__');
        const response = await testClient.doAwesomeTimeDeterministicThing();
        expect(response).toEqual('__RESULT__');
      });
      it('should not invoke the lambda if the promise was found in cache', async () => {
        const testClient = new ServiceImagesClient();
        (testClient as any).pendingRequests[expectedCacheName] = Promise.resolve('__RESULT__');
        await testClient.doAwesomeTimeDeterministicThing();
        expect((executeLambdaInvocationMock as jest.Mock).mock.calls.length).toEqual(0);
      });
      it('should invoke the lambda if the promise was not found in the cache', async () => {
        const testClient = new ServiceImagesClient();
        await testClient.doAwesomeTimeDeterministicThing();
        expect((executeLambdaInvocationMock as jest.Mock).mock.calls.length).toEqual(1);
      });
      it('should add the pending promise to the cache if the promise was not initially found in the cache', async () => {
        const testClient = new ServiceImagesClient();
        expect((testClient as any).pendingRequests[expectedCacheName]).toEqual(undefined);
        testClient.doAwesomeTimeDeterministicThing();
        expect((testClient as any).pendingRequests[expectedCacheName]).not.toEqual(undefined);
      });
      it('should return the same promise as that which is found in the cache', () => {
        const testClient = new ServiceImagesClient();
        const promise = testClient.doAwesomeTimeDeterministicThing();
        expect((testClient as any).pendingRequests[expectedCacheName]).toEqual(promise);
      });
      it('should remove the promise from the cache after it resolves', async () => {
        const testClient = new ServiceImagesClient();
        expect((testClient as any).pendingRequests[expectedCacheName]).toEqual(undefined);
        const promise = testClient.doAwesomeTimeDeterministicThing();
        expect((testClient as any).pendingRequests[expectedCacheName]).not.toEqual(undefined);
        await promise;
        expect((testClient as any).pendingRequests[expectedCacheName]).toEqual(undefined);
      });
      it('should find that two requests receive the same exact result and promise, if both were invoked before the request had resolved', async () => {
        executeLambdaInvocationMock.mockResolvedValueOnce('__SPECIAL_ONETIME_EXECUTION_RESULT__');
        const testClient = new ServiceImagesClient();
        const promise1 = testClient.doAwesomeTimeDeterministicThing();
        const promise2 = testClient.doAwesomeTimeDeterministicThing();
        expect(promise1).toEqual(promise2);
        expect(await promise1).toEqual('__SPECIAL_ONETIME_EXECUTION_RESULT__');
        expect(await promise2).toEqual('__SPECIAL_ONETIME_EXECUTION_RESULT__');
      });
    });
  });
});
