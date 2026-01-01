# Microservice & Headless Architecture Documentation

## Overview

Dự án đã được triển khai lại theo **Microservice Architecture** với **Headless API**. Frontend (React) và Backend (Express) hoàn toàn tách biệt, giao tiếp qua REST API.

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Components:                                                 │  │
│  │ - LoginModal, RegisterModal                                │  │
│  │ - TranslationArea                                           │  │
│  │ - UserMenu, GuideModal                                      │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Services (API Client):                                      │  │
│  │ - authService.ts (register, login, logout)                 │  │
│  │ - geminiService.ts (translate via API)                     │  │
│  │ - apiClient.ts (HTTP wrapper)                              │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
                    HTTP REST API (JSON)
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js + Express)                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ API Routes & Middleware:                                   │  │
│  │ - authMiddleware (JWT verification)                        │  │
│  │ - CORS handling                                             │  │
│  │ - Error handling                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Microservices:                                              │  │
│  │ ┌─────────────────────────────────────────────────────┐   │  │
│  │ │ Auth Service (auth.service.ts)                      │   │  │
│  │ │ - register() → Firebase Auth + Firestore            │   │  │
│  │ │ - login() → JWT token generation                    │   │  │
│  │ │ - verifyToken() → JWT validation                    │   │  │
│  │ └─────────────────────────────────────────────────────┘   │  │
│  │ ┌─────────────────────────────────────────────────────┐   │  │
│  │ │ Translation Service (translation.service.ts)        │   │  │
│  │ │ - translate(text, context, mode)                    │   │  │
│  │ │ - Calls Gemini 2.5 Flash API                        │   │  │
│  │ │ - Returns Vietnamese translation                    │   │  │
│  │ └─────────────────────────────────────────────────────┘   │  │
│  │ ┌─────────────────────────────────────────────────────┐   │  │
│  │ │ Database Service (database.service.ts)              │   │  │
│  │ │ - CRUD operations for novels, chapters, translations│   │  │
│  │ │ - Firestore integration                             │   │  │
│  │ └─────────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
                    Firestore Database
                    Gemini 2.5 Flash API
```

## API Endpoints

### Authentication

```
POST /api/auth/register
Request: { email, name, password }
Response: { user: {id, name, email}, token }

POST /api/auth/login
Request: { email, password }
Response: { user: {id, name, email}, token }

GET /api/auth/verify
Headers: Authorization: Bearer <token>
Response: { user: {...} }
```

### Translation

```
POST /api/translation/translate
Headers: Authorization: Bearer <token>
Request: { text, context, mode: 'translate' | 'analyze' }
Response: { translation }
```

### Novels

```
GET /api/novels
GET /api/novels/:novelId
POST /api/novels
PUT /api/novels/:novelId
DELETE /api/novels/:novelId
```

### Chapters

```
GET /api/chapters/:novelId
POST /api/chapters
PUT /api/chapters/:chapterId
DELETE /api/chapters/:chapterId
```

### Translations

```
GET /api/translations/:chapterId
POST /api/translations
PUT /api/translations/:translationId
DELETE /api/translations/:translationId
```

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Update .env với Firebase credentials và JWT_SECRET
npm run dev
```

### 2. Frontend Setup

```bash
npm install
cp .env.example .env.local
# Update .env.local với VITE_API_BASE_URL=http://localhost:3001
npm run dev
```

### 3. Environment Variables

**Backend (.env)**
```
GEMINI_API_KEY=your_key
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
...
JWT_SECRET=your_random_secret
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env.local)**
```
VITE_API_BASE_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=your_key (for reference only)
VITE_FIREBASE_PROJECT_ID=your_project
...
```

## Key Changes from Previous Architecture

### ✅ Before (Monolithic + localStorage)
- Frontend gọi Gemini API trực tiếp
- Lưu user vào localStorage
- Firebase dùng cùng instance trên frontend

### ✅ After (Microservice + API)
- Frontend chỉ gọi Backend API
- Backend xử lý Gemini, Firebase Auth, Firestore
- JWT token cho session management
- Tách biệt Frontend/Backend hoàn toàn
- Dễ mở rộng (thêm OAuth, DB khác, etc.)

## File Structure

```
classical-chinese-historical-novel/
├── backend/
│   ├── src/
│   │   ├── server.ts              # Main Express app
│   │   ├── middleware.ts          # Auth middleware
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── translation.service.ts
│   │   │   └── database.service.ts
│   │   └── types/
│   │       └── index.ts           # Shared types
│   ├── .env.example
│   └── package.json
├── src/
│   ├── components/
│   │   ├── LoginModal.tsx
│   │   ├── RegisterModal.tsx
│   │   └── TranslationArea.tsx
│   ├── services/
│   │   ├── authService.ts         # API call wrapper
│   │   ├── geminiService.ts       # Translation API
│   │   ├── apiClient.ts           # HTTP client
│   │   └── firebaseService.ts     # (deprecated)
│   └── ...
├── .env.example
└── vite.config.ts
```

## Security Improvements

1. **API Keys**: Gemini key chỉ nằm trên backend
2. **JWT Tokens**: Secure session management
3. **CORS**: Chỉ cho phép frontend URL
4. **Environment Variables**: Không expose sensitive data
5. **Firestore Rules**: User-scoped data access

## Performance Improvements

1. **Microservices**: Mỗi service độc lập, có thể scale riêng
2. **API Caching**: Response cache có thể thêm
3. **Load Balancing**: Hỗ trợ multiple backend instances
4. **Connection Pooling**: Shared Firebase connections

## Future Enhancements

- [ ] Redis cache layer
- [ ] Message queue (RabbitMQ) for async tasks
- [ ] Rate limiting
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Unit tests & E2E tests
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] OAuth2 integration
- [ ] GraphQL API option
- [ ] Real-time WebSocket support

---

**Architecture**: Microservice + Headless API  
**Frontend**: React + TypeScript  
**Backend**: Node.js + Express  
**Database**: Firebase Firestore  
**Auth**: Firebase Auth + JWT  
**Translation**: Gemini 2.5 Flash  
