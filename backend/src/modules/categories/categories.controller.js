// src/modules/categories/categories.controller.js
import { success, error } from '../../utils/apiResponse.js';
import { createCategorySchema, updateCategorySchema } from './categories.validation.js';
import * as categoriesService from './categories.service.js';

export const listCategories = async (req, res) => {
  try {
    const categories = await categoriesService.listCategories();
    return success(res, categories);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

export const getCategoryTree = async (req, res) => {
  try {
    const tree = await categoriesService.getCategoryTree();
    return success(res, tree);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await categoriesService.getCategoryById(req.params.id);
    return success(res, category);
  } catch (err) {
    return error(res, err.message, 404);
  }
};

export const createCategory = async (req, res) => {
  try {
    const parsed = createCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      return error(res, parsed.error.errors[0].message, 400);
    }

    const category = await categoriesService.createCategory(parsed.data);
    return success(res, category, 'Categoría creada correctamente', 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

export const updateCategory = async (req, res) => {
  try {
    const parsed = updateCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      return error(res, parsed.error.errors[0].message, 400);
    }

    const category = await categoriesService.updateCategory(req.params.id, parsed.data);
    return success(res, category, 'Categoría actualizada correctamente');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    await categoriesService.deleteCategory(req.params.id);
    return success(res, null, 'Categoría eliminada correctamente');
  } catch (err) {
    return error(res, err.message, 400);
  }
};