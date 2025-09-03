## Stock Management Frontend (React + Vite)

This repository hosts the frontend of a full‑stack Stock Management system developed for the FLO Online Internship program. It delivers a modern dashboard, advanced filtering, product CRUD, and a clean integration with a live backend API.

Demo (Vercel): add your deployed URL
Backend base URL: https://stokyonetim.xyz

### Features
- Dashboard: total SKUs, total stock, low/out-of-stock, total value (sales-price based)
- Clickable “Low Stock” stat opens a modal listing critical/out-of-stock items
- Category-based stock distribution chart (Recharts)
- Products page with search, filters, server-side pagination (25 per page), and admin-only delete
- Stock Update page: all product fields are editable (name, sku, rop, size, color, gender, price, isForKids, category, stock)
- Add Product page (full page) with validation
- Debounced search suggestions by SKU/name
- CSV export
- ErrorBoundary for graceful UI error handling

### Tech Stack
- React 18 + Vite
- Fetch API for data operations (GET, POST, PUT, DELETE, PATCH)
- Recharts (charts), Lucide Icons (icons)
- Vanilla CSS with responsive grid/flex layout (no CSS frameworks)

### Project Structure (high-level)
- Pages: `DashboardPage`, `ProductsPage`, `StockUpdatePage`, `SettingsPage`, `AddProductPage`, `Login`
- Components: `Card`, `Stat`, `Modal`, `FilterBar`, `QuickActions`, `CategoryChart`, `Navbar`, `Sidebar`
- Hooks: `useProducts` for loading/pagination/CRUD
- Utils: `normalizeProduct` for mapping backend DTOs to UI‑friendly shapes

---

## Getting Started (Local)
Requirements: Node.js 18+

```bash
npm install
npm run dev   # http://localhost:5173
```

Environment variables (create `.env`):
```bash
VITE_API_URL=https://stokyonetim.xyz
```

Build and preview:
```bash
npm run build
npm run preview
```

---

## Backend Integration
- Base URL is provided via `VITE_API_URL` (e.g., `https://stokyonetim.xyz`).
- Authentication is token‑based (JWT). On login, the token is saved to `localStorage` and added to every request as:
  - `Authorization: Bearer <token>`
  - `Authentication: Bearer <token>` (per backend request)
- Automatic logout: on HTTP 401/403 or if the JWT is expired, the app clears the token and redirects to Login.

### Main Endpoints
- Auth: `POST /auth/register`, `POST /auth/login` (backend may return a raw JWT string)
- Products:
  - `GET /product?page=1&size=25` (server-side pagination for listing)
  - `GET /product?page=1&size=1000` (load all for dashboard)
  - `POST /product`, `GET /product/{id}`, `PUT /product/{id}`, `DELETE /product/{id}`
  - `GET /product/all-stock`, `GET /product/low-stock`

### Data Normalization
`normalizeProduct` ensures types are consistent and converts `category` objects to a string (e.g., `{ name: "Sneaker" }` → `"Sneaker"`) for rendering and filtering.

---

## Deployment (Vercel)
Recommended settings:
- Framework Preset: Vite
- Root Directory: `./`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Environment Variables: `VITE_API_URL=https://stokyonetim.xyz`

If you encounter “Failed to fetch” in production, the backend must allow CORS for your Vercel domain (see Troubleshooting).

---

## Security & Roles
- Delete action on the Products page is enabled only for admin users; non‑admins get an error.
- Product IDs are hidden from the UI but used internally for API operations.

---

## Troubleshooting
- Failed to fetch / CORS:
  - Ask backend to allow your origins.
  - Allow methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS` and headers: `Content-Type, Authorization, Authentication`.
  - Alternatively, use Vercel rewrites as a temporary proxy if backend changes are not possible.
- 401/403 after login:
  - Ensure both headers are sent if required: `Authorization` and `Authentication`.
  - Expired/invalid tokens trigger auto logout by design.
- Category not found on product create:
  - Send `category` as an object: `{ name: string }` and ensure the value matches backend categories.

---

