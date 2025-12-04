# Testing Guide - FixLater

## Overview
This guide provides comprehensive testing instructions for the FixLater API using various tools.

## Tools Setup

### Option 1: Using cURL (Command Line)
Available on Windows PowerShell, macOS, and Linux.

### Option 2: Using Postman
1. Download from https://www.postman.com/downloads/
2. Import the provided Postman collection (see below)

### Option 3: Using Thunder Client (VS Code)
1. Install extension: "Thunder Client"
2. Use the requests below in the app

---

## Test Workflow

### 1. Health Check
Verify the API is running before testing endpoints.

**cURL:**
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "FixLater API is running"
}
```

---

### 2. Authentication Flow

#### 2a. Register User (Provider)
**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "provider@test.com",
    "password": "Password123",
    "user_type": "provider",
    "name": "John Provider"
  }'
```

**Save the token** from the response. Example:
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

#### 2b. Register User (Requester)
**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "requester@test.com",
    "password": "Password123",
    "user_type": "requester",
    "name": "Jane Requester"
  }'
```

**Save this token too.**

---

#### 2c. Login
**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "provider@test.com",
    "password": "Password123"
  }'
```

---

#### 2d. Get Current User
**cURL:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Replace `YOUR_TOKEN_HERE` with the actual token from registration.

---

### 3. Task Workflow

#### 3a. Create a Task (as Requester)
**cURL:**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer REQUESTER_TOKEN" \
  -d '{
    "title": "House Cleaning",
    "description": "Need my apartment cleaned before the weekend",
    "category": "cleaning",
    "location": "123 Main St, New York, NY",
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
    ]
  }'
```

**Save the task ID** from the response.

---

#### 3b. Get All Tasks
**cURL:**
```bash
curl -X GET "http://localhost:5000/api/tasks" \
  -H "Authorization: Bearer REQUESTER_TOKEN"
```

**With Filtering:**
```bash
curl -X GET "http://localhost:5000/api/tasks?category=cleaning&min_price=100&max_price=200" \
  -H "Authorization: Bearer REQUESTER_TOKEN"
```

---

#### 3c. Get Task Details
**cURL:**
```bash
curl -X GET http://localhost:5000/api/tasks/1 \
  -H "Authorization: Bearer REQUESTER_TOKEN"
```

Replace `1` with actual task ID.

---

#### 3d. Update Task
**cURL:**
```bash
curl -X PATCH http://localhost:5000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer REQUESTER_TOKEN" \
  -d '{
    "title": "House Cleaning - UPDATED",
    "suggested_price": 175.00
  }'
```

---

#### 3e. Delete Task
**cURL:**
```bash
curl -X DELETE http://localhost:5000/api/tasks/1 \
  -H "Authorization: Bearer REQUESTER_TOKEN"
```

---

### 4. Application Workflow

#### 4a. Apply to Task (as Provider)
**cURL:**
```bash
curl -X POST http://localhost:5000/api/applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PROVIDER_TOKEN" \
  -d '{
    "task_id": 1,
    "proposed_price": 120.00,
    "selected_slot_id": 1
  }'
```

**Save the application ID** from the response.

---

#### 4b. Get Applications
As Provider:
```bash
curl -X GET http://localhost:5000/api/applications \
  -H "Authorization: Bearer PROVIDER_TOKEN"
```

As Requester:
```bash
curl -X GET http://localhost:5000/api/applications \
  -H "Authorization: Bearer REQUESTER_TOKEN"
```

---

#### 4c. Accept Application
**cURL:**
```bash
curl -X PATCH http://localhost:5000/api/applications/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer REQUESTER_TOKEN" \
  -d '{
    "status": "accepted"
  }'
```

Replace `1` with application ID.

---

#### 4d. Reject Application
**cURL:**
```bash
curl -X PATCH http://localhost:5000/api/applications/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer REQUESTER_TOKEN" \
  -d '{
    "status": "rejected"
  }'
```

---

### 5. File Upload

#### 5a. Upload Single Image
You need an actual image file. Example with a test image:

**cURL:**
```bash
curl -X POST http://localhost:5000/api/upload/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

Windows PowerShell:
```powershell
$token = "YOUR_TOKEN"
curl.exe -X POST http://localhost:5000/api/upload/image `
  -H "Authorization: Bearer $token" `
  -F "image=@C:\path\to\image.jpg"
```

---

#### 5b. Upload Multiple Images
**cURL:**
```bash
curl -X POST http://localhost:5000/api/upload/images \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg" \
  -F "images=@image3.jpg"
```

---

### 6. User Profile

#### 6a. Get User Profile
**cURL:**
```bash
curl -X GET http://localhost:5000/api/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### 6b. Update User Profile
**cURL:**
```bash
curl -X PATCH http://localhost:5000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "John Provider Updated",
    "bio": "Professional service provider with 10+ years experience",
    "service_area_center": {
      "lat": 40.7128,
      "lng": -74.0060
    },
    "service_area_radius": 15
  }'
```

---

#### 6c. Change Password
**cURL:**
```bash
curl -X POST http://localhost:5000/api/users/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "old_password": "OldPassword123",
    "new_password": "NewPassword123",
    "confirm_password": "NewPassword123"
  }'
```

---

### 7. Reviews

#### 7a. Create Review
**cURL:**
```bash
curl -X POST http://localhost:5000/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer REQUESTER_TOKEN" \
  -d '{
    "task_id": 1,
    "provider_id": 1,
    "rating": 5,
    "review_text": "Excellent work! Very professional and thorough."
  }'
```

---

#### 7b. Get Reviews for Provider
**cURL:**
```bash
curl -X GET http://localhost:5000/api/reviews/provider/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 8. Notifications

#### 8a. Get Notifications
**cURL:**
```bash
curl -X GET http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### 8b. Mark Notification as Read
**cURL:**
```bash
curl -X PATCH http://localhost:5000/api/notifications/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "read": true
  }'
```

---

## PowerShell Helper Script

Create a file `test-api.ps1` to make testing easier:

```powershell
# Test FixLater API
param(
    [string]$token = "",
    [string]$endpoint = "health"
)

$baseUrl = "http://localhost:5000/api"

$headers = @{
    "Content-Type" = "application/json"
}

if ($token) {
    $headers["Authorization"] = "Bearer $token"
}

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/$endpoint" -Headers $headers -Method Get
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json | Write-Host
} catch {
    Write-Host "Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
```

Usage:
```powershell
./test-api.ps1
./test-api.ps1 -token "YOUR_TOKEN" -endpoint "auth/me"
```

---

## Common Test Scenarios

### Scenario 1: Complete Task Workflow
1. Register as requester
2. Register as provider
3. Create task (as requester)
4. Apply to task (as provider)
5. Accept application (as requester)
6. Leave review (as requester)

### Scenario 2: Provider Search
1. Create multiple tasks with different categories
2. Search by category, price range, location
3. Filter results

### Scenario 3: Error Cases
1. Try to apply to own task (should fail)
2. Try to apply twice (should fail)
3. Try to register with existing email (should fail)
4. Try to access protected endpoint without token (should fail)

---

## Debugging Tips

### View Request Details
With cURL, add `-v` flag:
```bash
curl -v http://localhost:5000/api/health
```

### View Full JSON Response
With PowerShell:
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/health"
$response | ConvertTo-Json | Write-Host
```

### Check Server Logs
In the terminal running the backend:
- Look for error messages
- Check request logging
- Verify database connections

### Common Issues
- **401 Unauthorized**: Token missing or expired
- **403 Forbidden**: Wrong user type for endpoint
- **400 Bad Request**: Invalid data in request body
- **500 Server Error**: Check server logs for details

---

## Next Steps
1. Test all endpoints manually
2. Create comprehensive test suite
3. Set up automated testing with Jest/Mocha
4. Add integration tests for multi-step workflows
