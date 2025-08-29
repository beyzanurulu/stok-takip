import React, { useState, useEffect } from "react";
import "./App.css";
import { FileBarChart2, Layers, Plus, PackageCheck, Settings } from "lucide-react";
import Sidebar from "./components/layout/Sidebar.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import StockUpdatePage from "./pages/StockUpdatePage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import AddProductPage from "./pages/AddProductPage.jsx";
import Login from "./login.jsx";
import ErrorBoundary from "./components/ui/ErrorBoundary.jsx";
import { MOCK_ITEMS } from "./utils/constants.js";
import { NAV_ITEMS } from "./utils/nav.js";
import { CATEGORY_ID_BY_NAME } from "./utils/constants.js";
import useProducts from "./hooks/useProducts.js";
import { isAuthenticated, clearToken } from "./api/auth.js";


export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Hepsi");
  const [onlyLow, setOnlyLow] = useState(false);
  const { items, setItems, loading, error, addProduct, saveProduct, removeProduct, loadProductsPage, loadAllProducts } = useProducts();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [reportsView, setReportsView] = useState(false);
  const [settingsView, setSettingsView] = useState(false);
  const [productsView, setProductsView] = useState(false);
  const [addView, setAddView] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true); // Admin kontrolü için

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      
      // Test için: Token'ı temizle
      console.log("Mevcut token:", localStorage.getItem('authToken'));
      
      try {
        const isAuth = isAuthenticated();
        console.log("Auth check - token var mı?", isAuth);
        setAuthenticated(isAuth);
      } catch (err) {
        console.error("Auth check error:", err);
        setAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    };
    
    checkAuth();
    const onExpired = () => {
      setAuthenticated(false);
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  // Toggle function
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Sidebar menüsü sabitlere taşındı
  const [active, setActive] = useState("dashboard");

  // Ürün Ekle sayfası & formu
  const [stockView, setStockView] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Sneaker",
    stock: 0,
    reorderPoint: 10,
    price: 0,
    sku: "",
    barcode: "",
    backendId: ""
  });
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Ürün adı gerekli";
    if (!form.category) e.category = "Kategori gerekli";
    if (form.stock < 0) e.stock = "Stok negatif olamaz";
    if (form.reorderPoint < 0) e.reorderPoint = "ROP negatif olamaz";
    if (form.price < 0) e.price = "Fiyat negatif olamaz";
    if (!String(form.sku || form.barcode || "").trim()) e.sku = "SKU veya barkod gerekli";
    return e;
  }

  async function handleAddSubmit() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    try {
      const stockNum = Number(form.stock) || 0;
      const ropNum = Number(form.reorderPoint) || 0;
      const priceNum = Number(form.price) || 0;
      const skuVal = (form.sku?.trim() || form.barcode?.trim() || "");

      const newProduct = {
        name: form.name.trim(),
        description: form.description?.trim() || "",
        // Backend CategoryCreateRequestDTO => { name: string }
        category: { name: form.category },
        initialStock: stockNum,
        stock: stockNum,
        rop: ropNum,
        sku: skuVal,
        size: form.size ? Number(form.size) : null,
        color: form.color || "",
        gender: form.gender || "",
        price: priceNum
      };

      // Backend API'sine ürün gönder
      await addProduct(newProduct);
      
      setAddView(false);
      setForm({ name: "", category: "Sneaker", stock: 0, reorderPoint: 10, price: 0, sku: "", barcode: "", size: "", color: "", gender: "", backendId: "" });
    } catch (err) {
      console.error("Ürün eklenirken hata:", err);
      setErrors({ submit: "Ürün eklenirken bir hata oluştu. Lütfen tekrar deneyin." });
    }
  }

  // Login handler
  const handleLogin = async (response) => {
    console.log("App.jsx handleLogin çağrıldı:", response);
    setAuthenticated(true);
    // Admin kontrolü - backend'den gelecek
    setIsAdmin(response.role === 'admin' || response.isAdmin);
    console.log("Authentication state güncellendi:", { authenticated: true, isAdmin: response.role === 'admin' || response.isAdmin });
    
    // Login sonrası backend'den ürünleri yükle
    console.log("Login sonrası backend ürünleri yükleniyor...");
    try {
      await loadAllProducts();
      console.log("Backend ürünleri başarıyla yüklendi");
    } catch (err) {
      console.error("Login sonrası ürün yükleme hatası:", err);
    }
  };

  // Çıkış işlemi
  function handleExit() {
    clearToken();
    setAuthenticated(false);
    setActive("dashboard");
    // Tüm view state'leri sıfırla
    setProductsView(false);
    setStockView(false);
    setAddView(false);
    setSettingsView(false);
  }

  // DashboardPage içinde hesaplamalar yapılacak; burada tutulmuyor

  function exportCSV() {
    const header = ["id", "name", "category", "stock", "reorderPoint", "incoming", "price"].join(",");
    const rows = items
      .map((i) => [i.id, i.name, i.category, i.stock, i.reorderPoint, i.incoming, i.price ?? ""].join(","))
      .join("\n");
    const csv = header + "\n" + rows;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stoklar.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Loading durumunda loading ekranı göster
  if (authLoading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  // Giriş yapılmamışsa login sayfasını göster
  if (!authenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <ErrorBoundary>
    <div className="app">
      {/* SIDEBAR */}
      {/* SIDEBAR */}
      <Sidebar
        open={sidebarOpen}
        items={NAV_ITEMS}
        activeKey={active}
        onToggle={toggleSidebar}
        onChange={(key) => {
          if (key === "create") { setAddView(true); setActive("add"); return; }
          if (key === "products") { setProductsView(true); setStockView(false); setAddView(false); setSettingsView(false); setActive("products"); return; }
          if (key === "stock") { setStockView(true); setProductsView(false); setAddView(false); setSettingsView(false); setActive("stock"); return; }
          // Reports removed
          if (key === "settings") { setSettingsView(true); setProductsView(false); setStockView(false); setAddView(false); setActive("settings"); return; }
          setProductsView(false); setStockView(false); setAddView(false); setSettingsView(false);
          setActive(key);
        }}
      />

      {/* TOP NAVBAR */}
      <Navbar sidebarOpen={sidebarOpen} onExit={handleExit} />

  <main className={`main ${sidebarOpen ? 'main--sidebar-open' : 'main--sidebar-closed'}`}>
  <div className="container">
    {addView ? (
      <AddProductPage 
        form={form}
        setForm={setForm}
        errors={errors}
        onSubmit={handleAddSubmit}
        onBack={() => { setAddView(false); setActive("dashboard"); }}
      />
    ) : stockView ? (
      <StockUpdatePage 
        items={items} 
        setItems={setItems}
        saveProduct={saveProduct}
        onBack={() => { setStockView(false); setActive("dashboard"); }}
      />
    ) : settingsView ? (
      <SettingsPage 
        onBack={() => { setSettingsView(false); setActive("dashboard"); }}
      />
    ) : productsView ? (
      <ProductsPage
        items={items}
        query={query}
        setQuery={setQuery}
        category={category}
        setCategory={setCategory}
        onlyLow={onlyLow}
        setOnlyLow={setOnlyLow}
        onOpenAdd={() => setAddView(true)}
        onBack={() => { setProductsView(false); setActive("dashboard"); }}
        isAdmin={isAdmin}
        removeProduct={removeProduct}
        loadProductsPage={loadProductsPage}
      />
    ) : (
      <DashboardPage
        items={items}
        query={query}
        setQuery={setQuery}
        category={category}
        setCategory={setCategory}
        onlyLow={onlyLow}
        setOnlyLow={setOnlyLow}
        onExportCSV={exportCSV}
        onOpenAdd={() => setAddView(true)}
        onOpenStock={() => { setStockView(true); setActive("stock"); }}
        onOpenReports={() => { /* removed */ }}
      />
      )}
   </div>  
           
       




      </main>
    </div>
    </ErrorBoundary>
  );
}
