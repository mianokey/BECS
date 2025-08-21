# BECS Laravel Frontend Setup

## Quick Start

### 1. Extract and Install
```bash
# Extract the ZIP file
unzip becs-laravel-frontend.zip
cd becs-laravel-frontend

# Install dependencies
npm install
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env file to point to your Laravel backend
VITE_LARAVEL_API_URL=http://localhost:8000
```

### 3. Start Development Server
```bash
npm run dev
```

Visit http://localhost:3000 to see the application.

## File Structure

```
becs-laravel-frontend/
├── src/
│   ├── lib/
│   │   └── laravel-api.ts           # Laravel API client
│   ├── hooks/
│   │   ├── useLaravelAuth.ts        # Authentication hook
│   │   ├── useLaravelProjects.ts    # Projects hook
│   │   └── useLaravelTasks.ts       # Tasks hook
│   ├── pages/
│   │   ├── laravel-login.tsx        # Login page
│   │   └── laravel-dashboard.tsx    # Main dashboard
│   ├── App-Laravel.tsx              # Main app component
│   └── main-laravel.tsx            # Entry point
├── index-laravel.html              # HTML template
├── package.json                    # Dependencies
├── vite.laravel.config.ts         # Vite configuration
├── tailwind.config.js             # Tailwind CSS config
└── tsconfig.json                  # TypeScript config
```

## Laravel Backend Requirements

Your Laravel backend must provide these endpoints:

### Authentication
- `GET /sanctum/csrf-cookie` - CSRF token
- `POST /api/auth/login` - User login
- `GET /api/auth/user` - Get authenticated user
- `POST /api/auth/logout` - User logout

### Resources
- `GET /api/projects` - List projects
- `GET /api/tasks` - List tasks
- `GET /api/users` - List users
- `GET /api/attendance` - Attendance records

## Demo Credentials

Test with these credentials (ensure they exist in your Laravel database):
- **Admin**: BECS001 / admin123
- **Director**: BECS003 / director123
- **Staff**: BECS005 / staff123

## Production Build

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Key Features

- ✅ Laravel Sanctum authentication
- ✅ CSRF token handling
- ✅ TypeScript throughout
- ✅ React Query for API calls
- ✅ Professional BECS styling
- ✅ Responsive design
- ✅ Error handling for Laravel responses
- ✅ Role-based access control

## Documentation

- `README-Laravel-Frontend.md` - Detailed technical documentation
- `DEPLOYMENT-GUIDE.md` - Production deployment guide
- `laravel-export.md` - Laravel backend implementation guide

## Support

For issues or questions about this Laravel frontend implementation, refer to the included documentation files.