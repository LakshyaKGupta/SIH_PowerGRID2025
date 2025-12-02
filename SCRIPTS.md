# 📋 Available NPM Scripts

This document explains all available commands for the POWERGRID Next.js application.

## Development Commands

### `npm run dev`
**Description**: Starts the development server with hot-reloading  
**Use when**: Developing and testing features  
**URL**: http://localhost:3000  
**Features**:
- Automatic page refresh on file changes
- TypeScript compilation
- CSS hot-reloading
- Detailed error messages

**Example**:
```powershell
npm run dev
```

---

## Production Commands

### `npm run build`
**Description**: Creates an optimized production build  
**Use when**: Preparing for deployment  
**Output**: `.next` folder with compiled assets  
**Features**:
- Code minification
- Image optimization
- Static page generation
- Bundle size analysis

**Example**:
```powershell
npm run build
```

### `npm start`
**Description**: Starts the production server  
**Use when**: Running the built application  
**Prerequisites**: Must run `npm run build` first  
**URL**: http://localhost:3000  

**Example**:
```powershell
npm run build
npm start
```

---

## Code Quality Commands

### `npm run lint`
**Description**: Runs ESLint to check code quality  
**Use when**: Before committing code  
**Checks**:
- TypeScript errors
- React best practices
- Code style issues
- Unused variables

**Example**:
```powershell
npm run lint
```

---

## Recommended Workflow

### For Development:
```powershell
# 1. Install dependencies (first time only)
npm install

# 2. Start development server
npm run dev

# 3. Make changes and test in browser
# 4. Check for errors
npm run lint
```

### For Production Deployment:
```powershell
# 1. Create production build
npm run build

# 2. Test production build locally
npm start

# 3. Deploy to hosting platform (Vercel, Netlify, etc.)
```

---

## Common Issues & Solutions

### Issue: Port 3000 is already in use
**Solution**: Use a different port
```powershell
$env:PORT=3001; npm run dev
```

### Issue: Build fails with TypeScript errors
**Solution**: Check the error messages and fix type issues
```powershell
npm run lint
# Fix reported errors
npm run build
```

### Issue: Changes not reflecting
**Solution**: Clear Next.js cache
```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

### Issue: Module not found errors
**Solution**: Reinstall dependencies
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

---

## Additional Commands (Optional)

You can add these to `package.json` scripts section:

### Clean Build
```json
"clean": "Remove-Item -Recurse -Force .next"
```

### Type Check
```json
"type-check": "tsc --noEmit"
```

### Format Code
```json
"format": "prettier --write ."
```

### Analyze Bundle
```json
"analyze": "ANALYZE=true npm run build"
```

---

## Performance Tips

1. **Development**:
   - Use `npm run dev` for fast iteration
   - Enable Fast Refresh for instant updates
   - Use React DevTools browser extension

2. **Production**:
   - Always run `npm run build` before deployment
   - Test with `npm start` locally first
   - Monitor bundle size warnings

3. **Code Quality**:
   - Run `npm run lint` before commits
   - Fix TypeScript errors immediately
   - Use ESLint auto-fix when possible

---

## Environment Variables

Create `.env.local` file for local configuration:

```env
# Firebase (if you want to override)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note**: Variables starting with `NEXT_PUBLIC_` are exposed to the browser.

---

## Useful Development Tools

### VS Code Extensions:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript + JavaScript

### Browser Extensions:
- React Developer Tools
- Redux DevTools (if using Redux)
- Firebase DevTools

---

**Happy coding! 🚀**
