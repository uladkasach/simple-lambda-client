# Lambda Service Client
This library makes it easy to interact with your lambda based microservices.

By extending this class to encapsulate each of your lambda functions as a method of the class, you can easily interact with your lambda functions, validate passed data, interpret responses, and enforce types.

## Installation
1. install the module
```
npm install --save lambda-service-client
```

2. ensure that your lambda has permission to invoke other lambdas
```yml
# serverless.yml
iamRoleStatements:
  - Effect: Allow
    Action:
      - lambda:InvokeFunction
      - lambda:InvokeAsync
    Resource: "*" # TODO: constrain to a specific service and stage
```


## Quick Example

```ts
// service-ideas-client.ts
import LambdaServiceClient, { Determinism } from './lambda-service-client';
import { GraphQLIdeaRepresentation } from './types.d';

class ServiceIdeasClient extends LambdaServiceClient {
  constructor({ stage }: { stage: string }) {
    super({ namespace: `tugether-service-ideas-${stage}` }); // define the namespace with a dynamic stage
  }
  public async recordNewIdea(idea: GraphQLIdeaRepresentation): Promise<{ uuid: string }> {
    return await super.execute({ handlerName: 'recordNewIdea', event: idea });
  }
  public async getLatestIdeas(): Promise<GraphQLIdeaRepresentation[]> {
    return await super.execute({
      handlerName: 'getLatestIdeas',
      event: idea,
      determinism: Determinism.TIME_DETERMINISTIC, // to deduplicate requests
    });
  }
  public async getIdeaById(): Promise<GraphQLIdeaRepresentation[]> {
    return await super.execute({
      handlerName: 'getLatestIdeas',
      event: idea,
      determinism: Determinism.DETERMINISTIC, // cache in memory for 5 min and in dynamodb for an hour (by config below)
      cachingOptions: {
        memory: {
          secondsToLive: 60 * 5, // cache in memory for 5 min at a time
        },
        dynamodb: {
          tableName: '__DYNAMODB_TABLE_NAME__',
          secondsToLive: 60 * 60, // cache for an hour at a time  
        }
      }
    });
  }
}

export default ServiceIdeasClient;
```

# Caching
This library supports caching for functions with different levels of "determinism": deterministic and time-deterministic.
- **deterministic** functions are those for which results can be cached infinitely, as their results are dependent only on the input.
- **time-deterministic** functions are those for which results can only be "cached" at this instance, as their results change with time.
- **non-deterministic** functions are those for which results are not guaranteed to be the same, even if called with the same parameters at the same time - and thus can not be cached.

These features are opt-in, as by default determinism is assumed to be `non-deterministic`; meaning, no caching or request deduplication is provided by default.

### Deterministic

#### In Memory
Coming Soon

#### DynamoDB
Coming Soon

### Time Deterministic
Although we can not cache the results of these functions for an extended period of time, we can at the minimum "deduplicate" requests going out at the "same" time, by checking if we are already currently waiting for a promise to resolve with the same arguments. In these cases, when the request is specified as "TIME_DETERMINISTIC", the `lambda-service-client` simply returns the already pending request's promise rather than creating a second promise.   

To leverage this "deduplication" of requests, simply define the determinism mode as shown below:

```ts
// service-ideas-client.ts
import LambdaServiceClient, { Determinism } from './lambda-service-client';
...
  public async getLatestIdeas(): Promise<GraphQLIdeaRepresentation[]> {
    return await super.execute({
      handlerName: 'getLatestIdeas',
      event: idea,
      determinism: Determinism.TIME_DETERMINISTIC,
    });
  }
...
```


# Examples

Client:
```ts
// service-ideas-client.ts
import LambdaServiceClient from './lambda-service-client';
import { GraphQLIdeaRepresentation } from './types.d';

class ServiceIdeasClient extends LambdaServiceClient {
  constructor({ stage }: { stage: string }) {
    super({ namespace: `tugether-service-ideas-${stage}` }); // define the namespace with a dynamic stage
  }
  public async recordNewIdea(idea: GraphQLIdeaRepresentation): Promise<{ uuid: string }> {
    return await super.execute({ handlerName: 'recordNewIdea', event: idea });
  }
}

export default ServiceIdeasClient;
```



Integration Test:
```ts
// service-ideas-client.test.integration.ts
import ServiceIdeasClient from './index';

const realIdea = {
  title: 'Hiking in a Utah National Park',
  description: 'Utah parks are national treasures. Visit this other world and take life on with a different perspective.',
  // more...
};

// NOTE: this test may fail if the rds instance is still spinning up
describe('service-ideas-client', () => {
  const ideasClient = new ServiceIdeasClient({ stage: 'dev' });
  it('should be able to recordNewIdea', async () => {
    const idea = await ideasClient.recordNewIdea(realIdea);
    expect(typeof idea).toEqual('string');
  });
});
```
