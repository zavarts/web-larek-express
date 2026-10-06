import mongoose, { Document } from 'mongoose';

export interface IProductImage {
  fileName: string;
  originalName: string;
}

export interface IProduct extends Document {
  title: string;
  image: IProductImage;
  category: string;
  description?: string;
  price: number | null;
}

const productSchema = new mongoose.Schema<IProduct>({
  title: {
    type: String,
    unique: true,
    required: [true, 'Поле "title" должно быть заполнено'],
    minlength: [2, 'Минимальная длина поля "title" - 2'],
    maxlength: [30, 'Максимальная длина поля "title" - 30'],
  },
  image: {
    type: {
      fileName: {
        type: String,
        required: [true, 'Поле "image.fileName" должно быть заполнено'],
      },
      originalName: {
        type: String,
        required: [true, 'Поле "image.originalName" должно быть заполнено'],
      },
    },
    required: [true, 'Поле "image" должно быть заполнено'],
  },
  category: {
    type: String,
    required: [true, 'Поле "category" должно быть заполнено'],
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    default: null,
  },
}, { versionKey: false });

productSchema.post('findOneAndDelete', async (doc: IProduct | null) => {
  if (!doc?.image?.fileName) return;

  const fs = await import('fs/promises');
  const path = await import('path');
  const { PUBLIC_PATH } = await import('../config');

  const filePath = path.join(PUBLIC_PATH, doc.image.fileName);

  try {
    await fs.unlink(filePath);
  } catch {
    // файл мог уже отсутствовать
  }
});

export default mongoose.model<IProduct>('product', productSchema);
