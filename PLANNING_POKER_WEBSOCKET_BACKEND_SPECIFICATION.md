# Planning Poker WebSocket Backend Specification

## Overview

This document specifies the WebSocket implementation requirements for the Planning Poker module. The WebSocket server provides real-time bidirectional communication between the frontend and backend, eliminating the need for polling and providing instant updates when tasks are created, votes are submitted, or members join/leave.

## WebSocket Endpoint

### Connection URL

**Development:**
```
ws://localhost:3000/planning-poker
```

**Production:**
```
wss://innspill.ai/microapi/planning-poker
```

### Connection Parameters

The WebSocket connection requires the following query parameters:

- `groupId` (required): The ID of the student group
- `userName` (required): The username of the connecting user

**Example:**
```
ws://localhost:3000/planning-poker?groupId=692b66cc11391bb12135146d&userName=student1@example.com
```

### Authentication

The WebSocket connection should:
1. Verify the user is authenticated (check session/cookie)
2. Verify the user is a member of the specified group
3. Reject connections with invalid credentials (close with code 1008)

## Message Format

All messages are JSON strings with the following structure:

```typescript
interface WebSocketMessage {
  type: string;        // Message type (see Message Types below)
  data?: any;          // Message payload (varies by type)
  groupId: string;     // Group ID
  timestamp: string;   // ISO 8601 timestamp
}
```

## Client-to-Server Messages

### 1. Join Room

Sent when a client connects and wants to join a group room.

```json
{
  "type": "join",
  "groupId": "692b66cc11391bb12135146d",
  "userName": "student1@example.com"
}
```

**Server Response:**
- Broadcast `member_joined` to all other members in the room
- Send `online_members_update` to all members in the room

### 2. Leave Room

Sent when a client wants to leave the room (before disconnecting).

```json
{
  "type": "leave",
  "groupId": "692b66cc11391bb12135146d",
  "userName": "student1@example.com"
}
```

**Server Response:**
- Broadcast `member_left` to all other members in the room
- Send `online_members_update` to all remaining members

### 3. Submit Vote

Sent when a user submits a vote for a task.

```json
{
  "type": "vote",
  "taskId": "692f04bc83e3e66ef577e9b2",
  "groupId": "692b66cc11391bb12135146d",
  "vote": 5
}
```

**Vote Values:**
- Valid Fibonacci numbers: `1, 2, 3, 5, 8, 13, 21, 34, 55, 89`
- Or `"?"` for uncertain

**Server Response:**
1. Validate the vote (Fibonacci number or '?')
2. Save/update the vote in the database
3. Check if all members have voted
4. If all voted, calculate average and update task status to 'completed'
5. Broadcast `vote_submitted` to all members in the room
6. Broadcast `task_updated` with the updated task data

### 4. Request Online Members

Sent when a client wants to get the current list of online members.

```json
{
  "type": "get_online_members",
  "groupId": "692b66cc11391bb12135146d"
}
```

**Server Response:**
- Send `online_members_update` to the requesting client

## Server-to-Client Messages

### 1. Task Created

Broadcast when a new task is created.

```json
{
  "type": "task_created",
  "data": {
    "id": "692f04bc83e3e66ef577e9b2",
    "groupId": "692b66cc11391bb12135146d",
    "title": "Implement user authentication",
    "description": "Add login and registration functionality",
    "createdBy": "student1@example.com",
    "createdAt": "2024-01-15T10:30:00Z",
    "status": "voting",
    "votes": []
  },
  "groupId": "692b66cc11391bb12135146d",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 2. Task Updated

Broadcast when a task is updated (e.g., vote submitted, status changed).

```json
{
  "type": "task_updated",
  "data": {
    "id": "692f04bc83e3e66ef577e9b2",
    "groupId": "692b66cc11391bb12135146d",
    "title": "Implement user authentication",
    "status": "completed",
    "votes": [
      {
        "id": "vote1",
        "taskId": "692f04bc83e3e66ef577e9b2",
        "userId": "student1@example.com",
        "userName": "Student One",
        "vote": 5,
        "votedAt": "2024-01-15T10:35:00Z"
      },
      {
        "id": "vote2",
        "taskId": "692f04bc83e3e66ef577e9b2",
        "userId": "student2@example.com",
        "userName": "Student Two",
        "vote": 8,
        "votedAt": "2024-01-15T10:36:00Z"
      }
    ],
    "averageVote": 6.5
  },
  "groupId": "692b66cc11391bb12135146d",
  "timestamp": "2024-01-15T10:36:00Z"
}
```

### 3. Task Deleted

Broadcast when a task is deleted.

```json
{
  "type": "task_deleted",
  "data": {
    "taskId": "692f04bc83e3e66ef577e9b2"
  },
  "groupId": "692b66cc11391bb12135146d",
  "timestamp": "2024-01-15T10:40:00Z"
}
```

### 4. Vote Submitted

Broadcast when a vote is submitted (before task is updated).

```json
{
  "type": "vote_submitted",
  "data": {
    "taskId": "692f04bc83e3e66ef577e9b2",
    "userId": "student1@example.com",
    "userName": "Student One",
    "vote": 5
  },
  "groupId": "692b66cc11391bb12135146d",
  "timestamp": "2024-01-15T10:35:00Z"
}
```

### 5. Member Joined

Broadcast when a member joins the room.

```json
{
  "type": "member_joined",
  "data": {
    "userId": "student1@example.com",
    "userName": "Student One"
  },
  "groupId": "692b66cc11391bb12135146d",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 6. Member Left

Broadcast when a member leaves the room.

```json
{
  "type": "member_left",
  "data": {
    "userId": "student1@example.com",
    "userName": "Student One"
  },
  "groupId": "692b66cc11391bb12135146d",
  "timestamp": "2024-01-15T10:45:00Z"
}
```

### 7. Online Members Update

Sent to update the list of online members.

```json
{
  "type": "online_members_update",
  "data": {
    "members": [
      {
        "userId": "student1@example.com",
        "userName": "Student One",
        "isOnline": true,
        "lastSeen": "2024-01-15T10:45:00Z"
      },
      {
        "userId": "student2@example.com",
        "userName": "Student Two",
        "isOnline": true,
        "lastSeen": "2024-01-15T10:44:00Z"
      }
    ]
  },
  "groupId": "692b66cc11391bb12135146d",
  "timestamp": "2024-01-15T10:45:00Z"
}
```

### 8. Game Started

Broadcast when a game is started.

```json
{
  "type": "game_started",
  "data": {
    "groupId": "692b66cc11391bb12135146d",
    "startedBy": "student1@example.com",
    "members": ["student1@example.com", "student2@example.com"],
    "startedAt": "2024-01-15T10:30:00Z"
  },
  "groupId": "692b66cc11391bb12135146d",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 9. Game Ended

Broadcast when a game is ended.

```json
{
  "type": "game_ended",
  "data": {
    "groupId": "692b66cc11391bb12135146d",
    "endedBy": "student1@example.com",
    "endedAt": "2024-01-15T11:00:00Z"
  },
  "groupId": "692b66cc11391bb12135146d",
  "timestamp": "2024-01-15T11:00:00Z"
}
```

## Room Management

### Room Structure

Each group has its own WebSocket room. Rooms are identified by `groupId`.

**Room Data Structure:**
```javascript
{
  groupId: "692b66cc11391bb12135146d",
  connections: Set<WebSocket>,  // Active WebSocket connections
  members: Map<string, {       // userId -> member info
    userId: string,
    userName: string,
    joinedAt: Date,
    lastSeen: Date
  }>
}
```

### Room Lifecycle

1. **Room Creation**: Created when the first member joins
2. **Room Updates**: Updated when members join/leave
3. **Room Cleanup**: Removed when the last member leaves

### Member Tracking

- Track online members per room
- Update `lastSeen` timestamp on each message from a member
- Consider a member offline if no message received for 5 minutes
- Broadcast `member_left` when a member goes offline

## Implementation Requirements

### 1. WebSocket Server Setup

**Using Node.js with `ws` library:**

```javascript
const WebSocket = require('ws');
const http = require('http');

// Create HTTP server (or use existing Express server)
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocket.Server({ 
  server,
  path: '/planning-poker',
  verifyClient: (info) => {
    // Verify authentication and group membership
    const url = new URL(info.req.url, `http://${info.req.headers.host}`);
    const groupId = url.searchParams.get('groupId');
    const userName = url.searchParams.get('userName');
    
    // TODO: Verify user is authenticated and is a member of the group
    return !!groupId && !!userName;
  }
});
```

### 2. Connection Handling

```javascript
const rooms = new Map(); // groupId -> RoomData

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const groupId = url.searchParams.get('groupId');
  const userName = url.searchParams.get('userName');

  // Validate group membership
  if (!isGroupMember(groupId, userName)) {
    ws.close(1008, 'Not a group member');
    return;
  }

  // Join room
  joinRoom(groupId, userName, ws);

  // Handle incoming messages
  ws.on('message', (message) => {
    handleMessage(ws, groupId, userName, message);
  });

  // Handle disconnection
  ws.on('close', () => {
    leaveRoom(groupId, userName);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});
```

### 3. Message Handling

```javascript
function handleMessage(ws, groupId, userName, rawMessage) {
  try {
    const message = JSON.parse(rawMessage);
    
    switch (message.type) {
      case 'join':
        handleJoin(ws, groupId, userName);
        break;
      case 'leave':
        handleLeave(groupId, userName);
        break;
      case 'vote':
        handleVote(groupId, userName, message.taskId, message.vote);
        break;
      case 'get_online_members':
        sendOnlineMembers(ws, groupId);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  } catch (error) {
    console.error('Error parsing message:', error);
    ws.send(JSON.stringify({
      type: 'error',
      data: { message: 'Invalid message format' },
      groupId,
      timestamp: new Date().toISOString()
    }));
  }
}
```

### 4. Broadcasting

```javascript
function broadcastToRoom(groupId, message, excludeWs = null) {
  const room = rooms.get(groupId);
  if (!room) return;

  const messageStr = JSON.stringify(message);
  
  room.connections.forEach((ws) => {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(messageStr);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  });
}
```

### 5. Vote Processing

```javascript
async function handleVote(groupId, userName, taskId, vote) {
  // Validate vote
  const validVotes = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?'];
  if (!validVotes.includes(vote)) {
    return;
  }

  // Save vote to database
  const task = await PlanningPokerTask.findById(taskId);
  if (!task || task.groupId !== groupId) {
    return;
  }

  // Update or add vote
  const existingVoteIndex = task.votes.findIndex(v => v.userId === userName);
  if (existingVoteIndex >= 0) {
    task.votes[existingVoteIndex].vote = vote;
    task.votes[existingVoteIndex].votedAt = new Date();
  } else {
    task.votes.push({
      userId: userName,
      userName: await getUserDisplayName(userName),
      vote: vote,
      votedAt: new Date()
    });
  }

  // Check if all members have voted
  const group = await StudentGroup.findById(groupId);
  const allVoted = group.studentIds.every(id => 
    task.votes.some(v => v.userId === id)
  );

  if (allVoted) {
    // Calculate average (excluding '?' votes)
    const numericVotes = task.votes
      .map(v => typeof v.vote === 'number' ? v.vote : null)
      .filter(v => v !== null);
    
    if (numericVotes.length > 0) {
      task.averageVote = numericVotes.reduce((sum, v) => sum + v, 0) / numericVotes.length;
    }
    
    task.status = 'completed';
  }

  await task.save();

  // Broadcast vote submitted
  broadcastToRoom(groupId, {
    type: 'vote_submitted',
    data: {
      taskId,
      userId: userName,
      userName: await getUserDisplayName(userName),
      vote
    },
    groupId,
    timestamp: new Date().toISOString()
  });

  // Broadcast task updated
  broadcastToRoom(groupId, {
    type: 'task_updated',
    data: task.toObject(),
    groupId,
    timestamp: new Date().toISOString()
  });
}
```

### 6. Online Member Tracking

```javascript
function updateMemberLastSeen(groupId, userName) {
  const room = rooms.get(groupId);
  if (room && room.members.has(userName)) {
    room.members.get(userName).lastSeen = new Date();
  }
}

// Periodic cleanup of offline members (every 1 minute)
setInterval(() => {
  const now = new Date();
  rooms.forEach((room, groupId) => {
    room.members.forEach((member, userId) => {
      const timeSinceLastSeen = now - member.lastSeen;
      if (timeSinceLastSeen > 5 * 60 * 1000) { // 5 minutes
        // Mark as offline and broadcast
        room.members.delete(userId);
        broadcastToRoom(groupId, {
          type: 'member_left',
          data: { userId, userName: member.userName },
          groupId,
          timestamp: new Date().toISOString()
        });
      }
    });
  });
}, 60000);
```

## Error Handling

### Connection Errors

- **Invalid credentials**: Close with code 1008
- **Not a group member**: Close with code 1008
- **Missing parameters**: Close with code 1008

### Message Errors

- **Invalid JSON**: Send error message back to client
- **Unknown message type**: Log warning, ignore message
- **Invalid vote value**: Ignore vote, don't broadcast

## Security Considerations

1. **Authentication**: Verify user session/cookie on connection
2. **Authorization**: Verify user is a member of the group
3. **Input Validation**: Validate all incoming messages
4. **Rate Limiting**: Limit message frequency per connection
5. **CORS**: Configure CORS for WebSocket connections
6. **HTTPS/WSS**: Use WSS in production

## Testing

### Test Cases

1. **Connection**
   - Valid connection with correct credentials
   - Invalid connection (wrong groupId)
   - Invalid connection (not a member)

2. **Messages**
   - Join room
   - Leave room
   - Submit vote
   - Request online members

3. **Broadcasting**
   - Member join broadcast
   - Member leave broadcast
   - Vote submission broadcast
   - Task update broadcast

4. **Edge Cases**
   - Multiple connections from same user
   - Rapid vote submissions
   - Connection drops during vote
   - Room cleanup when empty

## Integration with Existing REST API

The WebSocket server should:
- Use the same database models as the REST API
- Maintain consistency between WebSocket and REST operations
- Allow REST API to trigger WebSocket broadcasts (e.g., when task is created via REST)

## Performance Considerations

1. **Connection Limits**: Set maximum connections per room
2. **Message Queuing**: Queue messages if connection is slow
3. **Heartbeat**: Implement ping/pong to detect dead connections
4. **Scaling**: Consider using Redis for room management in multi-server setup

## Deployment

### Development
- Run WebSocket server on port 3000
- Use `ws://` protocol

### Production
- Run WebSocket server behind reverse proxy (nginx)
- Use `wss://` protocol (SSL/TLS)
- Configure nginx to upgrade HTTP connections to WebSocket

**Nginx Configuration Example:**
```nginx
location /planning-poker {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Summary

The WebSocket implementation provides:
- ✅ Real-time bidirectional communication
- ✅ Instant updates when votes are submitted
- ✅ Live member status tracking
- ✅ Reduced server load (no polling)
- ✅ Better user experience

The frontend will automatically fall back to REST API polling if WebSocket is not available, ensuring backward compatibility.
