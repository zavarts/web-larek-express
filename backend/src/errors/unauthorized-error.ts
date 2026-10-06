class UnauthorizedError extends Error {
  statusCode: number;

  constructor(message: string = 'Необходима авторизация') {
    super(message);
    this.statusCode = 401;
  }
}

export default UnauthorizedError;
