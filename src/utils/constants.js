// Shared constants used across the app

// Backend kategorileriyle uyumlu isimler
export const CATEGORIES = [
  "Sneaker",
  "Spor Ayakkabı",
  "Günlük Ayakkabı",
  "Bot"
];

// Backend kategori ID eşlemesi (backend'den dönen örneklere göre)
export const CATEGORY_ID_BY_NAME = {
  "Spor Ayakkabı": 1,
  "Günlük Ayakkabı": 2,
  "Bot": 4,
  "Sneaker": 9
};

export const GENDERS = [
  "Erkek",
  "Kadın",
  "Unisex",
  "Çocuk"
];

export const COLORS = [
  "Siyah",
  "Beyaz",
  "Mavi",
  "Kırmızı",
  "Yeşil",
  "Sarı",
  "Turuncu",
  "Pembe",
  "Mor",
  "Kahverengi",
  "Gri"
];

export const MOCK_ITEMS = [
  {
    id: "SKU-1001",
    name: "Kadın Sneaker",
    category: "Ayakkabı",
    stock: 42,
    reorderPoint: 20,
    incoming: 50,
    price: 1299,
    cost: 850,
  },
  {
    id: "SKU-1002",
    name: "Omuz Çantası - Deri",
    category: "Omuz Çantası",
    stock: 12,
    reorderPoint: 25,
    incoming: 0,
    price: 899,
    cost: 520,
  },
  {
    id: "SKU-1003",
    name: "Okul Çantası 30L",
    category: "Okul Çantası",
    stock: 0,
    reorderPoint: 15,
    incoming: 80,
    price: 749,
    cost: 430,
  },
  {
    id: "SKU-1004",
    name: "Erkek Eşofman Altı",
    category: "Eşofman",
    stock: 18,
    reorderPoint: 12,
    incoming: 0,
    price: 499,
    cost: 260,
  },
  {
    id: "SKU-1005",
    name: "Çorap 3'lü Paket",
    category: "Aksesuar",
    stock: 75,
    reorderPoint: 30,
    incoming: 0,
    price: 129,
    cost: 60,
  },
];


