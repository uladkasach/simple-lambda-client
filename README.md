# lambda-service-client

![ci_on_commit](https://github.com/uladkasach/lambda-service-client/workflows/ci_on_commit/badge.svg)
![deploy_on_tag](https://github.com/uladkasach/lambda-service-client/workflows/deploy_on_tag/badge.svg)

A simple, convenient way to invoke aws lambda functions with best practices.

Best practices:

- optional logDebug of input and output
- throw an error if response contains an error object

# Install

```sh
npm install --save lambda-service-client
```

# Example

```ts
import { createLambdaServiceClient } from 'lambda-service-client';

const invokeLambdaFunction = createLambdaServiceClient({ serviceName: 'svc-jobs', stage });

export const getJobByUuid = (event: { uuid: string }): Promise<{ job: Job | null }> => invokeLambdaFunction({ functionName: 'getJobByUuid', event });
```

# Usage

## invoke

create a function to invoke your lambda with the `createLambdaServiceClient` method

```ts
import { createLambdaServiceClient } from 'lambda-service-client';

const invokeLambdaFunction = createLambdaServiceClient({ serviceName: 'svc-jobs', stage });
```

which you can use directly:

```ts
const result = await invokeLambdaFunction({ functionName, event: testPayload });
// ...do amazing things with result...
```

## type

but you'll probably want to add some typedefs and name it for readability:

```ts
export const getJobByUuid = (event: { uuid: string }) => invokeLambdaFunction<{ job: Job | null }>({ functionName: 'getJobByUuid', event });
```

which makes using that alot easier:

```ts
const { job } = await getJobByUuid({ uuid: '__uuid__' });
// ...do amazing things with job
```

now you can just create a file of those typed lambda function methods, like above, and export each one, and let that be your client.

## namespace (if you like)

alternatively, you can build a full namespaced client:

```ts
// export the namespaced client
export const jobsServiceClient = {
  getJobByUuid,
  // other methods...
};
```

and add extra context about "where" getJobByUuid is coming from

```ts
import { jobsServiceClient } from '../path/to/client';

const { job } = await jobsServiceClient.getJobByUuid({ uuid: '__uuid__' });
// ...do amazing things with job
```

# Tips

### lambda permissions

if you're using this client from inside a lambda, ensure that this lambda has permission to invoke other lambdas

```yml
# serverless.yml
iamRoleStatements:
  - Effect: Allow
    Action:
      - lambda:InvokeFunction
      - lambda:InvokeAsync
    Resource: '*' # TODO: constrain to a specific account, region, service, and stage
```
