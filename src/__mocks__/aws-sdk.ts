// lambda
const invoke = jest.fn().mockImplementation(opts => ({
  promise: async () => {
    const parsedPayloadRequest = JSON.parse(opts.Payload);
    const isAnErrorPayload = parsedPayloadRequest.errorMessage || parsedPayloadRequest.errorType || parsedPayloadRequest.stackTrace;
    const payloadToReturn = (!isAnErrorPayload) ? opts : opts.Payload; // if not an error payload, return the options as the payload, else just the payload
    return ({
      StatusCode: parsedPayloadRequest.StatusCode,
      Payload: payloadToReturn,
    });
  },
}));
const Lambda = jest.fn().mockImplementation(() => ({ // tslint:disable-line
  invoke,
}));

export {
  Lambda,
};
