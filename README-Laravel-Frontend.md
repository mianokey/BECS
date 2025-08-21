# BECS Laravel Frontend Integration

## Overview

This is a React frontend specifically designed to consume Laravel API endpoints. The UI is built with modern React patterns and expects a Laravel backend with proper API structure.

## Key Features

### 🔧 Laravel API Integration
- Built for Laravel 10+ with Sanctum authentication
- CSRF token handling for state-changing operations
- Proper Laravel error response handling (422, 401, 403, 404)
- Environment-based API configuration

### 🎨 Modern React Architecture
- TypeScript throughout for type safety
- React Query for server state management
- Custom hooks for Laravel API consumption
- Responsive design with Tailwind CSS

### 🔐 Authentication System
- Laravel Sanctum session-based authentication
- Automatic CSRF token initialization
- Role-based access control (admin, director, staff)
- Proper logout with session clearing

## File Structure

```
client/src/
├── lib/
│   └── laravel-api.ts          # Laravel API client configuration
├── hooks/
│   ├── useLaravelAuth.ts       # Authentication hook
│   ├── useLaravelProjects.ts   # Projects management hook
│   └── useLaravelTasks.ts      # Tasks management hook
├── pages/
│   ├── laravel-login.tsx       # Login page for Laravel auth
│   └── laravel-dashboard.tsx   # Main dashboard
├── App-Laravel.tsx             # Main Laravel app component
├── main-laravel.tsx           # Laravel-specific entry point
└── index-laravel.html         # Laravel-optimized HTML
```

## Laravel Backend Requirements

### Expected API Endpoints

#### Authentication
```
POST /api/auth/login
GET  /api/auth/user
POST /api/auth/logout
GET  /sanctum/csrf-cookie
```

#### Projects
```
GET    /api/projects
POST   /api/projects
GET    /api/projects/{id}
PUT    /api/projects/{id}
DELETE /api/projects/{id}
```

#### Tasks
```
GET    /api/tasks
GET    /api/tasks?project_id={id}
GET    /api/tasks?user_id={id}
POST   /api/tasks
GET    /api/tasks/{id}
PUT    /api/tasks/{id}
DELETE /api/tasks/{id}
```

#### Users
```
GET /api/users
GET /api/users/{id}
PUT /api/users/{id}
```

#### Attendance
```
GET  /api/attendance
GET  /api/attendance/today/{userId}
POST /api/attendance/clock-in
POST /api/attendance/clock-out
```

### Laravel Response Format

#### Success Response
```json
{
  "id": 1,
  "name": "Project Name",
  "status": "active",
  "created_at": "2024-01-01T00:00:00.000000Z"
}
```

#### Validation Error (422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "name": ["The name field is required."],
    "email": ["The email field must be a valid email address."]
  }
}
```

#### Authentication Error (401)
```json
{
  "message": "Unauthenticated."
}
```

## Environment Configuration

### Frontend (.env)
```
VITE_LARAVEL_API_URL=http://localhost:8000
```

### Laravel Backend (.env)
```
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
SESSION_DRIVER=database
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
```

## Laravel Sanctum Configuration

### config/sanctum.php
```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
    Sanctum::currentApplicationUrlWithPort()
))),
```

### config/cors.php
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['http://localhost:3000'],
'supports_credentials' => true,
```

## Running the Laravel Frontend

### Development Mode
```bash
npm run dev:laravel
```

### Production Build
```bash
npm run build:laravel
```

## Laravel Models Expected

### User Model
```php
class User extends Authenticatable
{
    protected $fillable = [
        'staff_id', 'email', 'first_name', 'last_name', 
        'role', 'department', 'position', 'phone_number'
    ];
}
```

### Project Model
```php
class Project extends Model
{
    protected $fillable = [
        'name', 'code', 'type', 'client_name', 
        'description', 'status', 'start_date', 'end_date'
    ];
}
```

### Task Model
```php
class Task extends Model
{
    protected $fillable = [
        'title', 'description', 'project_id', 'assignee_id',
        'reviewer_id', 'priority', 'status', 'is_weekly_deliverable',
        'target_completion_date', 'actual_completion_date'
    ];
}
```

## Authentication Flow

1. **CSRF Cookie**: Frontend requests `/sanctum/csrf-cookie`
2. **Login**: POST to `/api/auth/login` with credentials
3. **Session**: Laravel creates authenticated session
4. **API Calls**: Subsequent requests include session cookie
5. **Logout**: POST to `/api/auth/logout` clears session

## Error Handling

The frontend handles Laravel-specific errors:
- **422**: Validation errors with field-specific messages
- **401**: Redirects to login page
- **403**: Access forbidden alerts
- **404**: Resource not found messages
- **500**: Generic server error handling

## TypeScript Types

All Laravel API responses are properly typed:
```typescript
interface LaravelUser {
  id: string;
  staff_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'director' | 'staff';
  // ...
}
```

## Demo Credentials

The system expects these users in your Laravel database:
- **Admin**: BECS001 / admin123
- **Director**: BECS003 / director123  
- **Staff**: BECS005 / staff123

## Professional Styling

- BECS corporate colors (blue primary, red accents)
- Professional letterhead-inspired design
- Responsive layout for all device sizes
- Loading states and error boundaries
- Proper form validation and user feedback

This frontend is production-ready and expects a fully functional Laravel API backend with proper authentication, validation, and resource management.