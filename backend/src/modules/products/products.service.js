// src/modules/products/products.service.js
import prisma from '../../config/db.js';
import { slugify } from '../../utils/slugify.js';
import { generateSku } from '../../utils/generateSku.js';
import { uploadMultipleToCloudinary, deleteFromCloudinary } from '../../utils/uploadToCloudinary.js';

const generateUniqueSlug = async (name) => {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 2;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

const generateUniqueSku = async (categorySlug) => {
  let sku = generateSku(categorySlug);
  while (await prisma.product.findUnique({ where: { sku } })) {
    sku = generateSku(categorySlug);
  }
  return sku;
};

export const createProduct = async (data, files = []) => {
  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) {
    throw new Error('La categoría indicada no existe');
  }

  const slug = await generateUniqueSlug(data.name);
  const sku = await generateUniqueSku(category.slug);

  const images = files.length > 0 ? await uploadMultipleToCloudinary(files) : [];

  return prisma.product.create({
    data: {
      name: data.name,
      slug,
      sku,
      description: data.description ?? null,
      price: data.price,
      stock: data.stock ?? 0,
      isActive: data.isActive ?? true,
      categoryId: data.categoryId,
      images,
    },
  });
};

export const updateProduct = async (id, data) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new Error('Producto no encontrado');
  }

  if (data.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) {
      throw new Error('La categoría indicada no existe');
    }
    // El SKU no cambia aunque cambie la categoría: es un identificador de inventario fijo
  }

  const updateData = { ...data };
  if (data.name && data.name !== product.name) {
    updateData.slug = await generateUniqueSlug(data.name);
  }

  return prisma.product.update({ where: { id }, data: updateData });
};

export const addProductImages = async (id, files) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new Error('Producto no encontrado');
  }
  if (!files || files.length === 0) {
    throw new Error('No se enviaron imágenes');
  }
  if (product.images.length + files.length > 5) {
    throw new Error('Un producto no puede tener más de 5 imágenes');
  }

  const newUrls = await uploadMultipleToCloudinary(files);

  return prisma.product.update({
    where: { id },
    data: { images: { push: newUrls } },
  });
};

export const removeProductImage = async (id, imageUrl) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new Error('Producto no encontrado');
  }
  if (!product.images.includes(imageUrl)) {
    throw new Error('Esa imagen no pertenece a este producto');
  }

  await deleteFromCloudinary(imageUrl);

  return prisma.product.update({
    where: { id },
    data: { images: product.images.filter((img) => img !== imageUrl) },
  });
};

export const deleteProduct = async (id) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new Error('Producto no encontrado');
  }

  // Borra las imágenes de Cloudinary antes de eliminar el registro
  await Promise.all(product.images.map((url) => deleteFromCloudinary(url)));

  return prisma.product.delete({ where: { id } });
};

export const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product) {
    throw new Error('Producto no encontrado');
  }
  return product;
};

export const listProducts = async ({ page, limit, categoryId, search }) => {
  const where = {
    isActive: true,
    ...(categoryId && { categoryId }),
    ...(search && { name: { contains: search, mode: 'insensitive' } }),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};