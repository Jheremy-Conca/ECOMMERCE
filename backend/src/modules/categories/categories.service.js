// src/modules/categories/categories.service.js
import prisma from '../../config/db.js';
import { slugify } from '../../utils/slugify.js';

const generateUniqueSlug = async (name, excludeId = null) => {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 2;
  while (
    await prisma.category.findFirst({
      where: { slug, ...(excludeId && { id: { not: excludeId } }) },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

// Recorre hacia abajo desde categoryId y devuelve todos los IDs descendientes
const getDescendantIds = async (categoryId) => {
  const children = await prisma.category.findMany({
    where: { parentId: categoryId },
    select: { id: true },
  });

  let ids = children.map((c) => c.id);
  for (const child of children) {
    const nested = await getDescendantIds(child.id);
    ids = ids.concat(nested);
  }
  return ids;
};

// Evita que una categoría se convierta en su propio ancestro (referencia circular)
const assertNoCircularReference = async (categoryId, newParentId) => {
  if (!newParentId) return;
  if (newParentId === categoryId) {
    throw new Error('Una categoría no puede ser su propia categoría padre');
  }
  const descendantIds = await getDescendantIds(categoryId);
  if (descendantIds.includes(newParentId)) {
    throw new Error('No se puede asignar como padre a una subcategoría de sí misma');
  }
};

// Construye el árbol jerárquico completo a partir de una lista plana
const buildTree = (categories, parentId = null) => {
  return categories
    .filter((cat) => cat.parentId === parentId)
    .map((cat) => ({
      ...cat,
      children: buildTree(categories, cat.id),
    }));
};

export const createCategory = async (data) => {
  if (data.parentId) {
    const parent = await prisma.category.findUnique({ where: { id: data.parentId } });
    if (!parent) {
      throw new Error('La categoría padre indicada no existe');
    }
  }

  const slug = await generateUniqueSlug(data.name);

  return prisma.category.create({
    data: {
      name: data.name,
      slug,
      parentId: data.parentId ?? null,
    },
  });
};

export const updateCategory = async (id, data) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new Error('Categoría no encontrada');
  }

  const updateData = {};

  if (data.name && data.name !== category.name) {
    updateData.name = data.name;
    updateData.slug = await generateUniqueSlug(data.name, id);
  }

  if (data.parentId !== undefined) {
    if (data.parentId !== null) {
      const parent = await prisma.category.findUnique({ where: { id: data.parentId } });
      if (!parent) {
        throw new Error('La categoría padre indicada no existe');
      }
      await assertNoCircularReference(id, data.parentId);
    }
    updateData.parentId = data.parentId;
  }

  return prisma.category.update({ where: { id }, data: updateData });
};

export const deleteCategory = async (id) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new Error('Categoría no encontrada');
  }

  // Product.categoryId tiene onDelete: Restrict, así que Prisma rechaza el borrado
  // si aún hay productos asociados; las subcategorías quedan con parentId null (SetNull).
  try {
    return await prisma.category.delete({ where: { id } });
  } catch (err) {
    if (err.code === 'P2003') {
      throw new Error('No se puede eliminar: hay productos asociados a esta categoría');
    }
    throw err;
  }
};

export const getCategoryById = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { parent: true, children: true },
  });
  if (!category) {
    throw new Error('Categoría no encontrada');
  }
  return category;
};

// Lista plana (para selects, tablas admin, etc.)
export const listCategories = async () => {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
};

// Árbol jerárquico completo (para menús de navegación, filtros anidados)
export const getCategoryTree = async () => {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return buildTree(categories);
};