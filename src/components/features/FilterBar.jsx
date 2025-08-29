import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, Filter, Download, X } from "lucide-react";
import Button from "../ui/Button.jsx";

export default function FilterBar({ query, onQuery, category, onCategory, onlyLow, onOnlyLow, categories, onExport, items = [], onApplyPriceRange }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
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
    categories.forEach(cat => {
      if (cat.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'category',
          text: cat,
          icon: '🏷️'
        });
      }
    });
    
    // SKU'lardan/ID'den öneriler (güvenli stringleştirme)
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
    
    return results.slice(0, 8); // Maksimum 8 öneri
  }, [query, items, categories]);

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

  // Debounce
  const debounceRef = useRef(null);
  const handleInputChange = (value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onQuery(value);
      setShowSuggestions(value.length > 0);
    }, 250);
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'category') {
      onCategory(suggestion.text);
      onQuery(suggestion.text);
    } else {
      onQuery(suggestion.text);
    }
    setShowSuggestions(false);
  };

  return (
    <div className="filter-bar">
      <div className="search" ref={searchRef}>
        <Search className="icon search__icon" />
        <input 
          className="input search__input" 
          placeholder="SKU, ürün adı ara..." 
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
      
      <div className="filter-actions">
        <select className="input select" value={category} onChange={(e) => onCategory(e.target.value)}>
          <option>Hepsi</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <label className="checkbox">
          <input type="checkbox" checked={onlyLow} onChange={(e) => onOnlyLow(e.target.checked)} />
          <span>Sadece kritik stok</span>
        </label>
        <Button className="inline-flex gap-2" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
          <Filter className="icon" /> Gelişmiş Filtreler
        </Button>
        <Button className="inline-flex gap-2" onClick={onExport}><Download className="icon" /> Dışa Aktar</Button>
      </div>

      {showAdvancedFilters && (
        <div className="advanced-filters">
          <div className="advanced-filters__header">
            <h4>Gelişmiş Filtreler</h4>
            <button className="btn btn--ghost" onClick={() => setShowAdvancedFilters(false)}>
              <X className="icon" />
            </button>
          </div>
          <div className="advanced-filters__content">
            <div className="filter-group">
              <label>Min Fiyat (₺)</label>
              <input
                type="number"
                className="input"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min="0"
              />
            </div>
            <div className="filter-group">
              <label>Max Fiyat (₺)</label>
              <input
                type="number"
                className="input"
                placeholder="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min="0"
              />
            </div>
            <div className="filter-actions">
              <Button onClick={() => { setMinPrice(""); setMaxPrice(""); onApplyPriceRange && onApplyPriceRange({ min: "", max: "" }); }}>Temizle</Button>
              <Button className="btn--primary" onClick={() => { onApplyPriceRange && onApplyPriceRange({ min: minPrice, max: maxPrice }); setShowAdvancedFilters(false); }}>Uygula</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


