This library makes it easy to interact with your lambda based microservices.

By extending this class to encapsulate each of your lambda functions as a method of the class, you can easily interact with your lambda functions, validate passed data, interpret responses, and enforce types.

# Example

Client:
```ts
// service-ideas-client.ts
import LambdaServiceClient from './lambda-service-client';
import { GraphQLIdeaRepresentation } from './types.d';

class ServiceIdeasClient extends LambdaServiceClient {
  constructor({ stage }: { stage: string }) {
    super({ namespace: `tugether-service-ideas-${stage}` }); // define the namespace with a dynamic stage
  }
  public async recordNewIdea(idea: GraphQLIdeaRepresentation) {
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
