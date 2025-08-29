import React from "react";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { ArrowLeft } from "lucide-react";
import { CATEGORIES } from "../utils/constants.js";

export default function AddProductPage({ form, setForm, errors, onSubmit, onBack }) {
  return (
    <div className="add-product-page">
      <div className="page-header">
        <button className="btn btn--primary inline-flex gap-2" onClick={onBack}>
          <ArrowLeft className="icon" /> Dashboard'a Dön
        </button>
        <h2>Yeni Ürün Ekle</h2>
      </div>

      <Card>
        <CardHeader title="Ürün Bilgileri" />
        <div className="card__body">
                     <div className="form-grid">
             <label className="form-row">
               <span>Ürün Adı</span>
               <input 
                 className={`input ${errors.name ? "input--error" : ""}`} 
                 value={form.name} 
                 onChange={e => setForm({...form, name: e.target.value})} 
                 placeholder="Ürün adını girin"
               />
               {errors.name && <div className="error">{errors.name}</div>}
             </label>

             <input 
               type="hidden"
               value={form.backendId || ""}
               readOnly
             />

            <label className="form-row">
              <span>Kategori</span>
              <select 
                className="input" 
                value={form.category} 
                onChange={e => setForm({...form, category: e.target.value})}
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </label>

            <label className="form-row">
              <span>Başlangıç Stok</span>
              <input 
                type="number" 
                className={`input ${errors.stock ? "input--error" : ""}`} 
                value={form.stock} 
                onChange={e => setForm({...form, stock: e.target.value})} 
                placeholder="0"
              />
              {errors.stock && <div className="error">{errors.stock}</div>}
            </label>

            <label className="form-row">
              <span>ROP (Yeniden Sipariş Noktası)</span>
              <input 
                type="number" 
                className={`input ${errors.reorderPoint ? "input--error" : ""}`} 
                value={form.reorderPoint} 
                onChange={e => setForm({...form, reorderPoint: e.target.value})} 
                placeholder="10"
              />
              {errors.reorderPoint && <div className="error">{errors.reorderPoint}</div>}
            </label>

            <label className="form-row">
              <span>Satış Fiyatı (₺)</span>
              <input 
                type="number" 
                className={`input ${errors.price ? "input--error" : ""}`} 
                value={form.price} 
                onChange={e => setForm({...form, price: e.target.value})} 
                placeholder="0"
              />
              {errors.price && <div className="error">{errors.price}</div>}
            </label>

            <label className="form-row">
              <span>Boyut</span>
              <input 
                type="number" 
                step="0.5"
                className="input"
                value={form.size || ""}
                onChange={e => setForm({...form, size: e.target.value})}
                placeholder="Örn: 42 veya 42.5"
              />
            </label>

            <label className="form-row">
              <span>Renk</span>
              <input 
                className="input"
                value={form.color || ""}
                onChange={e => setForm({...form, color: e.target.value})}
                placeholder="Örn: Siyah"
              />
            </label>

            <label className="form-row">
              <span>Cinsiyet</span>
              <select 
                className="input"
                value={form.gender || ""}
                onChange={e => setForm({...form, gender: e.target.value})}
              >
                <option value="">Seçiniz</option>
                <option value="male">Erkek</option>
                <option value="female">Kadın</option>
                <option value="unisex">Unisex</option>
              </select>
            </label>

            <label className="form-row form-row--full">
              <span>SKU</span>
              <input 
                className={`input ${errors.sku ? "input--error" : ""}`} 
                value={form.sku}
                onChange={e => setForm({...form, sku: e.target.value})}
                placeholder="Örn: PEG40-BLK-42"
              />
              {errors.sku && <div className="error">{errors.sku}</div>}
            </label>
            <label className="form-row form-row--full">
              <span>Barkod / SKU Notu</span>
              <input 
                className="input" 
                value={form.barcode} 
                onChange={e => setForm({...form, barcode: e.target.value})} 
                placeholder="Barkod veya kısa not" 
              />
            </label>
          </div>

          <div className="form-actions">
            <Button onClick={onBack}>Vazgeç</Button>
            <Button className="btn--primary" onClick={onSubmit}>Ürünü Kaydet</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
