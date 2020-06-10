import dotenv from 'dotenv';

import { testIfNotCicd } from './__test_utils__/testIfNotCicd';
import { createLambdaServiceClient } from './createLambdaServiceClient';

// load environmental variables from .env
dotenv.config();

// load test details from env vars
const testPayload = process.env.EXECUTE_PAYLOAD as string;
const serviceName = process.env.EXECUTE_SERVICE_NAME as string;
const functionName = process.env.EXECUTE_FUNCTION_NAME as string;
const stage = process.env.EXECUTE_STAGE as string;

describe('createLambdaServiceClient', () => {
  testIfNotCicd('should be able to call service and get response', async () => {
    const invokeLambdaFunction = createLambdaServiceClient({ serviceName, stage });
    const result = await invokeLambdaFunction({ functionName, event: JSON.parse(testPayload) });
    expect(result).toEqual({ job: null });
  });
});
