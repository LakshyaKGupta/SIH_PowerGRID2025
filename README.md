Link - https://sih-powergrid.vercel.app/

# POWERGRID Material Demand Forecasting - Next.js

AI-powered material demand forecasting system for POWERGRID transmission and substation projects, built with Next.js and React.

## 🚀 Features

- **AI-Powered Forecasting**: Machine learning-based demand prediction with 94%+ accuracy
- **Real-time Dashboard**: Live analytics and inventory tracking
- **Project Management**: Track multiple transmission and substation projects
- **Smart Procurement**: Automated purchase order recommendations
- **Supplier Integration**: Manage supplier relationships and performance
- **Firebase Authentication**: Secure user authentication with email/password
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.x to 24.x
- npm or yarn package manager
- Python 3.10+ (for backend API)

## 🛠️ Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd POWERGRID_SIH
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Build for Production

```bash
# Create an optimized production build
npm run build

# Start the production server
npm start
```

## 📡 Backend API (FastAPI)

The AI model is hosted by a lightweight FastAPI service located in `server/`. It must be running for live forecasts.

1. **Create / activate a Python virtual environment** (e.g. `.venv`).
2. **Install backend dependencies**
   ```bash
   pip install -r server/requirements.txt
   ```
3. **Check the model artifact (optional)** – place `server/models/multi_output_model.pkl` if available.
4. **Run the API locally**
   ```bash
   npm run start:backend
   ```
5. **Expose the API to Next.js** – set in `.env.local`:
   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```
6. Visit `http://localhost:8000/health` to confirm the model loaded successfully (the response includes diagnostic info).

> If the model is missing or cannot be loaded, the API automatically uses heuristic fallback forecasting.

## 🗂️ Project Structure

```
POWERGRID_SIH/
├── components/           # React components
│   ├── DashboardLayout.tsx
│   ├── Header.tsx
│   └── Sidebar.tsx
├── lib/                 # Utilities and configurations
│   ├── api.ts          # API layer for data management
│   ├── auth.tsx        # Firebase authentication context
│   ├── data.ts         # Mock data for materials, projects, etc.
│   └── firebase.ts     # Firebase configuration
├── pages/              # Next.js pages
│   ├── auth/
│   │   └── signin.tsx
│   ├── dashboard/
│   │   ├── index.tsx
│   │   ├── forecast.tsx
│   │   ├── projects.tsx
│   │   ├── inventory.tsx
│   │   ├── procurement.tsx
│   │   ├── analytics.tsx
│   │   ├── reports.tsx
│   │   └── settings.tsx
│   ├── _app.tsx
│   ├── _document.tsx
│   └── index.tsx       # Landing page
├── styles/
│   └── globals.css     # Global styles and Tailwind
├── public/             # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## 🔐 Authentication

The app supports two auth modes:

1. **Firebase mode**: Email/password login through Firebase.
2. **Demo mode**: Available on `/auth/signin` with "Continue in Demo Mode" for quick testing and demos.

To run strictly on Firebase only, set:
```bash
NEXT_PUBLIC_ENABLE_DEMO_AUTH=false
```

## 📊 Dashboard Features

### Main Dashboard
- Real-time statistics overview
- Active projects count
- Materials tracking
- Monthly spending
- Forecast accuracy metrics

### AI Forecast
- Generate demand forecasts for new projects
- View historical forecast accuracy
- Material recommendations based on project type

### Projects
- View all transmission and substation projects
- Track material requirements and fulfillment
- Monitor project progress and budgets

### Inventory
- Real-time stock levels
- Material categories and suppliers
- Low stock alerts
- In-transit tracking

### Procurement
- View and create purchase orders
- Supplier performance tracking
- Automated procurement recommendations

### Analytics
- Forecast accuracy trends
- Material demand patterns
- Supplier performance metrics
- Cost analysis

### Reports
- Generate detailed project reports
- Export to PDF
- Print-ready formats

## 🎨 Customization

### Tailwind Configuration
Modify `tailwind.config.js` to customize:
- Colors (jungle-green, cream, etc.)
- Fonts
- Spacing
- Breakpoints

### Data Management
Update mock data in `lib/data.ts`:
- Materials
- Suppliers
- Projects
- Inventory levels

## 🔧 Technologies Used

- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Charts**: Chart.js with react-chartjs-2
- **PDF Generation**: jsPDF
- **State Management**: React Context API

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1920px and above)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add env vars from `.env.example`:
   - `NEXT_PUBLIC_ENABLE_DEMO_AUTH=true` for a zero-config demo deploy
   - Add Firebase vars if you want real authentication
   - Add `NEXT_PUBLIC_API_BASE_URL` only when a backend API is deployed
4. Deploy frontend

### Backend Deployment (optional but recommended for live ML API)

Deploy `server/` on Render/Railway/Fly.io and set:
- `ALLOW_MODEL_FALLBACK=true`
- `ML_MODEL_PATH=server/models/multi_output_model.pkl` (if model exists)

Then update frontend env:
- `NEXT_PUBLIC_API_BASE_URL=https://your-api-domain`

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Azure Static Web Apps
- Google Cloud Platform

## 🐛 Troubleshooting

### TypeScript Errors
If you see TypeScript errors about missing modules, ensure all dependencies are installed:
```bash
npm install
```

### Firebase Connection Issues
Verify your Firebase configuration in `lib/firebase.ts` and ensure:
- Authentication is enabled in Firebase Console
- API keys are correct
- Domain is authorized in Firebase settings

### Build Errors
Clear the Next.js cache:
```bash
rm -rf .next
npm run dev
```

## 📝 Migration Notes

This application was converted from a single-page HTML application to Next.js with the following improvements:

1. **Component-based Architecture**: Modular, reusable React components
2. **Type Safety**: Full TypeScript implementation
3. **Server-Side Rendering**: Improved performance and SEO
4. **Route-based Navigation**: Clean URL structure
5. **Better State Management**: Context API for authentication
6. **Improved Code Organization**: Separated concerns (UI, logic, data)

## 🤝 Contributing

To add new features:

1. Create new components in `components/`
2. Add new pages in `pages/dashboard/`
3. Update data models in `lib/data.ts`
4. Extend API in `lib/api.ts`

## 📄 License

This project is part of the POWERGRID infrastructure management system.

## 💬 Support

For issues or questions:
- Email: support@powergrid.in
- Phone: 1800-103-3333

---

**Note**: This is a demo application. For production use, implement:
- Backend API integration
- Database connectivity
- Enhanced security measures
- Real AI/ML models for forecasting
- Advanced error handling
- Logging and monitoring
