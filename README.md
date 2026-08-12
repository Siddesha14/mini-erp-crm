# Mini ERP CRM

A full-stack ERP and CRM application for managing customers, products, inventory, delivery challans, and business operations with role-based access control.

## Features

### Dashboard

* Customer count
* Product count
* Low-stock product alerts
* Total challans
* Current inventory quantity
* Stock IN / OUT analytics
* Challan status breakdown
* Recent challans
* Low-stock alerts

### Customer Management

* Create customers
* Update customers
* View customer details
* Customer search
* Customer status management
* Customer type management
* GST and business information
* Follow-up management
* Customer follow-up history

### Product Management

* Product catalog
* SKU management
* Product pricing
* Warehouse assignment
* Minimum stock levels
* Current stock tracking
* Product details

### Inventory

* Stock movement tracking
* Stock IN
* Stock OUT
* Current stock levels
* Low-stock detection
* Warehouse-based inventory management

### Challans

* Create delivery challans
* Add multiple products
* Automatic quantity calculations
* Challan status management
* Customer information
* Challan details
* PDF challan generation
* Stock updates through challan workflows

### Authentication & Authorization

The application uses JWT-based authentication with role-based access control.

Available roles:

| Role      | Access                                   |
| --------- | ---------------------------------------- |
| ADMIN     | Full system access                       |
| SALES     | Dashboard, Customers, Challans           |
| WAREHOUSE | Dashboard, Products, Inventory           |
| ACCOUNTS  | Dashboard, Customers, Products, Challans |

Users only see the sections available to their role.

---

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* React Router
* Tailwind CSS
* Axios
* Lucide React
* jsPDF

### Backend

* Node.js
* Express
* TypeScript
* JWT
* Zod
* bcryptjs
* CORS

### Database

* PostgreSQL
* Prisma ORM

### DevOps

* Docker
* Docker Compose
* Nginx

---

## Project Structure

```text
mini-erp-crm/
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   └── package.json
│
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── auth/
│   │   ├── customers/
│   │   ├── products/
│   │   ├── inventory/
│   │   ├── challans/
│   │   ├── dashboard/
│   │   └── middleware/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml
└── .gitignore
```

---

# Local Development

## Prerequisites

Make sure the following are installed:

* Node.js
* npm
* PostgreSQL
* Git

---

## 1. Clone the repository

```bash
git clone <repository-url>
cd mini-erp-crm
```

---

## 2. Configure the server

Create:

```text
server/.env
```

based on:

```text
server/.env.example
```

Required variables:

```env
DATABASE_URL=
JWT_SECRET=
PORT=5000
CLIENT_URL=http://localhost:5173
```

Set `DATABASE_URL` to the PostgreSQL database connection string.

Set `JWT_SECRET` to a secure secret used to sign JWT authentication tokens.

---

## 3. Configure the client

Create:

```text
client/.env
```

based on:

```text
client/.env.example
```

For normal local development:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 4. Install dependencies

### Server

```bash
cd server
npm install
```

### Client

```bash
cd ../client
npm install
```

---

## 5. Generate Prisma Client

From the server directory:

```bash
npm run prisma:generate
```

---

## 6. Run database migrations

From the server directory:

```bash
npm run prisma:migrate
```

---

## 7. Start the backend

From:

```text
server/
```

run:

```bash
npm run dev
```

The API runs on:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

---

## 8. Start the frontend

From:

```text
client/
```

run:

```bash
npm run dev
```

Vite normally uses:

```text
http://localhost:5173
```

If that port is already occupied, Vite may use another available port such as `5174`.

---

# Docker

The project includes a production-style Docker setup.

Docker runs:

```text
React/Vite
    ↓
Nginx
    ↓
Express API
    ↓
PostgreSQL
```

The PostgreSQL database remains external and is accessed using `DATABASE_URL`.

## Docker Ports

| Service          | Container Port | Host Port |
| ---------------- | -------------: | --------: |
| Client / Nginx   |             80 |      5175 |
| Server / Express |           5000 |      5001 |
| PostgreSQL       |       External |  External |

The normal local development ports remain available:

```text
Frontend: 5173 / 5174
Backend: 5000
```

Docker uses:

```text
Frontend: 5175
Backend: 5001
```

---

## Docker environment

The root Docker environment should contain:

```env
VITE_API_URL=http://localhost:5001/api
```

The server continues using:

```text
server/.env
```

for:

```env
DATABASE_URL=
JWT_SECRET=
PORT=5000
CLIENT_URL=http://localhost:5173
```

---

## Build Docker images

From the project root:

```bash
docker compose build
```

---

## Start Docker

```bash
docker compose up
```

Open the Dockerized application:

```text
http://localhost:5175
```

Backend health check:

```text
http://localhost:5001/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "ERP API is running"
}
```

---

## Stop Docker

```bash
docker compose down
```

---

# API Modules

The backend exposes the following API areas:

```text
/api/health

/api/auth
/api/customers
/api/products
/api/inventory
/api/challans
/api/dashboard
```

Authentication uses:

```text
Authorization: Bearer <JWT>
```

Protected routes require a valid authentication token.

Role authorization is enforced on protected operations.

---

# Security

Environment files containing secrets are excluded from Git.

The repository ignores:

```text
.env
.env.*
```

while allowing:

```text
.env.example
```

Never commit:

* Database passwords
* JWT secrets
* Production credentials
* Private API keys

---

# Production Build

## Client

```bash
cd client
npm run build
```

## Server

```bash
cd server
npm run build
```

Both builds should complete successfully before deployment.

---

# Main Business Workflow

A typical ERP workflow is:

```text
Login
  ↓
Dashboard
  ↓
Customer Management
  ↓
Product Management
  ↓
Inventory
  ↓
Create Challan
  ↓
Select Customer
  ↓
Add Products & Quantities
  ↓
Confirm Challan
  ↓
Update Inventory
  ↓
Generate PDF Challan
```

The dashboard provides an operational overview of the resulting business activity.

---

# Role-Based Workflow

### ADMIN

Full access to:

```text
Dashboard
Customers
Products
Inventory
Challans
```

### SALES

Access to:

```text
Dashboard
Customers
Challans
```

### WAREHOUSE

Access to:

```text
Dashboard
Products
Inventory
```

### ACCOUNTS

Access to:

```text
Dashboard
Customers
Products
Challans
```

---

# Validation

The application uses:

* TypeScript for static type checking
* Zod for backend request validation
* JWT authentication
* Role-based authorization
* Prisma database access
* Protected frontend routes

---

# Development Commands

## Client

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Server

```bash
npm run dev
npm run build
npm start
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

---

# Project Status

Current implemented functionality includes:

* Role-based authentication
* Protected routes
* Customer management
* Product management
* Inventory management
* Stock movement tracking
* Challan management
* PDF challan generation
* Dashboard analytics
* Low-stock alerts
* Backend-powered customer search
* Dockerized frontend and backend
* Production builds
* PostgreSQL + Prisma integration
