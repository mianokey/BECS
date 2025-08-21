# BECS Laravel-Style Backend Implementation

## Overview

The BECS Task Management System has been successfully converted to use Laravel-style API architecture patterns while maintaining the React frontend. This implementation uses Node.js/Express but follows Laravel's structural patterns and conventions.

## Directory Structure

```
laravel-api/
├── README.md
├── app/
│   └── Http/
│       ├── Controllers/
│       │   ├── AuthController.js
│       │   ├── ProjectController.js
│       │   ├── TaskController.js
│       │   ├── UserController.js
│       │   └── AttendanceController.js
│       └── Middleware/
│           └── AuthMiddleware.js
└── routes/
    └── api.js
```

## Laravel-Style API Controllers

### 1. AuthController.js
```javascript
// Laravel-style authentication controller
export class AuthController {
  async user(req, res)     // Get authenticated user
  async login(req, res)    // Login with validation
  async logout(req, res)   // Session logout
}
```

### 2. ProjectController.js
```javascript
// RESTful project management
export class ProjectController {
  async index(req, res)    // GET /api/projects
  async store(req, res)    // POST /api/projects  
  async show(req, res)     // GET /api/projects/{id}
  async update(req, res)   // PUT /api/projects/{id}
  async destroy(req, res)  // DELETE /api/projects/{id}
}
```

### 3. TaskController.js
```javascript
// Task management with filtering
export class TaskController {
  async index(req, res)    // GET /api/tasks?projectId=1&status=active
  async store(req, res)    // POST /api/tasks
  async show(req, res)     // GET /api/tasks/{id}
  async update(req, res)   // PUT /api/tasks/{id}
  async destroy(req, res)  // DELETE /api/tasks/{id}
}
```

### 4. UserController.js
```javascript
// User profile management
export class UserController {
  async index(req, res)    // GET /api/users
  async show(req, res)     // GET /api/users/{id}
  async update(req, res)   // PUT /api/users/{id}
}
```

### 5. AttendanceController.js
```javascript
// Attendance tracking
export class AttendanceController {
  async index(req, res)    // GET /api/attendance
  async today(req, res)    // GET /api/attendance/today/{userId}
  async clockIn(req, res)  // POST /api/attendance/clock-in
  async clockOut(req, res) // POST /api/attendance/clock-out
}
```

## API Routes (Laravel-style)

```javascript
// routes/api.js - Laravel-style route definitions
router.get('/auth/user', authMiddleware, authController.user);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);

// Resource routes
router.get('/projects', authMiddleware, projectController.index);
router.post('/projects', authMiddleware, projectController.store);
router.get('/projects/:id', authMiddleware, projectController.show);
router.put('/projects/:id', authMiddleware, projectController.update);
router.delete('/projects/:id', authMiddleware, projectController.destroy);

// Similar patterns for tasks, users, attendance...
```

## Laravel-Style Middleware

```javascript
// app/Http/Middleware/AuthMiddleware.js
export const authMiddleware = async (req, res, next) => {
  // Session-based authentication
  if (req.session?.user) {
    req.user = req.session.user;
    return next();
  }
  
  // Development auto-login
  if (process.env.NODE_ENV === 'development') {
    // Auto-authenticate admin user
  }
  
  return res.status(401).json({ 
    message: 'Unauthenticated' 
  });
};
```

## Laravel-Style Error Handling

All controllers return standardized Laravel-like responses:

```javascript
// Success responses
res.json(data);
res.status(201).json(createdResource);

// Error responses  
res.status(422).json({
  message: 'Validation failed',
  errors: {
    field: ['Field is required']
  }
});

res.status(401).json({ message: 'Unauthenticated' });
res.status(404).json({ message: 'Resource not found' });
```

## API Endpoints Available

### Authentication
- `GET /api/auth/user` - Get authenticated user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Tasks
- `GET /api/tasks` - List all tasks (with filters)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{id}` - Get specific task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Users
- `GET /api/users` - List all users
- `GET /api/users/{id}` - Get specific user
- `PUT /api/users/{id}` - Update user profile

### Attendance
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/today/{userId}` - Get today's attendance
- `POST /api/attendance/clock-in` - Clock in
- `POST /api/attendance/clock-out` - Clock out

## Integration with Frontend

The React frontend continues to work with the same UI/UX but now consumes the Laravel-style API:

```javascript
// Frontend still uses the same query patterns
const { data: projects } = useQuery({
  queryKey: ['/api/projects']
});

const mutation = useMutation({
  mutationFn: async (projectData) => {
    return apiRequest('POST', '/api/projects', projectData);
  }
});
```

## Key Benefits

1. **Laravel-style Structure** - Familiar MVC pattern with Controllers and Middleware
2. **RESTful API Design** - Standard HTTP methods and resource-based URLs
3. **Proper Error Handling** - Standardized error responses and validation
4. **Session Management** - Laravel-like authentication middleware
5. **Preserved Frontend** - Same React UI with professional BECS branding
6. **Database Integration** - Maintains existing data and relationships

## Database Integration

The Laravel controllers integrate with the existing DatabaseStorage class which handles:
- User management (19 BECS staff members)
- Project management (5 AHP consortiums)
- Task management with deliverables
- Attendance tracking
- Invoice and template management

## Testing the API

```bash
# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"staffId":"BECS001","password":"admin123"}'

# Test projects API
curl http://localhost:5000/api/projects

# Test API documentation
curl http://localhost:5000/api-docs
```

This implementation provides a clean, Laravel-inspired backend architecture while maintaining all existing functionality and the professional BECS frontend interface.