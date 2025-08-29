import React, { useMemo, useState, useRef, useEffect } from "react";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { Search, Filter, Plus, Edit2, Trash2 } from "lucide-react";
import { CATEGORIES } from "../utils/constants.js";

export default function ProductsPage({ 
  items, 
  query, 
  setQuery, 
  category, 
  setCategory, 
  onlyLow, 
  setOnlyLow, 
  onOpenAdd, 
  onBack,
  isAdmin,
  removeProduct,
  loadProductsPage
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const searchRef = useRef(null);

  // Autocomplete suggestions
  const filteredSuggestions = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    const results = [];
    
    // Ürün adlarından öneriler
    items.forEach(item => {
      if ((item.name || "").toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'product',
          text: item.name,
          category: item.category,
          icon: '📦'
        });
      }
    });
    
    // Kategorilerden öneriler
    CATEGORIES.forEach(cat => {
      if (cat.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'category',
          text: cat,
          icon: '🏷️'
        });
      }
    });
    
    // SKU'lardan öneriler
    items.forEach(item => {
      const skuOrId = String(item.sku || item.id || "");
      if (skuOrId.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'sku',
          text: skuOrId,
          name: item.name,
          icon: '🏷️'
        });
      }
    });
    
    return results.slice(0, 8);
  }, [query, items]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value) => {
    setQuery(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'category') {
      setCategory(suggestion.text);
      setQuery(suggestion.text);
    } else {
      setQuery(suggestion.text);
    }
    setShowSuggestions(false);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const nameStr = String(item.name || "").toLowerCase();
      const skuOrId = String(item.sku || item.id || "").toLowerCase();
      const queryStr = String(query || "").toLowerCase();

      const matchesQuery = queryStr === "" || nameStr.includes(queryStr) || skuOrId.includes(queryStr);
      const matchesCategory = category === "Hepsi" || item.category === category;
      const ropValue = Number(item.rop ?? item.reorderPoint ?? 0);
      const matchesLowStock = !onlyLow || (Number(item.stock ?? 0) > 0 && Number(item.stock ?? 0) <= ropValue);
      
      return matchesQuery && matchesCategory && matchesLowStock;
    });
  }, [items, query, category, onlyLow]);

  // Sayfalama mantığı
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Sayfa değiştiğinde en üste scroll
  useEffect(() => {
    setCurrentPage(1);
  }, [query, category, onlyLow]);

  const getStockStatus = (item) => {
    if (item.stock === 0) return { status: "out", text: "Tükendi", class: "chip--danger" };
    if (item.stock <= item.reorderPoint) return { status: "low", text: "Düşük", class: "chip--danger" };
    return { status: "ok", text: "Normal", class: "chip--soft" };
  };

  const handleDeleteItem = async (itemId) => {
    if (!isAdmin) {
      alert("Bu işlemi sadece admin kullanıcıları yapabilir!");
      return;
    }
    
    if (confirm(`${items.find(item => item.id === itemId)?.name} ürününü silmek istediğinizden emin misiniz?`)) {
      try {
        await removeProduct(itemId);
      } catch (err) {
        console.error("Ürün silinirken hata:", err);
        alert("Ürün silinirken bir hata oluştu. Lütfen tekrar deneyin.");
      }
    }
  };

  return (
    <div className="products-view">
      {/* Header */}
      <div className="products-header">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Button onClick={onBack} variant="ghost">
            ← Geri
          </Button>
          <h2>Ürün Listesi</h2>
        </div>
        <Button onClick={onOpenAdd} variant="primary">
          <Plus className="icon" />
          Ürün Ekle
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="card__body">
          <div className="filter-bar">
            <div className="filter-actions">
              {/* Search with Autocomplete */}
              <div className="search" ref={searchRef}>
                <Search className="search__icon icon" />
                <input
                  className="input search__input"
                  placeholder="SKU, ürün adı, kategori ara..."
                  value={query}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onFocus={() => query.length > 0 && setShowSuggestions(true)}
                />
                
                {/* Autocomplete Suggestions */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="search-suggestions">
                    {filteredSuggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        className="search-suggestion-item"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <span className="suggestion-icon">{suggestion.icon}</span>
                        <div className="suggestion-content">
                          <div className="suggestion-text">{suggestion.text}</div>
                          {suggestion.category && (
                            <div className="suggestion-category">{suggestion.category}</div>
                          )}
                          {suggestion.name && (
                            <div className="suggestion-name">{suggestion.name}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Filter */}
              <select
                className="input select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Hepsi">Tüm Kategoriler</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Low Stock Filter */}
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={onlyLow}
                  onChange={(e) => setOnlyLow(e.target.checked)}
                />
                Sadece düşük stok
              </label>
            </div>

            <div style={{ fontSize: "14px", color: "var(--muted)" }}>
              {filteredItems.length} üründen {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} gösteriliyor
            </div>
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <h3 className="card__title">Ürünler</h3>
        </CardHeader>
        <div className="card__body">
          {filteredItems.length === 0 ? (
            <div className="empty">
              <Filter className="icon" />
              Ürün bulunamadı
            </div>
          ) : (
            <div className="products-table">
              {/* Table Header */}
              <div className="table-header">
                <div>Ürün</div>
                <div>SKU</div>
                <div>Kategori</div>
                <div>Stok</div>
                <div>Fiyat</div>
                <div>Durum</div>
                <div>Sil</div>
              </div>

              {/* Table Rows */}
              {paginatedItems.map((item) => {
                const stockStatus = getStockStatus(item);
                return (
                  <div key={item.id} className="table-row">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="muted">{item.sku || item.id}</div>
                    </div>
                    <div>{item.sku || item.id}</div>
                    <div>{item.category}</div>
                    <div className="font-medium">{item.stock}</div>
                    <div className="price">₺{item.price?.toLocaleString() || 0}</div>
                    <div>
                      <span className={`chip ${stockStatus.class}`}>
                        {stockStatus.text}
                      </span>
                    </div>
                    <div>
                      <Button 
                        variant="ghost" 
                        style={{ 
                          padding: "6px", 
                          color: isAdmin ? "var(--danger)" : "var(--muted)",
                          cursor: isAdmin ? "pointer" : "not-allowed",
                          opacity: isAdmin ? 1 : 0.5
                        }}
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={!isAdmin}
                        title={isAdmin ? "Ürünü Sil" : "Bu işlemi sadece admin yapabilir"}
                      >
                        <Trash2 style={{ width: "14px", height: "14px" }} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sayfalama */}
          {totalPages > 1 && (
            <div className="pagination">
              <Button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                ← Önceki
              </Button>
              
              <span className="pagination-info">
                Sayfa {currentPage} / {totalPages}
              </span>
              
              <Button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Sonraki →
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
