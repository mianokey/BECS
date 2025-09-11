<?php
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\NotificationController;


// Public routes
Route::post('/auth/login', [AuthController::class, 'login'])->name('login');
Route::post('/auth/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/users', [AuthController::class, 'all_users']);
});


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/attendance', [AttendanceController::class, 'index']); // all records
    Route::get('/attendance/today/{user}', [AttendanceController::class, 'today']); // today's record
    Route::post('/attendance/clock-in', [AttendanceController::class, 'clockIn']); // clock in
    Route::patch('/attendance/{attendance}', [AttendanceController::class, 'clockOut']); // clock out
});


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::get('/tasks/{id}', [TaskController::class, 'show']);
    Route::put('/tasks/{id}', [TaskController::class, 'update']);
    Route::patch('/tasks/{id}', [TaskController::class, 'update']);
    Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);
});

// API Resource Routes with auth middleware
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/projects', [ProjectController::class, 'index']);      // GET all projects
    Route::post('/projects', [ProjectController::class, 'store']);     // POST create project
    Route::get('/projects/{id}', [ProjectController::class, 'show']);  // GET single project
    Route::put('/projects/{id}', [ProjectController::class, 'update']); // PUT update project
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy']); // DELETE project
});


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index']); // list all notifications
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']); // unread count
    Route::post('/notifications/mark-read/{id}', [NotificationController::class, 'markAsRead']); // mark single read
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']); // mark all
});


//dashsboard stats
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard/stats', [StatsController::class, 'index']);
});



