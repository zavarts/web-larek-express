import {
  NextFunction, Request, Response,
} from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { total, items } = req.body;

    const products = await Product.find({ _id: { $in: items } });

    if (products.length !== items.length) {
      return next(new BadRequestError('Один или несколько товаров не найдены'));
    }

    const unsellable = products.filter((product) => product.price === null);
    if (unsellable.length > 0) {
      return next(new BadRequestError('В заказе есть товары, которые не продаются'));
    }

    const calculatedTotal = products.reduce(
      (sum, product) => sum + (product.price || 0),
      0,
    );

    if (calculatedTotal !== total) {
      return next(new BadRequestError('Сумма заказа не совпадает со стоимостью товаров'));
    }

    return res.status(200).send({
      id: faker.string.uuid(),
      total,
    });
  } catch (error) {
    return next(error);
  }
};

export default createOrder;
