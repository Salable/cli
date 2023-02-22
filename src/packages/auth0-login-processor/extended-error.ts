export default class ExtendedError extends Error {
  constructor(message: string, public readonly inner?: Error | string) {
    super(message);
  }
}
