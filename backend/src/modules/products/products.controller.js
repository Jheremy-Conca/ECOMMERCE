// src/modules/products/products.controller.js
import { success, error } from '../../utils/apiResponse.js';
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
} from './products.validation.js';
import * as productsService from './products.service.js';

export const listProducts = async (req, res) => {
  try {
    const parsed = listProductsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return error(res, parsed.error.errors[0].message, 400);
    }

    const result = await productsService.listProducts(parsed.data);
    return success(res, result);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await productsService.getProductById(req.params.id);
    return success(res, product);
  } catch (err) {
    return error(res, err.message, 404);
  }
};

export const createProduct = async (req, res) => {
  try {
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return error(res, parsed.error.errors[0].message, 400);
    }

    const product = await productsService.createProduct(parsed.data, req.files);
    return success(res, product, 'Producto creado correctamente', 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

export const updateProduct = async (req, res) => {
  try {
    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return error(res, parsed.error.errors[0].message, 400);
    }

    const product = await productsService.updateProduct(req.params.id, parsed.data);
    return success(res, product, 'Producto actualizado correctamente');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

export const addProductImages = async (req, res) => {
  try {
    const product = await productsService.addProductImages(req.params.id, req.files);
    return success(res, product, 'Imágenes agregadas correctamente');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

export const removeProductImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return error(res, 'imageUrl es requerido', 400);
    }

    const product = await productsService.removeProductImage(req.params.id, imageUrl);
    return success(res, product, 'Imagen eliminada correctamente');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await productsService.deleteProduct(req.params.id);
    return success(res, null, 'Producto eliminado correctamente');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

export const listProductsAdminHandler = async (req, res) => {
  try {
    const parsed = listProductsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return error(res, parsed.error.errors[0].message, 400);
    }
    const result = await productsService.listProductsAdmin(parsed.data);
    return success(res, result);
  } catch (err) {
    return error(res, err.message, 500);
  }
};