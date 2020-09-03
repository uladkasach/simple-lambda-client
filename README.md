# simple-lambda-client

![ci_on_commit](https://github.com/uladkasach/simple-lambda-client/workflows/ci_on_commit/badge.svg)
![deploy_on_tag](https://github.com/uladkasach/simple-lambda-client/workflows/deploy_on_tag/badge.svg)

A simple, convenient way to invoke aws lambda functions with best practices.

Best practices:

- optional logDebug of input and output
- throw an error if response contains an error object

# Install

```sh
npm install --save simple-lambda-client
```

# Example

```ts
import { invokeLambdaFunction } from 'simple-lambda-client';

const service = 'svc-jobs;
const stage = getStage();

export const getJobByUuid = (event: { uuid: string }): Promise<{ job: Job | null }> =>
  invokeLambdaFunction({ service, stage, function: 'getJobByUuid', event });

export const getJobsByPostal = (event: { postal: string }): Promise<{ jobs: Job[] }> =>
  invokeLambdaFunction({ service, stage, function: 'getJobsByPostal', event });

// ...
```

# Usage

## invoke

`simple-lambda-client` exports a function that lets you invoke lambda functions with best practices.

You can use this function directly if you want...

```ts
import { invokeLambdaFunction } from 'simple-lambda-client';

const result = await invokeLambdaFunction({ service, stage, function, event });
// ...do amazing things with result...
```

## type

But you'll probably want to add some typedefs and name it for readability:

```ts
export const getJobByUuid = (event: { uuid: string }) =>
  invokeLambdaFunction<{ job: Job | null }>({ service, stage, function: 'getJobByUuid', event });
```

which makes using that a lot easier:

```ts
const { job } = await getJobByUuid({ uuid: '__uuid__' });
// ...do amazing things with job
```

now you can just create a file of those typed lambda function methods, like above, and export each one, and let that be your client.

## namespace (if you like)

optionally, you can build a full namespaced client:

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
