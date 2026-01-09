# 🌳 Family Tree - Gia Phả Dòng Họ

> A modern, professional family tree management system with SSO authentication, role-based access control, and comprehensive data management.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)

## ✨ Features

### Core
- 📊 **3 View Modes**: List, Tree, and Binary Tree visualizations
- 🔍 **Advanced Search**: Filter by name, info, year range, and generation
- 🌙 **Dark Mode**: Auto-detect system preference or manual toggle

### Authentication & Authorization
- 🔐 **Authentik SSO**: Enterprise-grade Single Sign-On integration
- 👥 **RBAC**: Role-Based Access Control with granular permissions
- 🚀 **First-Run Wizard**: Web-based configuration, no `.env` needed for SSO

### Data Management
- 💾 **SQLite Database**: Lightweight, file-based persistence
- 📇 **Flexible Schema**: Contacts (phone, email, address), custom attributes
- 📜 **Audit Logging**: Track all data changes with user info

### Performance & Developer Experience
- ⚡ **In-Memory Cache**: Redis-like caching with auto-invalidation
- 🔄 **SWR**: Stale-while-revalidate for instant UI updates
- 🖼️ **Image Optimization**: Automatic WebP/AVIF conversion
- 🐳 **Docker Ready**: Production-optimized containerization

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Initialize database
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev
```

Open [http://localhost:4000](http://localhost:4000)

### Docker Deployment

```bash
# Build and run
docker-compose up -d

# First time: Run migrations
docker exec -it familytree-app-1 npx prisma migrate deploy
```

Open [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### First-Run Setup (Recommended)
1. Start the application
2. Navigate to any page → Redirected to `/setup`
3. Enter Authentik credentials:
   - **Issuer URL**: `https://your-authentik.com/application/o/your-app/`
   - **Client ID**: From Authentik admin
   - **Client Secret**: From Authentik admin
   - **Auth Secret**: Generate with `openssl rand -base64 32`
4. Click "Save" → Restart server → SSO ready!

### Environment Variables (Optional)
Create `.env` file for local development:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-random-secret"
AUTH_AUTHENTIK_ID="your-client-id"
AUTH_AUTHENTIK_SECRET="your-client-secret"
AUTH_AUTHENTIK_ISSUER="https://auth.example.com/application/o/app/"
```

## 📁 Project Structure

```
├── prisma/              # Database schema & migrations
├── src/
│   ├── app/
│   │   ├── admin/       # Admin panel (Users, Roles)
│   │   ├── api/         # API routes
│   │   ├── components/  # React components
│   │   └── setup/       # First-run wizard
│   ├── lib/             # Utilities (prisma, redis, audit, etc.)
│   └── hooks/           # Custom React hooks
├── Dockerfile           # Production container
└── docker-compose.yml   # Docker orchestration
```

## 🔒 Security

- **RBAC**: Granular permissions (view, edit, delete, manage)
- **Rate Limiting**: Built-in API protection
- **Audit Trail**: All changes logged with timestamp & user
- **HTTPS Ready**: Configure reverse proxy (nginx/Caddy)

## 📊 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check for load balancers |
| `GET /api/family-data` | Family tree data (cached) |
| `GET /api/setup` | Check configuration status |
| `POST /api/setup` | Save configuration |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

This project is private. All rights reserved.
