import fs from 'fs/promises';
import path from 'path';
import {
  NextFunction, Request, Response,
} from 'express';
import { Error as MongooseError } from 'mongoose';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import { IMAGES_PATH, TEMP_PATH, UPLOAD_PATH } from '../config';

const moveImageFromTemp = async (fileName: string) => {
  const baseName = path.basename(fileName);
  const tempFilePath = path.join(TEMP_PATH, baseName);
  const destFilePath = path.join(IMAGES_PATH, baseName);
  const publicFileName = `/${UPLOAD_PATH}/${baseName}`;

  try {
    await fs.access(tempFilePath);
    await fs.copyFile(tempFilePath, destFilePath);
    await fs.unlink(tempFilePath);
    return publicFileName;
  } catch {
    // для базовых запросов путь сохраняем как есть (файл мог быть положен заранее)
    return fileName.startsWith('/') ? fileName : publicFileName;
  }
};

export const getProducts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const products = await Product.find({});
    return res.send({
      items: products,
      total: products.length,
    });
  } catch (error) {
    return next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      title, image, category, description, price,
    } = req.body;

    const fileName = await moveImageFromTemp(image.fileName);

    const product = await Product.create({
      title,
      image: {
        fileName,
        originalName: image.originalName,
      },
      category,
      description,
      price: price ?? null,
    });

    return res.status(201).send(product);
  } catch (error) {
    if (error instanceof BadRequestError) {
      return next(error);
    }
    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError(error.message));
    }
    if (error instanceof Error && error.message.includes('E11000')) {
      return next(new ConflictError('Товар с таким названием уже существует'));
    }
    return next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    const updateData = { ...req.body };

    if (updateData.image?.fileName) {
      updateData.image = {
        ...updateData.image,
        fileName: await moveImageFromTemp(updateData.image.fileName),
      };
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true },
    );

    if (!product) {
      return next(new NotFoundError('Товар не найден'));
    }

    return res.send(product);
  } catch (error) {
    if (error instanceof BadRequestError) {
      return next(error);
    }
    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError(error.message));
    }
    if (error instanceof MongooseError.CastError) {
      return next(new BadRequestError('Передан некорректный _id товара'));
    }
    if (error instanceof Error && error.message.includes('E11000')) {
      return next(new ConflictError('Товар с таким названием уже существует'));
    }
    return next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return next(new NotFoundError('Товар не найден'));
    }

    return res.send(product);
  } catch (error) {
    if (error instanceof MongooseError.CastError) {
      return next(new BadRequestError('Передан некорректный _id товара'));
    }
    return next(error);
  }
};
