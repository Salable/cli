export default class ErrorResponse extends Error {
  public statusCode: number;
  public message: string;

  constructor(statusCode: number, message: string) {
    super(`Not Found: ${message}` || 'Not Found');
    this.statusCode = statusCode;
    this.message = message;
  }
}
