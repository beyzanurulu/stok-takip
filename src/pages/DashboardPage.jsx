import React, { useMemo, useState } from "react";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import Stat from "../components/ui/Stat.jsx";
import FilterBar from "../components/features/FilterBar.jsx";
import QuickActions from "../components/features/QuickActions.jsx";
import CategoryChart from "../components/features/CategoryChart.jsx";
import { Box, ShoppingCart, AlertTriangle, FileBarChart2, Plus, PackageCheck } from "lucide-react";
import { CATEGORIES } from "../utils/constants.js";
import Modal from "../components/ui/Modal.jsx";

export default function DashboardPage({ items, query, setQuery, category, setCategory, onlyLow, setOnlyLow, onExportCSV, onOpenAdd, onOpenStock, onOpenReports }) {
  const [lowOpen, setLowOpen] = useState(false);
  const totalSku = items.length;
  const totalStock = items.reduce((s, i) => s + i.stock, 0);
  const lowStock = items.filter((i) => i.stock > 0 && i.stock <= i.reorderPoint).length;
  const outStock = items.filter((i) => i.stock === 0).length;
  const totalValue = items.reduce((s, i) => s + i.stock * (i.cost ?? i.price ?? 0), 0);

  const chartData = useMemo(() => {
    return CATEGORIES.map((c) => {
      const inCat = items.filter((i) => i.category === c);
      const total = inCat.reduce((s, i) => s + i.stock, 0);
      return { category: c, Stok: total };
    });
  }, [items]);

  return (
    <>
      <Card>
        <FilterBar
          query={query}
          onQuery={setQuery}
          category={category}
          onCategory={setCategory}
          onlyLow={onlyLow}
          onOnlyLow={setOnlyLow}
          categories={CATEGORIES}
          onExport={onExportCSV}
          items={items}
        />
      </Card>

      <section className="stats-grid">
        <Card><Stat icon={Box} label="Toplam Ürün" value={totalSku} sub="↑ %12" /></Card>
        <Card><Stat icon={ShoppingCart} label="Toplam Stok" value={totalStock} sub="↑ %8" /></Card>
        <Card><Stat icon={AlertTriangle} label="Düşük Stok" value={lowStock + outStock} sub={`kritik: ${lowStock}, stoksuz: ${outStock}`} onClick={() => setLowOpen(true)} /></Card>
        <Card><Stat icon={FileBarChart2} label="Toplam Değer" value={`₺${totalValue.toLocaleString("tr-TR")}`} sub="Satış fiyatı esaslı" /></Card>
      </section>

      <section className="grid-2">
        <QuickActions
          actions={[
            { title: "Yeni Ürün Ekle", desc: "Stok sistemine yeni ürün ekleyin", icon: Plus, onClick: onOpenAdd, accent: true },
            { title: "Stok Güncelle", desc: "Mevcut stok miktarlarını güncelleyin", icon: PackageCheck, onClick: onOpenStock },
          ]}
        />

        <Card>
          <CardHeader title="Kategori Bazlı Stok Dağılımı" />
          <CategoryChart data={chartData} />
        </Card>
      </section>

      <Modal title="Düşük Stok Uyarıları" open={lowOpen} onClose={() => setLowOpen(false)}>
        {items.filter((i) => i.stock <= i.reorderPoint).length === 0 && outStock === 0 ? (
          <div className="empty">Tüm ürünlerde yeterli stok bulunuyor!</div>
        ) : (
          <ul className="list">
            {items
              .filter((i) => i.stock === 0 || i.stock <= i.reorderPoint)
              .map((i) => (
                <li key={i.id} className="list__item">
                  <div>
                    <div className="list__title">{i.name}</div>
                    <div className="muted">{i.id} • ROP: {i.reorderPoint} • Stok: {i.stock}</div>
                  </div>
                  {i.stock === 0 ? (
                    <span className="chip chip--danger">Tükendi</span>
                  ) : i.incoming > 0 ? (
                    <span className="chip chip--soft">Yolda: {i.incoming}</span>
                  ) : (
                    <span className="chip chip--danger">Sipariş gerekli</span>
                  )}
                </li>
              ))}
          </ul>
        )}
      </Modal>
    </>
  );
}


