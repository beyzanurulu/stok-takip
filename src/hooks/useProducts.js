import { useEffect, useState, useCallback } from "react";
import { listProducts, getAllProducts, createProduct, updateProduct, deleteProduct } from "../api/products.js";
import { normalizeProduct } from "../utils/normalizeProduct.js";
import { MOCK_ITEMS } from "../utils/constants.js";

export default function useProducts(initialItems = []) {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    productCount: 0
  });

  // Normalizer utils'e taşındı

  function findFirstArrayDeep(value, depth = 0) {
    if (!value || depth > 5) return null;
    if (Array.isArray(value)) return value;
    if (typeof value === "object") {
      for (const key of Object.keys(value)) {
        const found = findFirstArrayDeep(value[key], depth + 1);
        if (found) return found;
      }
    }
    return null;
  }

  // Backend'den tüm ürünleri yükle - Token kontrollü
  const loadAllProducts = useCallback(async () => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    
    try {
      console.log("useProducts: Backend'den ürünler yükleniyor...");
      // Tüm ürünleri al (dashboard için, sayfalı endpointten büyük sayıda çek)
      const response = await getAllProducts(1000);
      
      if (!cancelled) {
        try { console.log("useProducts: Backend response:", JSON.stringify(response, null, 2)); } catch { console.log("useProducts: Backend response (object)"); }

        // 1) products alanı (sayfalı endpoint)
        if (response && Array.isArray(response.products)) {
          const normalized = response.products.map(normalizeProduct);
          setItems(normalized);
          setPagination({
            currentPage: response.currentPage || 1,
            totalPages: response.totalPages || 1,
            totalProducts: response.totalProducts || normalized.length,
            productCount: response.productCount || normalized.length
          });
          console.log("useProducts: products ile yüklendi:", normalized.length);
        // 2) Düz dizi
        } else if (Array.isArray(response)) {
          const normalized = response.map(normalizeProduct);
          setItems(normalized);
          console.log("useProducts: düz dizi ile yüklendi:", normalized.length);
        // 3) Obje içindeki ilk dizi alanı (data, content, items, list vs.)
        } else if (response && typeof response === 'object') {
          const firstArray = Object.values(response).find(Array.isArray) || findFirstArrayDeep(response);
          if (firstArray) {
            const normalized = firstArray.map(normalizeProduct);
            setItems(normalized);
            console.log("useProducts: objeden dizi bulundu, uzunluk:", normalized.length);
          } else {
            console.warn("useProducts: Yanıt içinde ürün dizisi bulunamadı");
          }
        }
      }
    } catch (err) {
      console.error("Products yükleme hatası:", err);
      if (!cancelled) {
        setError(err);
        // Hata durumunda mock data kullan
        console.log("useProducts: Hata nedeniyle mock data kullanılıyor");
        setItems(MOCK_ITEMS);
      }
    } finally {
      if (!cancelled) setLoading(false);
    }
    
    return () => { cancelled = true; };
  }, []);

  // İlk yüklemede: token varsa backend'den yükle, yoksa mock kullan
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      console.log("useProducts: Token bulundu, backend'den yükleniyor");
      loadAllProducts();
    } else {
      console.log("useProducts: Token yok, mock data kullanılacak");
      setItems(MOCK_ITEMS);
    }
  }, [loadAllProducts]);

  const addProduct = useCallback(async (product) => {
    try {
      const newProduct = await createProduct(product);
      // Backend'den gelen yeni ürünü listeye ekle
      setItems(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      console.error("Ürün ekleme hatası:", err);
      setError(err);
      throw err;
    }
  }, []);

  const saveProduct = useCallback(async (productId, productData) => {
    try {
      const updatedProduct = await updateProduct(productId, productData);
      // Backend'den gelen güncellenmiş ürünü listeye uygula
      setItems(prev => prev.map(item => 
        item.id === productId ? { ...item, ...updatedProduct } : item
      ));
      return updatedProduct;
    } catch (err) {
      console.error("Ürün güncelleme hatası:", err);
      setError(err);
      throw err;
    }
  }, []);

  const removeProduct = useCallback(async (productId) => {
    try {
      await deleteProduct(productId);
      // Backend'den başarıyla silindiyse local state'den de kaldır
      setItems(prev => prev.filter(item => item.id !== productId));
    } catch (err) {
      console.error("Ürün silme hatası:", err);
      setError(err);
      throw err;
    }
  }, []);

  // Sayfalı ürün yükleme fonksiyonu (ProductsPage için)
  const loadProductsPage = useCallback(async (page = 1, size = 25, query = "", category = "Hepsi", onlyLow = false) => {
    try {
      setLoading(true);
      const response = await listProducts(page, size, query, category, onlyLow);
      
      if (response && response.products) {
        setPagination({
          currentPage: response.currentPage || page,
          totalPages: response.totalPages || 1,
          totalProducts: response.totalProducts || 0,
          productCount: response.productCount || 0
        });
        return response.products;
      }
      return [];
    } catch (err) {
      console.error("Sayfalı ürün yükleme hatası:", err);
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    items, 
    setItems, 
    loading, 
    error, 
    pagination,
    addProduct, 
    saveProduct, 
    removeProduct,
    loadProductsPage,
    loadAllProducts
  };
}


