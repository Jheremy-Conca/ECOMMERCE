export interface Category {
    id: string
    name: string
    description: string
}

export const mockCategories: Category[] = [
    { id: '1', name: 'Calzado', description: 'Zapatillas, botas y calzado urbano' },
    { id: '2', name: 'Ropa', description: 'Prendas de vestir para uso diario' },
    { id: '3', name: 'Accesorios', description: 'Mochilas, relojes y complementos' },
]