// lambda
const invoke = jest.fn().mockImplementation(opts => ({
  promise: async () => ({
    StatusCode: JSON.parse(opts.Payload).StatusCode,
    Payload: opts,
  }),
}));
const Lambda = jest.fn().mockImplementation(() => ({ // tslint:disable-line
  invoke,
}));

export {
  Lambda,
};
