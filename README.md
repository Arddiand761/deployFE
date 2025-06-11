# BudgetEase - Personal Finance Management App

BudgetEase adalah aplikasi manajemen keuangan pribadi yang membantu pengguna mencatat, menganalisis, dan merencanakan keuangan mereka secara efektif. Aplikasi ini dibangun menggunakan React dengan Vite dan terintegrasi dengan backend API untuk penyimpanan data.

## 🚀 Fitur Utama

### 💰 Manajemen Transaksi

- **Input Transaksi**: Catat pemasukan dan pengeluaran dengan mudah
- **Riwayat Transaksi**: Lihat semua transaksi dengan fitur filter dan pencarian
- **Kategorisasi Otomatis**: Sistem AI yang mengkategorikan transaksi berdasarkan judul

### 📊 Dashboard & Analytics

- **Summary Cards**: Ringkasan total income, expense, dan saldo bersih
- **Grafik Mingguan**: Visualisasi pengeluaran 6 minggu terakhir
- **Grafik Harian**: Perbandingan income vs expense 7 hari terakhir
- **Prediksi AI**: Machine learning untuk memprediksi pengeluaran hari berikutnya

### 🎯 Goals & Budget

- **Manajemen Goals**: Buat dan kelola target finansial
- **Progress Tracking**: Monitor pencapaian goals dengan progress bar
- **Add Funds**: Tambah dana ke goals yang sudah dibuat
- **Budget Summary**: Ringkasan pemasukan, pengeluaran, dan sisa dana

### 👤 Profile Management

- **Edit Profile**: Kelola informasi pribadi
- **Change Password**: Ganti password dengan validasi keamanan
- **Delete Account**: Hapus akun dengan konfirmasi

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Animation**: Framer Motion
- **Charts**: Recharts
- **HTTP Client**: Fetch API
- **Deployment**: Netlify

## 📁 Struktur Proyek

```
src/
├── component/
│   ├── BudgetAndGoals.jsx     # Halaman manajemen goals dan budget
│   ├── DataDiri.jsx           # Form data diri (onboarding)
│   ├── GoalCard.jsx           # Komponen kartu goal
│   ├── home.jsx               # Dashboard utama
│   ├── InformasiPribadi.jsx   # Form informasi pribadi
│   ├── introduction.jsx       # Halaman pengenalan
│   ├── login.jsx              # Halaman login
│   ├── profile.jsx            # Halaman profile settings
│   ├── ProgressBar.jsx        # Komponen progress bar
│   ├── register.jsx           # Halaman registrasi
│   ├── sidebar.jsx            # Navigasi sidebar
│   ├── TransactionInput.jsx   # Form input transaksi
│   └── TransactionList.jsx    # Daftar riwayat transaksi
├── App.jsx                    # Root component dengan routing
├── main.jsx                   # Entry point
└── index.css                  # Global styles
```

## 🔗 API Endpoints

Aplikasi terhubung dengan backend di `https://backendhapi-production.up.railway.app`:

- `GET /me` - Get user profile
- `GET /transactions` - Get user transactions
- `POST /transactions` - Create new transaction
- `GET /transactions/prediction` - Get AI prediction
- `GET /goals` - Get user goals
- `POST /goals` - Create new goal
- `PUT /goals/:id` - Update goal (add funds)
- `DELETE /goals/:id` - Delete goal
- `PUT /update-password` - Update password
- `DELETE /delete-user` - Delete user account

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v16 atau lebih tinggi)
- npm atau yarn

### Clone Repository

```bash
git clone <repository-url>
cd frontend
```

### Install Dependencies

```bash
npm install
```

### Environment Setup

Pastikan file `public/_redirects` sudah ada untuk deployment Netlify:

```
/*    /index.html   200
```

### Development

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🌐 Deployment

### Netlify Deployment

1. Build project: `npm run build`
2. Upload folder `dist` ke Netlify atau connect dengan Git
3. Konfigurasi redirects sudah otomatis dengan file `_redirects`

### Environment Variables

Tidak ada environment variables yang perlu dikonfigurasi, base URL API sudah hardcoded.

## 📱 Responsive Design

Aplikasi dioptimalkan untuk:

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

Fitur mobile-friendly:

- Touch-optimized buttons
- Responsive navigation
- Mobile-first CSS approach
- Gesture support

## 🔒 Authentication

Sistem autentikasi menggunakan:

- JWT Token disimpan di localStorage
- Protected routes dengan PrivateRoute component
- Auto-redirect jika token expired
- Logout functionality

## 📊 Charts & Visualizations

Menggunakan Recharts untuk:

- **LineChart**: Trend pengeluaran mingguan dan perbandingan harian
- **ResponsiveContainer**: Adaptif dengan ukuran layar
- **Tooltip**: Informasi detail saat hover
- **Legend**: Keterangan grafik

## 🤖 AI Features

### Prediksi Pengeluaran

- Machine Learning model untuk prediksi pengeluaran harian
- Berdasarkan pola transaksi 3 hari terakhir
- Confidence level dan insights

### Auto Categorization

- Kategorisasi otomatis transaksi berdasarkan judul
- Fallback ke kategori "Lainnya" jika tidak dapat dikategorikan

## 🎨 UI/UX Features

### Design System

- **Color Palette**: Emerald sebagai primary, dengan accent colors
- **Typography**: Font system yang konsisten
- **Spacing**: Grid system 4px base
- **Border Radius**: Konsisten rounded corners

### Interactive Elements

- **Hover Effects**: Subtle animations pada buttons dan cards
- **Loading States**: Spinner dan skeleton loading
- **Form Validation**: Real-time validation dengan error messages
- **Success Feedback**: Toast notifications dan success states

### Accessibility

- **Focus Management**: Keyboard navigation support
- **ARIA Labels**: Screen reader friendly
- **Color Contrast**: WCAG compliant colors
- **Touch Targets**: Minimum 44px touch targets

## 📈 Performance Optimizations

- **Code Splitting**: Dynamic imports untuk routes
- **Image Optimization**: Optimized image assets
- **Bundle Analysis**: Vite bundle analyzer
- **Lazy Loading**: Components loaded on demand

## 🐛 Error Handling

- **API Error Handling**: Comprehensive error catching
- **Form Validation**: Client-side dan server-side validation
- **Network Error**: Retry mechanisms
- **Fallback UI**: Error boundaries dan fallback components

## 🔧 Configuration Files

### Vite Configuration

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

### Tailwind Configuration

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

## 📦 Dependencies

### Production Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.1",
  "framer-motion": "^10.0.0",
  "recharts": "^2.5.0"
}
```

### Development Dependencies

```json
{
  "@vitejs/plugin-react": "^3.1.0",
  "vite": "^4.1.0",
  "tailwindcss": "^3.2.0",
  "autoprefixer": "^10.4.13",
  "postcss": "^8.4.21",
  "eslint": "^8.35.0"
}
```

## 🎯 Key Features Deep Dive

### Dashboard Analytics

- Real-time financial overview
- Interactive charts dengan Recharts
- Responsive design untuk semua device
- Data visualization yang intuitive

### Transaction Management

- CRUD operations untuk transaksi
- Filter dan sort functionality
- Search dengan debounce
- Pagination untuk performance

### Goals Management

- Create financial goals dengan
