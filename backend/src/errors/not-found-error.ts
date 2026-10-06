class NotFoundError extends Error {
  statusCode: number;

  constructor(message: string = 'Запрашиваемый ресурс не найден') {
    super(message);
    this.statusCode = 404;
  }
}

export default NotFoundError;
