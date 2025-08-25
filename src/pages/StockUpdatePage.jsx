import React, { useState, useMemo, useRef, useEffect } from "react";
import { Card } from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { Search, Save, X } from "lucide-react";
import { CATEGORIES } from "../utils/constants.js";

export default function StockUpdatePage({ items, setItems, onBack }) {
  const [query, setQuery] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Autocomplete suggestions
  const filteredSuggestions = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    const results = [];
    
    // Ürün adlarından öneriler
    items.forEach(item => {
      if (item.name.toLowerCase().includes(searchTerm)) {
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
      if (item.id.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'sku',
          text: item.id,
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

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearchChange = (value) => {
    setQuery(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
  };

  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.id.toLowerCase().includes(query.toLowerCase())
  );

  const handleEdit = (item) => {
    setEditingItem(item.id);
    setEditForm({
      name: item.name,
      category: item.category,
      stock: item.stock,
      reorderPoint: item.reorderPoint,
      price: item.price,
      cost: item.cost,
      barcode: item.barcode || ""
    });
  };

  const handleSave = (itemId) => {
    setItems(prev => prev.map(item =>
      item.id === itemId
        ? { 
            ...item, 
            name: editForm.name,
            category: editForm.category,
            stock: Number(editForm.stock),
            reorderPoint: Number(editForm.reorderPoint),
            price: Number(editForm.price),
            cost: Number(editForm.cost),
            barcode: editForm.barcode
          }
        : item
    ));
    setEditingItem(null);
    setEditForm({});
  };

  const handleCancel = () => {
    setEditingItem(null);
    setEditForm({});
  };

  return (
    <div className="stock-update-view">
      <div className="stock-header">
        <button className="btn btn--primary inline-flex gap-2" onClick={onBack}>
          ← Dashboard'a Dön
        </button>
        <h2>Stok Güncelleme</h2>
      </div>

      <Card className="mb-4">
        <div className="card__body">
          <div className="search" ref={searchRef}>
            <Search className="icon search__icon" />
            <input
              className="input search__input"
              placeholder="SKU, ürün adı, kategori ara..."
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
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
        </div>
      </Card>

      <Card>
        <div className="stock-table">
          <div className="table-header">
            <div>Ürün Adı</div>
            <div>SKU</div>
            <div>Kategori</div>
            <div>Stok</div>
            <div>ROP</div>
            <div>Fiyat (₺)</div>
            <div>Maliyet (₺)</div>
            <div>Barkod</div>
            <div>İşlem</div>
          </div>
          {filtered.map(item => (
            <div key={item.id} className="table-row">
              <div>
                {editingItem === item.id ? (
                  <input
                    type="text"
                    className="input table-input"
                    value={editForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                ) : (
                  <span>{item.name}</span>
                )}
              </div>
              <div>{item.id}</div>
              <div>
                {editingItem === item.id ? (
                  <select
                    className="input table-input"
                    value={editForm.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                ) : (
                  <span>{item.category}</span>
                )}
              </div>
              <div>
                {editingItem === item.id ? (
                  <input
                    type="number"
                    className="input table-input"
                    value={editForm.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                  />
                ) : (
                  <span>{item.stock}</span>
                )}
              </div>
              <div>
                {editingItem === item.id ? (
                  <input
                    type="number"
                    className="input table-input"
                    value={editForm.reorderPoint}
                    onChange={(e) => handleInputChange('reorderPoint', e.target.value)}
                  />
                ) : (
                  <span>{item.reorderPoint}</span>
                )}
              </div>
              <div>
                {editingItem === item.id ? (
                  <input
                    type="number"
                    className="input table-input"
                    value={editForm.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                  />
                ) : (
                  <span>₺{item.price?.toLocaleString() || 0}</span>
                )}
              </div>
              <div>
                {editingItem === item.id ? (
                  <input
                    type="number"
                    className="input table-input"
                    value={editForm.cost}
                    onChange={(e) => handleInputChange('cost', e.target.value)}
                  />
                ) : (
                  <span>₺{item.cost?.toLocaleString() || 0}</span>
                )}
              </div>
              <div>
                {editingItem === item.id ? (
                  <input
                    type="text"
                    className="input table-input"
                    value={editForm.barcode}
                    onChange={(e) => handleInputChange('barcode', e.target.value)}
                    placeholder="Barkod"
                  />
                ) : (
                  <span>{item.barcode || "-"}</span>
                )}
              </div>
              <div>
                {editingItem === item.id ? (
                  <div className="inline-flex gap-2">
                    <Button 
                      variant="primary" 
                      onClick={() => handleSave(item.id)}
                      className="btn--sm"
                    >
                      <Save className="icon" style={{ width: "14px", height: "14px" }} />
                      Kaydet
                    </Button>
                    <Button 
                      onClick={handleCancel}
                      className="btn--sm"
                    >
                      <X className="icon" style={{ width: "14px", height: "14px" }} />
                      İptal
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => handleEdit(item)}>Düzenle</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}


