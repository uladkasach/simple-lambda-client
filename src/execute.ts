import { Lambda } from 'aws-sdk';
import { UnsuccessfulStatusCodeError } from './errors';

const lambda = new Lambda();

const executeLambdaInvocation = async ({ namespace, handlerName, event }: { namespace: string, handlerName: string, event: any }): Promise<any> => {
  const lambdaName = [namespace, handlerName].join('-');
  const payload = JSON.stringify(event);
  const response = await lambda.invoke({
    FunctionName: lambdaName,
    Payload: payload,
  }).promise();
  if (response.StatusCode !== 200) throw new UnsuccessfulStatusCodeError({ code: response.StatusCode, payload: response.Payload });
  let parsedResult;
  try {
    parsedResult = JSON.parse(response.Payload as string);
  } catch (error) {
    // if here, then we couldn't parse the result, it wasn't json. so just return the result unparsed
    parsedResult = response.Payload;
  }
  return parsedResult;
};

export default executeLambdaInvocation;
