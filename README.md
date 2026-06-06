# MediCare AI – Smart Hospital Management System

> **Smart Healthcare, Powered by AI** 🏥

A professional full-stack hospital management platform with AI integration, role-based dashboards, analytics, and modern SaaS-grade UI. Built as a comprehensive college project.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-blue?logo=tailwindcss)
![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-4-black?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)

---

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (7 roles)
- Protected routes & dashboards
- Demo mode with pre-configured accounts

### 👥 User Roles
| Role | Dashboard | Key Features |
|------|-----------|-------------|
| **Admin** | Full system overview | User management, analytics, reports |
| **Doctor** | Patient-focused | Appointments, prescriptions, AI assist |
| **Nurse** | Monitoring-focused | Vitals, ward management, medications |
| **Receptionist** | Operations-focused | Registration, scheduling, check-ins |
| **Patient** | Self-service | Appointments, records, AI tools |
| **Pharmacist** | Inventory-focused | Stock management, alerts, processing |
| **Lab Technician** | Test-focused | Requests, results, report management |

### 🤖 AI Features
- **Symptom Checker** – Enter symptoms → AI analysis with conditions, risk level, department recommendation
- **Report Summarizer** – Paste medical report → AI summary with key findings and recommendations
- **Healthcare Chatbot** – Natural conversation about health queries, appointments, hospital services

### 📊 Analytics
- Patient growth trends
- Revenue analytics
- Appointment statistics
- Department performance metrics

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Tailwind CSS |
| Backend | Node.js + Express.js + TypeScript |
| Database | PostgreSQL (with in-memory demo mode) |
| AI | Google Gemini API |
| Charts | Recharts |
| Icons | Lucide React |
| HTTP | Axios |
| Auth | JWT (jsonwebtoken + bcryptjs) |

---

## 📦 Quick Start

### Prerequisites
- Node.js 18+ installed
- (Optional) PostgreSQL 14+ for database mode

### 1. Clone & Install

```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

### 2. Configure Environment

```bash
# In /server directory
cp .env.example .env
# Edit .env with your settings (optional - works without any config in demo mode)
```

### 3. Start Development Servers

```bash
# Terminal 1 - Start backend (port 5000)
cd server
npm run dev

# Terminal 2 - Start frontend (port 5173)
cd client
npm run dev
```

### 4. Open in Browser
Navigate to `http://localhost:5173`

---

## 🔑 Demo Credentials

The application includes pre-configured demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@medicare.com | admin123 |
| Doctor | doctor@medicare.com | doctor123 |
| Nurse | nurse@medicare.com | nurse123 |
| Receptionist | reception@medicare.com | reception123 |
| Patient | patient@medicare.com | patient123 |
| Pharmacist | pharma@medicare.com | pharma123 |
| Lab Tech | lab@medicare.com | lab123 |

---

## 🗄️ Database Setup (Optional)

The app works in **demo mode** without a database. To use PostgreSQL:

1. Create a database:
```sql
CREATE DATABASE medicare_ai;
```

2. Run the schema:
```bash
psql -d medicare_ai -f server/src/config/schema.sql
```

3. Set the connection string in `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/medicare_ai
```

---

## 📁 Project Structure

```
medicare-ai/
├── client/                  # React Frontend
│   ├── src/
│   │   ├── components/      # Reusable UI + Layout
│   │   ├── contexts/        # Auth Context
│   │   ├── data/            # Mock/Demo Data
│   │   ├── pages/           # All Page Components
│   │   │   ├── admin/       # Admin Dashboard & Management
│   │   │   ├── doctor/      # Doctor Dashboard
│   │   │   ├── nurse/       # Nurse Dashboard
│   │   │   ├── receptionist/# Receptionist Dashboard
│   │   │   ├── patient/     # Patient Dashboard
│   │   │   ├── pharmacy/    # Pharmacy Management
│   │   │   ├── lab/         # Lab Management
│   │   │   ├── billing/     # Billing Module
│   │   │   ├── ai/          # AI Center
│   │   │   └── settings/    # Settings
│   │   ├── services/        # API Service Layer
│   │   └── types/           # TypeScript Types
│   └── ...
│
├── server/                  # Express Backend
│   ├── src/
│   │   ├── config/          # DB, Env, Schema
│   │   ├── data/            # In-Memory Store
│   │   ├── middleware/      # Auth, RBAC, Errors
│   │   ├── routes/          # API Routes
│   │   ├── services/        # AI Service
│   │   ├── types/           # TypeScript Types
│   │   └── utils/           # JWT, Helpers
│   └── ...
│
└── README.md
```

---

## 🎨 Design System

- **Primary Color**: Blue (`#2563eb`)
- **Accent Color**: Emerald (`#10b981`)
- **Font**: Inter (Google Fonts)
- **Style**: Glassmorphism, gradient accents, micro-animations
- **Layout**: Sidebar navigation with responsive mobile drawer

---

## ⚠️ Disclaimer

> AI features are for **informational purposes only** and do not constitute medical advice or diagnosis. Always consult a qualified healthcare professional for medical decisions.

---

## 📄 License

MIT License – Free for educational and personal use.

---

**Built with ❤️ for college project demonstration**
