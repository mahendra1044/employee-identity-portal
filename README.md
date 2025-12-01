# 🔐 Employee Identity Portal

> **A unified enterprise identity management dashboard for viewing and managing employee identities across multiple IAM/PAM systems.**

The Employee Identity Portal provides a single-pane-of-glass view into employee identity data across various identity and access management platforms. It enables employees to view their own identity information, while operations teams can search, troubleshoot, and manage identities across all integrated systems.

---

## 📚 Table of Contents

- [Tech Stack Used](#-tech-stack-used)
- [Architecture Overview](#-architecture-overview)
- [Key Features](#-key-features)
- [Configuration (Detailed)](#-configuration-detailed)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [External Service Configuration](#external-service-configuration)
- [Deployment Guide](#-deployment-guide)
- [How to Run the Application (Locally)](#-how-to-run-the-application-locally)
- [User Modes & Roles](#-user-modes--roles)
- [API Reference](#-api-reference)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🛠 Tech Stack Used

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.3.5 | React framework with App Router & Turbopack |
| **React** | 19.0.0 | UI component library |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **Radix UI** | Various | Headless accessible UI primitives |
| **Framer Motion** | 12.x | Animation library |
| **Lucide React** | 0.544.0 | Icon library |
| **Sonner** | 2.0.6 | Toast notifications |
| **Recharts** | 3.0.2 | Data visualization |
| **Zod** | 4.1.8 | Schema validation |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Express** | 4.19.2 | Web application framework |
| **JWT** | 9.0.2 | JSON Web Token authentication |
| **Winston** | 3.13.1 | Logging framework |
| **Helmet** | 7.1.0 | Security middleware |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **express-rate-limit** | 7.3.1 | API rate limiting |

### Development Tools
| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **Turbopack** | Fast bundler for development |
| **Concurrently** | Run multiple processes |
| **Rimraf** | Cross-platform rm -rf |

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT BROWSER                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Next.js Frontend (React 19)                   │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │   │
│  │  │ App Context  │  │   Hooks      │  │    UI Components      │  │   │
│  │  │  (State)     │  │ (useAppAuth) │  │ (SystemCards, Header) │  │   │
│  │  └──────────────┘  └──────────────┘  └───────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │          API Calls            │
                    │   (REST + JWT Bearer Token)   │
                    └───────────────┬───────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Next.js API  │         │  Express Backend │         │  External APIs  │
│   Routes      │         │   (Port 3001)    │         │  (Production)   │
│  /api/...     │         │                  │         │                 │
└───────────────┘         │  ┌────────────┐  │         │ • Ping Identity │
                          │  │ Middleware │  │         │ • CyberArk      │
                          │  │ • Auth     │  │         │ • Saviynt       │
                          │  │ • Logger   │  │         │ • Microsoft     │
                          │  │ • Rate     │  │         │   Entra ID      │
                          │  └────────────┘  │         │ • ServiceNow    │
                          │                  │         └─────────────────┘
                          │  ┌────────────┐  │
                          │  │  Services  │  │
                          │  │ • RBAC     │  │
                          │  │ • MockData │  │
                          │  └────────────┘  │
                          └─────────────────┘
```

### Component Interaction Flow

1. **Authentication**: User logs in via mock auth (dev) or enterprise SSO (prod)
2. **Role Detection**: RBAC service determines role from email pattern
3. **Feature Loading**: Features config determines which systems are enabled
4. **Data Fetching**: System cards fetch identity data based on role permissions
5. **State Management**: React Context manages global app state with localStorage persistence

---

## ✨ Key Features

### Identity Management
- 🔍 **Unified Employee Search** - Search across all connected identity systems
- 👤 **Self-Service Identity View** - Employees view their own identity data
- 🔄 **Real-time Data Refresh** - Instant refresh of identity information
- 📋 **JSON Data Export** - Copy raw JSON data for troubleshooting

### Integrated Systems
| System | Description |
|--------|-------------|
| **Ping Directory** | LDAP directory services |
| **Ping Federate** | SSO and federation |
| **Ping MFA** | Multi-factor authentication |
| **Ping Access** | Access management |
| **Ping Authorize** | Dynamic authorization |
| **Ping Intelligence** | API security |
| **CyberArk PAM** | Privileged access management |
| **CyberArk EPM** | Endpoint privilege management |
| **CyberArk Alero** | Third-party access |
| **CyberArk Conjur** | Secrets management |
| **CyberArk DPA** | Dynamic privileged access |
| **CyberArk Identity** | Identity security |
| **Saviynt IGA** | Identity governance |
| **Microsoft Entra ID** | Azure Active Directory |

### Operations Features
- 📊 **Operations Dashboard** - Centralized view for ops teams
- 🚨 **Recent Failures Panel** - Monitor authentication failures
- 🎫 **ServiceNow Integration** - View and create incidents
- ⚡ **Quick Actions** - Execute common operations per system
- 🔀 **Role Switching** - Ops can switch between ops/employee views

### User Experience
- 🌙 **Theme Support** - Light, Dark, and Navy themes
- 📱 **Responsive Design** - Mobile-friendly interface
- 🎨 **Collapsible System Cards** - Clean, organized UI
- 📖 **Educate Guide** - In-app documentation
- ⚙️ **Settings Panel** - Customize visible systems

---

## ⚙ Configuration (Detailed)

### Prerequisites

Before setting up the application, ensure you have the following installed:

| Requirement | Minimum Version | Recommended | Installation |
|-------------|----------------|-------------|--------------|
| **Node.js** | 18.0.0 | 20.x LTS | [nodejs.org](https://nodejs.org) |
| **npm** | 9.0.0 | 10.x | Included with Node.js |
| **Git** | 2.30+ | Latest | [git-scm.com](https://git-scm.com) |

**Verify Installation:**
```bash
node --version    # Should output v18.x.x or higher
npm --version     # Should output 9.x.x or higher
git --version     # Should output 2.30.x or higher
```

### Environment Variables

#### Backend Environment (`.env` in `/backend/`)

Create a `.env` file in the `backend/` directory with the following variables:

| Variable | Required | Default | Description | Example |
|----------|----------|---------|-------------|---------|
| `PORT` | No | `3001` | Express server port | `3001` |
| `JWT_SECRET` | **Yes** | `dev-secret-change-me` | Secret key for signing JWT tokens. **Must be changed in production!** | `your-super-secret-key-min-32-chars` |
| `LOG_LEVEL` | No | `info` | Winston logging level | `error`, `warn`, `info`, `http`, `verbose`, `debug`, `silly` |

**Example `.env` file:**
```dotenv
# Backend Environment Configuration

# Express server port
PORT=3001

# JWT signing secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-production-secret-key-at-least-32-characters-long

# Logging level
LOG_LEVEL=info
```

#### Frontend Environment (`.env.local` in root)

Create a `.env.local` file in the project root for frontend configuration:

| Variable | Required | Default | Description | Example |
|----------|----------|---------|-------------|---------|
| `NEXT_PUBLIC_API_BASE` | No | `http://localhost:3001` | Backend API base URL | `https://api.yourcompany.com` |

**Example `.env.local` file:**
```dotenv
# Frontend Environment Configuration

# Backend API URL (used for all API calls)
NEXT_PUBLIC_API_BASE=http://localhost:3001
```

### Feature Configuration

#### `backend/config/features.json`

Controls which systems and features are enabled:

```json
{
  "credentialSource": "env",
  "useMocks": true,
  "useMockAuth": true,
  "systems": {
    "ping-directory": true,
    "ping-federate": true,
    "cyberark": true,
    "cyberark-epm": true,
    "cyberark-alero": true,
    "cyberark-conjur": true,
    "cyberark-dpa": true,
    "cyberark-identity": true,
    "saviynt": true,
    "azure-ad": true,
    "ping-mfa": true,
    "ping-access": true,
    "ping-authorize": true,
    "ping-intelligence": true
  },
  "quickActionsTabs": {
    "ping-directory": true,
    "ping-federate": true,
    "cyberark": true,
    "saviynt": true,
    "azure-ad": true,
    "ping-mfa": true
  }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `credentialSource` | `string` | Where to load credentials from (`env`, `vault`, etc.) |
| `useMocks` | `boolean` | Enable mock data responses (for development) |
| `useMockAuth` | `boolean` | Enable mock authentication (for development) |
| `systems` | `object` | Enable/disable individual system integrations |
| `quickActionsTabs` | `object` | Show/hide quick action tabs per system |

#### `backend/config/roles.json`

Defines role-based access control (RBAC) permissions:

```json
{
  "employee": {
    "ping-directory": { "own": true, "all": false, "search": true },
    "cyberark": { "own": true, "all": false, "search": false }
  },
  "ops": {
    "ping-directory": { "own": true, "all": true, "search": true },
    "cyberark": { "own": true, "all": true, "search": false }
  }
}
```

| Permission | Description |
|------------|-------------|
| `own` | Can view their own identity data |
| `all` | Can view all users' identity data |
| `search` | Can search for users in this system |

### External Service Configuration

#### Production API Integrations

When deploying to production, configure the following external services:

##### 1. Ping Identity Services
- **Ping Directory**: Configure LDAP connection
- **Ping Federate**: Set up OAuth 2.0 client credentials
- **Ping MFA**: API key for MFA status queries
- **Ping Access**: Access management API credentials
- **Ping Authorize**: Policy decision point configuration
- **Ping Intelligence**: API security monitoring credentials

##### 2. CyberArk Services
- **CyberArk PAM**: REST API credentials with appropriate safe access
- **CyberArk EPM**: Endpoint management API configuration
- **CyberArk Alero**: Third-party access portal integration
- **CyberArk Conjur**: Secrets management API setup
- **CyberArk DPA**: Dynamic privileged access configuration
- **CyberArk Identity**: Identity security platform integration

##### 3. Saviynt IGA
- Configure Saviynt REST API credentials
- Set up appropriate enterprise roles for API access
- Enable required connectors for identity data

##### 4. Microsoft Entra ID (Azure AD)
- Register application in Azure Portal
- Configure Microsoft Graph API permissions:
  - `User.Read.All`
  - `Group.Read.All`
  - `AuditLog.Read.All`
  - `Directory.Read.All`
- Generate client secret and store securely

##### 5. ServiceNow Integration
- Create integration user with appropriate roles
- Configure REST API access
- Set up incident table permissions

---

## 🚀 Deployment Guide

### Option 1: Docker Deployment (Recommended)

```dockerfile
# Dockerfile (create in project root)
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm ci
RUN cd backend && npm ci

# Build frontend
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/backend ./backend

EXPOSE 3000 3001

CMD ["sh", "-c", "node backend/server.js & node server.js"]
```

**Build and Run:**
```bash
docker build -t employee-identity-portal .
docker run -p 3000:3000 -p 3001:3001 \
  -e JWT_SECRET=your-production-secret \
  -e NODE_ENV=production \
  employee-identity-portal
```

### Option 2: Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: .
      target: runner
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_BASE=http://backend:3001
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - LOG_LEVEL=info
    volumes:
      - ./backend/config:/app/config:ro
      - ./backend/logs:/app/logs
```

**Deploy:**
```bash
# Set environment variables
export JWT_SECRET=your-super-secret-production-key

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 3: Traditional Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Start with process manager (PM2):**
   ```bash
   npm install -g pm2
   
   # Start backend
   pm2 start backend/server.js --name "identity-portal-api"
   
   # Start frontend
   pm2 start npm --name "identity-portal-web" -- start
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

### Reverse Proxy Configuration (Nginx)

```nginx
# /etc/nginx/sites-available/identity-portal
server {
    listen 80;
    server_name identity-portal.yourcompany.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name identity-portal.yourcompany.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3001/health;
    }
}
```

---

## 💻 How to Run the Application (Locally)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/mahendra1044/employee-identity-portal.git
cd employee-identity-portal

# 2. Install dependencies (frontend + backend)
npm install
cd backend && npm install && cd ..

# 3. Create environment files
# Backend
cat > backend/.env << EOF
PORT=3001
JWT_SECRET=dev-secret-change-me
LOG_LEVEL=info
EOF

# Frontend (optional)
cat > .env.local << EOF
NEXT_PUBLIC_API_BASE=http://localhost:3001
EOF

# 4. Start both servers concurrently
npm run dev:all
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

### Step-by-Step Setup

#### Step 1: Clone the Repository
```bash
git clone https://github.com/mahendra1044/employee-identity-portal.git
cd employee-identity-portal
```

#### Step 2: Install Frontend Dependencies
```bash
npm install
```

#### Step 3: Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

#### Step 4: Configure Environment

**Backend Configuration:**
```bash
# Create backend .env file
cp backend/.env.example backend/.env  # if example exists, or create manually
```

Edit `backend/.env`:
```dotenv
PORT=3001
JWT_SECRET=dev-secret-change-me
LOG_LEVEL=debug
```

**Frontend Configuration (optional):**
```bash
# Create .env.local in root directory
echo "NEXT_PUBLIC_API_BASE=http://localhost:3001" > .env.local
```

#### Step 5: Start the Application

**Option A: Start both servers together (recommended)**
```bash
npm run dev:all
```

**Option B: Start servers separately**
```bash
# Terminal 1 - Backend
npm run dev:be

# Terminal 2 - Frontend
npm run dev
```

#### Step 6: Access the Application

Open your browser and navigate to: **http://localhost:3000**

### Development Login Credentials

With mock authentication enabled, use these email patterns:

| Email Pattern | Role | Access Level |
|---------------|------|--------------|
| `employee@example.com` | Employee | Own data only |
| `management@example.com` | Management | Own data + reports |
| `ops@example.com` | Operations | All systems, all users |
| `sso_ops@example.com` | SSO Operations | Ping systems focus |
| `pam_ops@example.com` | PAM Operations | CyberArk systems focus |
| `iga_ops@example.com` | IGA Operations | Saviynt systems focus |
| `tpag_ops@example.com` | TPAG Operations | Third-party access |

**Password**: Any non-empty string (mock auth)

### Available NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js frontend in development mode (with Turbopack) |
| `npm run dev:be` | Start Express backend server |
| `npm run dev:all` | Start both frontend and backend concurrently |
| `npm run build` | Build production-ready frontend |
| `npm run start` | Start production frontend server |
| `npm run lint` | Run ESLint code analysis |

---

## 👥 User Modes & Roles

### Runtime Modes

| Mode | Description | Mock Data | Authentication |
|------|-------------|-----------|----------------|
| **Development** | Local development with hot reload | ✅ Enabled | Mock JWT |
| **Staging** | Pre-production testing | Configurable | SSO/OAuth |
| **Production** | Live environment | ❌ Disabled | Enterprise SSO |

### User Roles

#### Employee
- **Permissions**: View own identity data across all systems
- **Access**: Self-service portal
- **Features**: 
  - View own data from all connected systems
  - Search in Ping Directory (limited)
  - View MFA device status
  - Export own data as JSON

#### Management
- **Permissions**: View own data + limited reporting
- **Access**: Enhanced self-service
- **Features**:
  - All employee features
  - Access to team reports
  - Enhanced search capabilities

#### Operations (ops)
- **Permissions**: Full read access to all systems and users
- **Access**: Operations dashboard
- **Features**:
  - Search any employee across all systems
  - View all user identity data
  - Access recent failures panel
  - ServiceNow incident integration
  - Quick actions for troubleshooting
  - Role toggle (switch to employee view)

#### Specialized Operations Roles

| Role | Focus Area | Systems Access |
|------|------------|----------------|
| **sso_ops** | SSO Operations | Ping Directory, Ping Federate, Ping MFA, Ping Access, Ping Authorize, Ping Intelligence |
| **pam_ops** | PAM Operations | CyberArk PAM, EPM, Alero, Conjur, DPA, Identity |
| **iga_ops** | IGA Operations | Saviynt IGA, Certifications, Analytics, Controls, Requests, Provisioning |
| **entraid_ops** | Entra ID Operations | Azure AD, Users, Groups, Apps, Conditional Access, Sign-in Logs |
| **tpag_ops** | TPAG Operations | Saviynt TPAG, Vendors, Contracts, Access, Risk, Lifecycle |

### Role Switching

Operations users can toggle between their ops view and employee view:
- **Ops View**: Full access to search and manage all users
- **Employee View**: See the portal as an employee would

Specialized ops (sso_ops, pam_ops, etc.) have additional toggle to general ops view.

---

## 📡 API Reference

### Authentication

#### POST `/auth/login`
Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "ops@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "ops",
  "email": "ops@example.com"
}
```

### System Data

#### GET `/api/own-{system}`
Get current user's identity data from specified system.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Systems:** `ping-directory`, `ping-federate`, `cyberark`, `saviynt`, `azure-ad`, `ping-mfa`

### Health Check

#### GET `/health`
Check backend server health.

**Response:**
```json
{
  "ok": true
}
```

### Configuration

#### GET `/config/features`
Get current feature configuration.

**Response:**
```json
{
  "useMocks": true,
  "systems": { ... },
  "quickActionsTabs": { ... }
}
```

---

## 🤝 Contributing

We welcome contributions to the Employee Identity Portal! Please follow these guidelines:

### Getting Started

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/employee-identity-portal.git
   ```
3. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Guidelines

- **Code Style**: Follow existing code patterns and use ESLint
- **TypeScript**: Use proper typing, avoid `any`
- **Components**: Keep components small and focused
- **Commits**: Use conventional commit messages:
  - `feat:` New feature
  - `fix:` Bug fix
  - `docs:` Documentation
  - `style:` Formatting
  - `refactor:` Code refactoring
  - `test:` Adding tests
  - `chore:` Maintenance

### Pull Request Process

1. Update documentation if needed
2. Ensure all tests pass
3. Run linting: `npm run lint`
4. Create PR with descriptive title and body
5. Request review from maintainers

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 📞 Support

For issues and feature requests, please create an issue in the GitHub repository.

**Repository**: [github.com/mahendra1044/employee-identity-portal](https://github.com/mahendra1044/employee-identity-portal)

---

<div align="center">
  <strong>Built with ❤️ for Enterprise Identity Management</strong>
</div>
