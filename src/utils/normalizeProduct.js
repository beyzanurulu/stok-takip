export function normalizeProduct(raw) {
  const categoryValue = typeof raw.category === 'object' && raw.category !== null
    ? (raw.category.name ?? '')
    : (raw.category ?? '');

  return {
    id: raw.id,
    name: raw.name ?? '',
    description: raw.description ?? '',
    initialStock: Number(raw.initialStock ?? 0),
    stock: Number(raw.stock ?? 0),
    rop: Number(raw.rop ?? raw.reorderPoint ?? 0),
    sku: raw.sku ?? '',
    size: raw.size ?? '',
    color: raw.color ?? '',
    gender: raw.gender ?? '',
    price: Number(raw.price ?? 0),
    isForKids: Boolean(raw.isForKids),
    category: categoryValue,
    incoming: Number(raw.incoming ?? 0)
  };
}


