# 🗂️ Project Structure

```
F_SIH7/
│
├── 📁 components/                   # Reusable React Components
│   ├── DashboardLayout.tsx         # Main layout wrapper with sidebar
│   ├── Header.tsx                  # Top navigation bar
│   └── Sidebar.tsx                 # Left navigation menu
│
├── 📁 lib/                         # Utilities & Core Logic
│   ├── api.ts                      # API layer (data fetching & mutations)
│   ├── auth.tsx                    # Firebase authentication context
│   ├── data.ts                     # Mock data (materials, projects, etc.)
│   └── firebase.ts                 # Firebase configuration
│
├── 📁 pages/                       # Next.js Pages (Routes)
│   │
│   ├── 📁 auth/                    # Authentication Pages
│   │   ├── signin.tsx              # Sign in page (/auth/signin)
│   │   └── signup.tsx              # Sign up page (/auth/signup)
│   │
│   ├── 📁 dashboard/               # Protected Dashboard Pages
│   │   ├── index.tsx               # Main dashboard (/dashboard)
│   │   ├── analytics.tsx           # Analytics page (/dashboard/analytics)
│   │   ├── forecast.tsx            # AI forecast (/dashboard/forecast)
│   │   ├── inventory.tsx           # Inventory management (/dashboard/inventory)
│   │   ├── procurement.tsx         # Procurement orders (/dashboard/procurement)
│   │   ├── projects.tsx            # Projects list (/dashboard/projects)
│   │   ├── reports.tsx             # Reports generation (/dashboard/reports)
│   │   └── settings.tsx            # User settings (/dashboard/settings)
│   │
│   ├── _app.tsx                    # App wrapper (providers, global state)
│   ├── _document.tsx               # HTML document structure
│   └── index.tsx                   # Landing page (/)
│
├── 📁 public/                      # Static Assets
│   └── (add images, icons, etc.)
│
├── 📁 styles/                      # Stylesheets
│   └── globals.css                 # Global styles + Tailwind imports
│
├── 📁 node_modules/                # Dependencies (auto-generated)
│
├── 📁 .next/                       # Next.js build output (auto-generated)
│
├── 📄 .eslintrc.json               # ESLint configuration
├── 📄 .gitignore                   # Git ignore rules
├── 📄 next.config.js               # Next.js configuration
├── 📄 package.json                 # Dependencies & scripts
├── 📄 postcss.config.js            # PostCSS configuration
├── 📄 tailwind.config.js           # Tailwind CSS configuration
├── 📄 tsconfig.json                # TypeScript configuration
│
├── 📄 README.md                    # Full documentation
├── 📄 QUICKSTART.md                # Quick start guide
└── 📄 SCRIPTS.md                   # NPM scripts reference
```

---

## 📂 Folder Descriptions

### `/components`
**Purpose**: Reusable UI components  
**Contains**:
- Layout components (DashboardLayout, Header, Sidebar)
- Shared UI elements
- Component-specific logic

**When to add here**: Create components that are used in multiple pages

---

### `/lib`
**Purpose**: Core application logic and utilities  
**Contains**:
- API functions (`api.ts`)
- Authentication context (`auth.tsx`)
- Data models and mock data (`data.ts`)
- Firebase setup (`firebase.ts`)

**When to add here**: Business logic, utilities, configurations

---

### `/pages`
**Purpose**: Application routes (Next.js convention)  
**Structure**:
- Each file = a route
- Folder structure = URL path
- Special files: `_app.tsx`, `_document.tsx`

**Examples**:
- `pages/index.tsx` → `/`
- `pages/auth/signin.tsx` → `/auth/signin`
- `pages/dashboard/projects.tsx` → `/dashboard/projects`

---

### `/styles`
**Purpose**: Global CSS and styling  
**Contains**:
- `globals.css` - Tailwind imports + custom styles
- Component-specific CSS (if needed)

---

### `/public`
**Purpose**: Static files served directly  
**Use for**:
- Images, icons, fonts
- Manifest files
- Robots.txt, sitemap.xml

**Access**: Files in `/public` are served from root URL  
Example: `/public/logo.png` → `http://localhost:3000/logo.png`

---

## 🔄 Data Flow

```
User Action
    ↓
React Component (pages/)
    ↓
API Function (lib/api.ts)
    ↓
Data Source (lib/data.ts or Firebase)
    ↓
Component Re-renders
    ↓
User Sees Update
```

---

## 🛣️ Routing Examples

| URL | File | Description |
|-----|------|-------------|
| `/` | `pages/index.tsx` | Landing page |
| `/auth/signin` | `pages/auth/signin.tsx` | Sign in |
| `/auth/signup` | `pages/auth/signup.tsx` | Sign up |
| `/dashboard` | `pages/dashboard/index.tsx` | Main dashboard |
| `/dashboard/projects` | `pages/dashboard/projects.tsx` | Projects list |
| `/dashboard/inventory` | `pages/dashboard/inventory.tsx` | Inventory |

---

## 🎨 Styling Architecture

### Tailwind CSS Classes
Used directly in components:
```tsx
<div className="bg-white rounded-xl shadow-lg p-6">
```

### Global Styles
Custom CSS in `styles/globals.css`:
```css
.nav-link {
  transition: all 0.2s ease;
}
```

### CSS Modules (Optional)
For component-specific styles:
```
components/Button.module.css
components/Button.tsx
```

---

## 🔐 Authentication Flow

```
1. User visits site
    ↓
2. AuthProvider wraps app (_app.tsx)
    ↓
3. Firebase checks auth state (lib/auth.tsx)
    ↓
4. If authenticated → Dashboard
   If not → Landing page
    ↓
5. Protected routes check user (DashboardLayout.tsx)
```

---

## 📦 Key Files Explained

### `_app.tsx`
- Wraps all pages
- Provides global context (Auth, Theme, etc.)
- Includes global CSS

### `_document.tsx`
- Custom HTML structure
- Meta tags
- Font loading

### `next.config.js`
- Next.js configuration
- Image optimization
- Environment variables

### `tailwind.config.js`
- Custom colors
- Custom fonts
- Theme extensions

### `tsconfig.json`
- TypeScript settings
- Path aliases (@/ → root)
- Compilation options

---

## 🚀 Adding New Features

### 1. New Page
```
pages/dashboard/newpage.tsx
    ↓
Add route to Sidebar.tsx
    ↓
Import DashboardLayout
```

### 2. New Component
```
components/NewComponent.tsx
    ↓
Import in pages where needed
```

### 3. New API Function
```
lib/api.ts → Add new method
    ↓
Use in components with async/await
```

### 4. New Data Model
```
lib/data.ts → Add new data array
    ↓
Update TypeScript types
    ↓
Use in API layer
```

---

## 🎯 Best Practices

1. **Components**: Keep them small and focused
2. **Types**: Use TypeScript interfaces for data
3. **Styling**: Use Tailwind classes when possible
4. **State**: Use React hooks (useState, useEffect)
5. **API**: Centralize data fetching in lib/api.ts
6. **Files**: One component per file
7. **Naming**: Use PascalCase for components

---

**Happy organizing! 📂**
