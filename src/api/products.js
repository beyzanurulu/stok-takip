import { fetchJson } from "./client.js";

// Sayfalı ürün listesi
export function listProducts(page = 1, size = 10, query = "", category = "Hepsi", onlyLow = false) {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("size", size);
  if (query) params.append("query", query);
  if (category !== "Hepsi") params.append("category", category);
  if (onlyLow) params.append("lowStock", "true");
  return fetchJson(`/product?${params.toString()}`);
}

// Tüm ürünler (dashboard için geniş sayfa ile getir)
export function getAllProducts(size = 1000) {
  const params = new URLSearchParams();
  params.append("page", 1);
  params.append("size", size);
  return fetchJson(`/product?${params.toString()}`);
}

// Toplam stok sayısı
export function getTotalStock() {
  return fetchJson("/product/all-stock");
}

// Düşük stoklu ürünler
export function getLowStockProducts() {
  return fetchJson("/product/low-stock");
}

// Yeni ürün ekleme
export function createProduct(product) {
  return fetchJson("/product", {
    method: "POST",
    body: product,
  });
}

// Tek ürün getirme
export function getProduct(productId) {
  return fetchJson(`/product/${encodeURIComponent(productId)}`);
}

// Ürün güncelleme
export function updateProduct(productId, product) {
  return fetchJson(`/product/${encodeURIComponent(productId)}`, {
    method: "PUT",
    body: product,
  });
}

// Ürün silme
export function deleteProduct(productId) {
  return fetchJson(`/product/${encodeURIComponent(productId)}`, {
    method: "DELETE",
  });
}
