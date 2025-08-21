# BECS Laravel Frontend Deployment Guide

## Overview

This document provides deployment instructions for the BECS Task Management System with Laravel API backend and React frontend.

## Architecture

- **Backend**: Laravel 10+ with Sanctum authentication
- **Frontend**: React 18+ with TypeScript and Tailwind CSS
- **Database**: PostgreSQL (production) / SQLite (development)
- **Authentication**: Laravel Sanctum session-based

## Deployment Steps

### 1. Laravel Backend Setup

#### Install Laravel
```bash
composer create-project laravel/laravel becs-api
cd becs-api
```

#### Install Required Packages
```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

#### Configure Environment
```env
APP_NAME="BECS API"
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=becs_production
DB_USERNAME=becs_user
DB_PASSWORD=secure_password

SESSION_DRIVER=database
SESSION_LIFETIME=120

SANCTUM_STATEFUL_DOMAINS=localhost:3000,yourdomain.com
```

#### Database Migration
```bash
php artisan migrate
php artisan db:seed --class=BecsSeeder
```

### 2. Frontend Setup

#### Install Dependencies
```bash
npm install
```

#### Configure Environment
```env
VITE_LARAVEL_API_URL=http://localhost:8000
```

#### Build for Production
```bash
npm run build:laravel
```

### 3. Production Deployment

#### Laravel (Backend)
```bash
# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start production server
php artisan serve --host=0.0.0.0 --port=8000
```

#### React (Frontend)
```bash
# Build production assets
npm run build:laravel

# Serve with nginx or apache
# Point document root to dist/ folder
```

## Laravel Controllers Required

Copy these controllers to your Laravel application:

### AuthController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'staff_id' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('staff_id', $request->staff_id)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        Auth::login($user);

        return response()->json([
            'message' => 'Login successful',
            'user' => $user
        ]);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        Auth::logout();
        return response()->json(['message' => 'Logged out successfully']);
    }
}
```

### ProjectController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index()
    {
        return Project::all();
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'code' => 'required|string|unique:projects',
            'type' => 'required|in:ahp,private',
        ]);

        return Project::create($request->all());
    }

    public function show(Project $project)
    {
        return $project;
    }

    public function update(Request $request, Project $project)
    {
        $project->update($request->all());
        return $project;
    }

    public function destroy(Project $project)
    {
        $project->delete();
        return response()->json(['message' => 'Project deleted']);
    }
}
```

## API Routes (routes/api.php)

```php
<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Authentication routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/user', [AuthController::class, 'user']);
    
    // Resource routes
    Route::apiResource('projects', ProjectController::class);
    Route::apiResource('tasks', TaskController::class);
    Route::apiResource('users', UserController::class);
    
    // Attendance routes
    Route::get('/attendance', [AttendanceController::class, 'index']);
    Route::post('/attendance/clock-in', [AttendanceController::class, 'clockIn']);
    Route::post('/attendance/clock-out', [AttendanceController::class, 'clockOut']);
});
```

## Database Models

### User.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $fillable = [
        'staff_id',
        'email',
        'first_name',
        'last_name',
        'role',
        'department',
        'position',
        'phone_number',
        'password',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];
}
```

### Project.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'type',
        'client_name',
        'description',
        'status',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];
}
```

## Production Checklist

- [ ] Laravel backend deployed and accessible
- [ ] Database migrated with seed data
- [ ] Sanctum configured with correct domains
- [ ] CORS properly configured
- [ ] Frontend built and deployed
- [ ] Environment variables set correctly
- [ ] HTTPS enabled (production)
- [ ] Session storage configured (Redis recommended)

## Demo Data

The system expects these users in your database:
- BECS001 (Admin) - admin123
- BECS003 (Director) - director123
- BECS005 (Staff) - staff123

## Support

For deployment issues:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Verify API endpoints: `GET /api-docs`
3. Test authentication: `POST /api/auth/login`
4. Confirm CORS settings for frontend domain