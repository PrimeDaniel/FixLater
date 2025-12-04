# Real-Time Chat Feature

## Overview
This adds real-time messaging functionality to FixLater using Socket.io, allowing requesters and providers to communicate about tasks.

## What's New

### Backend
- **Socket.io Integration**: Real-time WebSocket communication
- **Chat Handler** (`backend/socket/chatHandler.js`): Manages socket connections, message routing, typing indicators
- **Messages Routes** (`backend/routes/messages.js`): REST API for conversations and message history
- **Database Tables**:
  - `conversations`: Links tasks with requester-provider conversations
  - `messages`: Stores chat messages with read status

### Frontend
- **Messages Page**: View all conversations
- **Chat Page**: Real-time messaging interface with typing indicators
- **Socket Service** (`frontend/src/utils/socket.js`): Manages WebSocket connections
- **Toast Notifications**: Real-time notification alerts using react-toastify
- **Updated Navbar**: Added "Messages" link

## Features
✅ Real-time message delivery
✅ Typing indicators
✅ Read receipts
✅ Unread message counts
✅ Toast notifications for new messages
✅ Message history with pagination support
✅ Conversation context (linked to tasks)
✅ Auto-scroll to latest messages
✅ Mobile responsive design

## Setup Instructions

### 1. Database Migration
Run the migration to create chat tables:
```bash
cd backend
npm run migrate
```

This creates:
- `conversations` table
- `messages` table
- Necessary indexes

### 2. Environment Variables
Add to `backend/.env`:
```env
CLIENT_URL=http://localhost:3000  # For CORS in Socket.io
```

### 3. Install Dependencies
Dependencies are already installed:
- Backend: `socket.io`
- Frontend: `socket.io-client`, `react-toastify`

### 4. Start Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## Usage

### Starting a Conversation
1. Navigate to a task detail page
2. If you're involved in the task (as requester or assigned provider), you'll see a "Message" button
3. Click to start or continue a conversation

### Sending Messages
1. Go to Messages page from navbar
2. Click on a conversation
3. Type your message and press Enter or click Send
4. See real-time delivery and typing indicators

### Notifications
- New messages trigger toast notifications
- Unread counts shown on conversation list
- Messages auto-marked as read when viewing conversation

## Technical Details

### Socket Events
- `send_message`: Send a new message
- `new_message`: Receive incoming messages
- `typing` / `stop_typing`: Typing indicators
- `mark_read`: Mark messages as read
- `new_notification`: Real-time notifications

### Authentication
Socket connections require JWT token:
```javascript
socketService.connect(token);
```

### Message Flow
1. User types message → Socket emits `send_message`
2. Server validates and saves to database
3. Server broadcasts to conversation room
4. Other user receives via `new_message` event
5. Messages auto-scroll and mark as read

## Future Enhancements
- [ ] File/image sharing in chat
- [ ] Voice messages
- [ ] Message search
- [ ] Message deletion/editing
- [ ] Group conversations
- [ ] Video calling
- [ ] Message reactions
- [ ] Push notifications
- [ ] Offline message queuing

## Notes
- Conversations are automatically created when users interact
- Messages persist in database (not ephemeral)
- Socket connections auto-reconnect on disconnect
- Old messages loaded via pagination (50 at a time)
