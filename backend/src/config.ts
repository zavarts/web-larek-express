import dotenv from 'dotenv';
import { CookieOptions } from 'express';
import ms, { StringValue } from 'ms';
import path from 'path';

dotenv.config();

export const {
  PORT = '3000',
  DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek',
  UPLOAD_PATH = 'images',
  UPLOAD_PATH_TEMP = 'temp',
  ORIGIN_ALLOW = 'http://localhost:5173',
  AUTH_REFRESH_TOKEN_EXPIRY = '7d',
  AUTH_ACCESS_TOKEN_EXPIRY = '10m',
  JWT_SECRET = 'dev-secret',
  JWT_REFRESH_SECRET = 'dev-refresh-secret',
} = process.env;

export const PUBLIC_PATH = path.join(__dirname, 'public');
export const TEMP_PATH = path.join(__dirname, UPLOAD_PATH_TEMP);
export const IMAGES_PATH = path.join(PUBLIC_PATH, UPLOAD_PATH);

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  maxAge: ms(AUTH_REFRESH_TOKEN_EXPIRY as StringValue),
  path: '/',
};
