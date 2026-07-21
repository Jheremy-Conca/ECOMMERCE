export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  stock: number
  imageUrl: string
  category: string
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Zapatillas Urbanas Negras',
    slug: 'zapatillas-urbanas-negras',
    description: 'Zapatillas cómodas para el día a día, suela de goma antideslizante.',
    price: 189.90,
    stock: 12,
    imageUrl: 'https://picsum.photos/seed/product1/600/600',
    category: 'Calzado',
  },
  {
    id: '2',
    name: 'Polo Básico Blanco',
    slug: 'polo-basico-blanco',
    description: 'Polo de algodón 100%, corte regular, ideal para uso diario.',
    price: 49.90,
    stock: 30,
    imageUrl: 'https://picsum.photos/seed/product2/600/600',
    category: 'Ropa',
  },
  {
    id: '3',
    name: 'Mochila Antirrobo',
    slug: 'mochila-antirrobo',
    description: 'Mochila con compartimento para laptop y cierre oculto antirrobo.',
    price: 129.90,
    stock: 8,
    imageUrl: 'https://picsum.photos/seed/product3/600/600',
    category: 'Accesorios',
  },
  {
    id: '4',
    name: 'Reloj Deportivo',
    slug: 'reloj-deportivo',
    description: 'Resistente al agua, correa de silicona, pantalla digital.',
    price: 99.90,
    stock: 15,
    imageUrl: 'https://picsum.photos/seed/product4/600/600',
    category: 'Accesorios',
  },
]