# 🚀 Quick Start Guide - POWERGRID Next.js Application

## Installation & Setup (5 minutes)

### Step 1: Install Dependencies
Open PowerShell in the project directory and run:

```powershell
npm install
```

This will install all required packages including:
- Next.js, React, TypeScript
- Firebase for authentication
- Tailwind CSS for styling
- Chart.js for visualizations

### Step 2: Start Development Server
```powershell
npm run dev
```

The application will start at: **http://localhost:3000**

### Step 3: Create an Account
1. Open http://localhost:3000 in your browser
2. Click "Sign In" or "Get Started"
3. Click "Create Account" 
4. Enter your email and password (minimum 6 characters)
5. You'll receive a verification email from Firebase
6. Sign in with your credentials

### Step 4: Explore the Dashboard
Once logged in, you'll have access to:
- **Dashboard**: Overview of all projects and materials
- **AI Forecast**: Generate demand forecasts
- **Projects**: Manage transmission/substation projects
- **Inventory**: Track material stock levels
- **Procurement**: View and create purchase orders
- **Analytics**: View performance metrics
- **Reports**: Generate and export reports
- **Settings**: Configure your preferences

---

## 🎯 Key Features to Try

### 1. View Dashboard Statistics
- Active projects count
- Material inventory levels
- Monthly spending
- Forecast accuracy metrics

### 2. Browse Projects
Navigate to **Projects** to see:
- 765kV Mumbai-Pune Transmission Line
- 400kV Delhi NCR Substation
- 220kV Bangalore Grid Extension
- Chennai-Hyderabad HVDC Link

### 3. Check Inventory
Go to **Inventory** to:
- View all materials (Towers, Conductors, Insulators, etc.)
- Filter by category
- See stock levels and alerts
- Check what's in transit

### 4. Procurement Orders
Visit **Procurement** to:
- View existing purchase orders
- Filter by status (Pending, In Transit, Delivered)
- See supplier information
- Track order costs

---

## 🔧 Troubleshooting

### Port Already in Use
If port 3000 is busy, use a different port:
```powershell
$env:PORT=3001; npm run dev
```

### Build Errors
Clear cache and rebuild:
```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

### Firebase Authentication Issues
- Verify Firebase configuration in `lib/firebase.ts`
- Check that Authentication is enabled in Firebase Console
- Ensure email/password provider is active

### TypeScript Errors
Install all dependencies:
```powershell
npm install
```

---

## 📦 Build for Production

### Create Production Build
```powershell
npm run build
```

### Start Production Server
```powershell
npm start
```

### Deploy to Vercel
1. Push code to GitHub
2. Import repository in Vercel
3. Deploy automatically

---

## 🎨 Customization

### Change Theme Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  'jungle-green': '#006B3C',  // Change this
  'cream': '#FDFBF7',          // Change this
}
```

### Modify Data
Update sample data in `lib/data.ts`:
- Materials list
- Projects
- Suppliers
- Inventory levels

### Add New Pages
1. Create file in `pages/dashboard/yourpage.tsx`
2. Add route to `components/Sidebar.tsx`
3. Use `DashboardLayout` component

---

## 📚 Next Steps

1. **Connect Real Database**: Replace mock data with API calls
2. **Implement AI Model**: Add actual forecasting algorithms
3. **Enhanced Reports**: Build PDF generation features
4. **User Roles**: Add admin/user permission system
5. **Real-time Updates**: Implement WebSocket connections

---

## 💡 Tips

- **Hot Reload**: Changes auto-refresh in development
- **TypeScript**: Provides autocomplete and type safety
- **Responsive**: Works on mobile, tablet, and desktop
- **Print Ready**: Reports can be printed directly
- **Offline Support**: Can be enhanced with PWA features

---

## 🆘 Need Help?

- Check `README.md` for detailed documentation
- Review code comments in components
- Firebase docs: https://firebase.google.com/docs
- Next.js docs: https://nextjs.org/docs
- Tailwind docs: https://tailwindcss.com/docs

---

**Enjoy building with POWERGRID! ⚡**
