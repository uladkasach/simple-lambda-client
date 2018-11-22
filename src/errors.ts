export class UnsuccessfulStatusCodeError extends Error {
  constructor({ code, payload }: { code: number | undefined, payload: any }) {
    const message = `Status code does not indicate success: ${code};
    ${JSON.stringify(payload)}`;
    super(message);
  }
}
