import executeLambdaInvocation from './execute';
import dotenv from 'dotenv';

// load environmental variables from .env
dotenv.config();

// load test details from env vars
const testPayload = JSON.parse(process.env.EXECUTE_PAYLOAD as string);
const namespace = process.env.EXECUTE_NAMESPACE as string;
const handlerName = process.env.EXECUTE_HANDLER_NAME as string;

// run the test
describe('execute', () => {
  it('should be able to execute a call to invoke a lambda', async () => {
    const idea = await executeLambdaInvocation({
      namespace,
      handlerName,
      event: testPayload,
    });
    expect(typeof idea).toEqual('string');
  });
});
