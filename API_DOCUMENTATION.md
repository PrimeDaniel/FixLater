# FixLater API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 Table of Contents
1. [Authentication](#authentication-endpoints)
2. [Tasks](#tasks-endpoints)
3. [Applications](#applications-endpoints)
4. [Reviews](#reviews-endpoints)
5. [Users](#users-endpoints)
6. [Notifications](#notifications-endpoints)
7. [Upload](#upload-endpoints)

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Creates a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "user_type": "provider",
  "name": "John Doe"
}
```

**Parameters:**
- `email` (string, required) - Valid email address
- `password` (string, required) - Minimum 6 characters
- `user_type` (string, required) - Either `requester` or `provider`
- `name` (string, required) - Full name

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "user_type": "provider",
    "name": "John Doe"
  }
}
```

---

### Login
**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "user_type": "provider",
    "name": "John Doe",
    "profile_photo": "https://...",
    "bio": "Experienced cleaner"
  }
}
```

---

### Get Current User
**GET** `/auth/me`

Get authenticated user's profile.

**Headers Required:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "user_type": "provider",
    "name": "John Doe",
    "profile_photo": "https://...",
    "bio": "Experienced cleaner",
    "service_area_center": { "lat": 40.7128, "lng": -74.0060 },
    "service_area_radius": 10
  }
}
```

---

### Forgot Password
**POST** `/auth/forgot-password`

Request password reset (sends email - TODO in implementation).

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset functionality coming soon"
}
```

---

## Tasks Endpoints

### Get All Tasks
**GET** `/tasks`

Retrieve tasks with optional filtering.

**Query Parameters:**
- `category` (string, optional) - Filter by category (e.g., "cleaning", "handyman")
- `min_price` (number, optional) - Minimum suggested price
- `max_price` (number, optional) - Maximum suggested price
- `status` (string, optional) - Task status: `open`, `assigned`, `completed`, `cancelled`
- `lat` (number, optional) - Latitude for location-based search
- `lng` (number, optional) - Longitude for location-based search
- `radius` (number, optional) - Search radius in km

**Example:**
```
GET /tasks?category=cleaning&min_price=50&max_price=200&radius=5&lat=40.7128&lng=-74.0060
```

**Response (200 OK):**
```json
{
  "tasks": [
    {
      "id": 1,
      "requester_id": 2,
      "title": "House Cleaning",
      "description": "Need help cleaning my apartment",
      "category": "cleaning",
      "location": "123 Main St, New York",
      "location_coords": { "lat": 40.7128, "lng": -74.0060 },
      "suggested_price": 150.00,
      "status": "open",
      "assigned_provider_id": null,
      "scheduled_time": null,
      "created_at": "2025-12-04T10:00:00Z",
      "requester_name": "Jane Smith",
      "requester_photo": "https://...",
      "application_count": 3,
      "images": [
        {
          "id": 1,
          "image_url": "https://bucket.s3.amazonaws.com/..."
        }
      ]
    }
  ]
}
```

---

### Create Task
**POST** `/tasks`

Create a new task (requester only).

**Headers Required:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "House Cleaning",
  "description": "Need help cleaning my apartment before a party",
  "category": "cleaning",
  "location": "123 Main St, New York",
  "location_coords": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "suggested_price": 150.00,
  "availability_slots": [
    {
      "start_time": "2025-12-10T14:00:00Z",
      "end_time": "2025-12-10T16:00:00Z"
    },
    {
      "start_time": "2025-12-11T10:00:00Z",
      "end_time": "2025-12-11T12:00:00Z"
    }
  ],
  "image_urls": ["https://bucket.s3.amazonaws.com/image1.jpg"]
}
```

**Response (201 Created):**
```json
{
  "task": {
    "id": 1,
    "requester_id": 1,
    "title": "House Cleaning",
    "description": "Need help cleaning my apartment before a party",
    "category": "cleaning",
    "location": "123 Main St, New York",
    "location_coords": { "lat": 40.7128, "lng": -74.0060 },
    "suggested_price": 150.00,
    "status": "open",
    "created_at": "2025-12-04T10:00:00Z"
  },
  "availability_slots": [
    { "id": 1, "start_time": "2025-12-10T14:00:00Z", "end_time": "2025-12-10T16:00:00Z" },
    { "id": 2, "start_time": "2025-12-11T10:00:00Z", "end_time": "2025-12-11T12:00:00Z" }
  ]
}
```

---

### Get Task Details
**GET** `/tasks/:id`

Get detailed information about a specific task.

**Example:**
```
GET /tasks/1
```

**Response (200 OK):**
```json
{
  "task": {
    "id": 1,
    "requester_id": 2,
    "title": "House Cleaning",
    "description": "Need help cleaning my apartment",
    "category": "cleaning",
    "location": "123 Main St, New York",
    "location_coords": { "lat": 40.7128, "lng": -74.0060 },
    "suggested_price": 150.00,
    "status": "open",
    "assigned_provider_id": null,
    "created_at": "2025-12-04T10:00:00Z",
    "requester": {
      "id": 2,
      "name": "Jane Smith",
      "profile_photo": "https://...",
      "bio": "Property manager"
    },
    "images": [
      { "id": 1, "image_url": "https://bucket.s3.amazonaws.com/..." }
    ],
    "availability_slots": [
      {
        "id": 1,
        "start_time": "2025-12-10T14:00:00Z",
        "end_time": "2025-12-10T16:00:00Z"
      }
    ],
    "applications": [
      {
        "id": 1,
        "provider_id": 3,
        "provider_name": "Bob Johnson",
        "proposed_price": 120.00,
        "status": "pending"
      }
    ]
  }
}
```

---

### Update Task
**PATCH** `/tasks/:id`

Update task details (requester only, before assignment).

**Headers Required:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "House Cleaning - Updated",
  "description": "Updated description",
  "suggested_price": 175.00
}
```

**Response (200 OK):**
```json
{
  "task": { /* updated task object */ }
}
```

---

### Delete Task
**DELETE** `/tasks/:id`

Delete a task (requester only, before assignment).

**Headers Required:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Task deleted successfully"
}
```

---

## Applications Endpoints

### Get Applications
**GET** `/applications`

Get applications for user (different views for providers vs requesters).

**Headers Required:**
```
Authorization: Bearer <token>
```

**Response for Provider (200 OK):**
```json
{
  "applications": [
    {
      "id": 1,
      "task_id": 5,
      "task_title": "House Cleaning",
      "proposed_price": 120.00,
      "status": "pending",
      "created_at": "2025-12-04T11:30:00Z",
      "start_time": "2025-12-10T14:00:00Z",
      "end_time": "2025-12-10T16:00:00Z",
      "requester_name": "Jane Smith"
    }
  ]
}
```

**Response for Requester (200 OK):**
```json
{
  "applications": [
    {
      "id": 1,
      "task_id": 5,
      "provider_id": 3,
      "provider_name": "Bob Johnson",
      "provider_photo": "https://...",
      "proposed_price": 120.00,
      "status": "pending",
      "created_at": "2025-12-04T11:30:00Z",
      "start_time": "2025-12-10T14:00:00Z",
      "end_time": "2025-12-10T16:00:00Z"
    }
  ]
}
```

---

### Apply to Task
**POST** `/applications`

Provider applies to a task.

**Headers Required:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "task_id": 5,
  "proposed_price": 120.00,
  "selected_slot_id": 1
}
```

**Response (201 Created):**
```json
{
  "application": {
    "id": 1,
    "task_id": 5,
    "provider_id": 3,
    "proposed_price": 120.00,
    "selected_slot_id": 1,
    "status": "pending",
    "created_at": "2025-12-04T11:30:00Z"
  }
}
```

**Error Cases:**
- `400` - Task not open, already applied, own task, invalid slot
- `404` - Task not found
- `403` - Not a provider

---

### Accept/Reject Application
**PATCH** `/applications/:id`

Requester accepts or rejects an application.

**Headers Required:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "accepted"
}
```

**Parameters:**
- `status` (string, required) - Either `accepted` or `rejected`

**Response (200 OK):**
```json
{
  "application": {
    "id": 1,
    "task_id": 5,
    "provider_id": 3,
    "proposed_price": 120.00,
    "status": "accepted",
    "created_at": "2025-12-04T11:30:00Z"
  },
  "message": "Application accepted. Task assigned to provider."
}
```

---

## Reviews Endpoints

### Create Review
**POST** `/reviews`

Leave a review for a completed task.

**Headers Required:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "task_id": 5,
  "provider_id": 3,
  "rating": 5,
  "review_text": "Bob did an excellent job! Very professional and thorough."
}
```

**Parameters:**
- `task_id` (number, required) - ID of the completed task
- `provider_id` (number, required) - ID of the provider
- `rating` (number, required) - Rating from 1 to 5
- `review_text` (string, optional) - Review text

**Response (201 Created):**
```json
{
  "review": {
    "id": 1,
    "task_id": 5,
    "provider_id": 3,
    "requester_id": 2,
    "rating": 5,
    "review_text": "Bob did an excellent job!",
    "created_at": "2025-12-04T16:00:00Z"
  }
}
```

---

### Get Reviews for Provider
**GET** `/reviews/provider/:provider_id`

Get all reviews for a provider.

**Example:**
```
GET /reviews/provider/3
```

**Response (200 OK):**
```json
{
  "reviews": [
    {
      "id": 1,
      "task_id": 5,
      "provider_id": 3,
      "requester_id": 2,
      "requester_name": "Jane Smith",
      "rating": 5,
      "review_text": "Excellent work!",
      "created_at": "2025-12-04T16:00:00Z"
    }
  ],
  "average_rating": 4.8,
  "total_reviews": 25
}
```

---

## Users Endpoints

### Get User Profile
**GET** `/users/:id`

Get public profile information for a user.

**Example:**
```
GET /users/3
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 3,
    "email": "bob@example.com",
    "name": "Bob Johnson",
    "user_type": "provider",
    "profile_photo": "https://...",
    "bio": "Professional cleaner with 5+ years experience",
    "service_area_center": { "lat": 40.7128, "lng": -74.0060 },
    "service_area_radius": 15,
    "created_at": "2025-11-01T08:00:00Z",
    "rating": 4.8,
    "total_reviews": 25,
    "completed_tasks": 50
  }
}
```

---

### Update User Profile
**PATCH** `/users/profile`

Update authenticated user's profile.

**Headers Required:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Bob Johnson",
  "bio": "Professional cleaner with 5+ years experience",
  "service_area_center": { "lat": 40.7128, "lng": -74.0060 },
  "service_area_radius": 15,
  "profile_photo": "https://bucket.s3.amazonaws.com/photo.jpg"
}
```

**Response (200 OK):**
```json
{
  "user": { /* updated user object */ }
}
```

---

### Change Password
**POST** `/users/change-password`

Change user password.

**Headers Required:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "old_password": "currentPassword123",
  "new_password": "newPassword123",
  "confirm_password": "newPassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

---

## Notifications Endpoints

### Get Notifications
**GET** `/notifications`

Get user's notifications.

**Headers Required:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `read` (boolean, optional) - Filter by read status

**Response (200 OK):**
```json
{
  "notifications": [
    {
      "id": 1,
      "user_id": 1,
      "type": "application_received",
      "message": "New application received for task: House Cleaning",
      "read": false,
      "related_task_id": 5,
      "created_at": "2025-12-04T11:30:00Z"
    },
    {
      "id": 2,
      "user_id": 1,
      "type": "application_accepted",
      "message": "Your application was accepted!",
      "read": true,
      "related_task_id": 5,
      "created_at": "2025-12-04T12:00:00Z"
    }
  ]
}
```

---

### Mark Notification as Read
**PATCH** `/notifications/:id`

Mark a notification as read.

**Headers Required:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "read": true
}
```

**Response (200 OK):**
```json
{
  "notification": { /* updated notification */ }
}
```

---

### Mark All Notifications as Read
**PATCH** `/notifications/read-all`

Mark all notifications as read.

**Headers Required:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "All notifications marked as read"
}
```

---

## Upload Endpoints

### Upload Single Image
**POST** `/upload/image`

Upload a single image file.

**Headers Required:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `image` (file, required) - Image file (jpg, png, etc.)

**Response (200 OK):**
```json
{
  "image_url": "https://bucket.s3.amazonaws.com/uploads/1701697200000-abc123.jpg"
}
```

---

### Upload Multiple Images
**POST** `/upload/images`

Upload multiple images (up to 10).

**Headers Required:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `images` (files, required) - Multiple image files (up to 10)

**Response (200 OK):**
```json
{
  "image_urls": [
    "https://bucket.s3.amazonaws.com/uploads/1701697200000-abc123.jpg",
    "https://bucket.s3.amazonaws.com/uploads/1701697200001-def456.jpg"
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid input",
  "errors": [
    {
      "msg": "Invalid value",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "No token, authorization denied"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Server Error
```json
{
  "error": "Server error"
}
```

---

## Rate Limiting
Currently not implemented. Recommended for production:
- 100 requests per 15 minutes per IP for general endpoints
- 5 requests per 15 minutes for auth endpoints

---

## Versioning
Current API version: **1.0.0**

Future versions will use URL prefix: `/api/v2/...`
