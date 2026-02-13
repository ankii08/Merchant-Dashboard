# Merchant Transaction Dashboard

A full-stack analytics dashboard for visualizing and filtering merchant transaction data. Built with React, Node.js, and Express.

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![React](https://img.shields.io/badge/React-18.x-blue)

## Overview

This dashboard allows merchants to:
- View **Month-to-Date (MTD)** transaction summaries
- Analyze **historical trends** with month-by-month breakdowns
- **Filter data** by card brand, transaction status, and decline reason
- Track **approval rates** and transaction volumes in real-time

## Quick Start

### Prerequisites

- **Node.js** v18.x or higher ([Download](https://nodejs.org/))
- **npm** v9.x or higher (comes with Node.js)

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/merchant-transaction-dashboard.git
cd merchant-transaction-dashboard
```

### Step 2: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 3: Generate Sample Data

```bash
cd ../backend
npm run generate-data
```

This creates 75 sample transactions spanning the last 7 months.

### Step 4: Start the Application

**Terminal 1 — Backend Server (Port 3001):**
```bash
cd backend
npm start
```

**Terminal 2 — Frontend Dev Server (Port 5173):**
```bash
cd frontend
npm run dev
```

### Step 5: Open the Dashboard

Navigate to **http://localhost:5173** in your browser.

---

## Project Structure

```
merchant-transaction-dashboard/
├── backend/                          # Express.js REST API
│   ├── src/
│   │   ├── data/
│   │   │   ├── dataStore.js          # In-memory data management
│   │   │   └── transactions.json     # Generated transaction data
│   │   ├── routes/
│   │   │   └── transactionRoutes.js  # API endpoint definitions
│   │   ├── services/
│   │   │   ├── aggregationService.js # MTD & monthly calculations
│   │   │   └── filterService.js      # Multi-criteria filtering
│   │   ├── utils/
│   │   │   └── generateMockData.js   # Sample data generator
│   │   ├── app.js                    # Express middleware config
│   │   └── index.js                  # Server entry point
│   ├── tests/                        # Jest test suites
│   │   ├── aggregationService.test.js
│   │   ├── api.integration.test.js
│   │   └── filterService.test.js
│   └── package.json
│
├── frontend/                         # React + Vite application
│   ├── src/
│   │   ├── api/
│   │   │   └── transactionApi.js     # HTTP client for backend
│   │   ├── components/
│   │   │   ├── FilterSection.jsx     # Dropdown filter controls
│   │   │   ├── MTDSummary.jsx        # Current month metrics cards
│   │   │   └── MonthlySummary.jsx    # Expandable monthly cards
│   │   ├── App.jsx                   # Root component & state
│   │   ├── main.jsx                  # React DOM entry
│   │   └── index.css                 # Tailwind directives
│   ├── index.html
│   ├── vite.config.js                # Vite + API proxy config
│   ├── tailwind.config.js
│   └── package.json
│
├── ARCHITECTURE.md                   # Technical design decisions
├── README.md                         # This file
└── .gitignore
```

---

## API Reference

**Base URL:** `http://localhost:3001/api`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/transactions` | List all transactions (supports filters) |
| `GET` | `/transactions/summary` | MTD + monthly summaries combined |
| `GET` | `/transactions/mtd` | Current month summary only |
| `GET` | `/transactions/monthly` | Historical monthly summaries |
| `GET` | `/transactions/filters` | Available filter options |
| `GET` | `/health` | Server health check |

### Query Parameters

All transaction endpoints support these optional filters:

| Parameter | Example Values | Description |
|-----------|----------------|-------------|
| `cardBrand` | `Visa`, `Mastercard`, `Amex`, `Discover` | Filter by payment network |
| `status` | `Approved`, `Declined` | Filter by transaction outcome |
| `declineReasonCode` | `01-Insufficient funds` | Filter by specific decline reason |

### Example Requests

```bash
# Get all transactions
curl http://localhost:3001/api/transactions

# Get only Visa transactions
curl "http://localhost:3001/api/transactions?cardBrand=Visa"

# Get declined transactions with a specific reason
curl "http://localhost:3001/api/transactions?status=Declined&declineReasonCode=01-Insufficient%20funds"

# Get filtered summary
curl "http://localhost:3001/api/transactions/summary?cardBrand=Mastercard&status=Approved"
```

### Response Format

```json
{
  "success": true,
  "mtdSummary": {
    "month": "2026-02",
    "monthFormatted": "Feb 2026",
    "totalTransactions": 15,
    "totalApproved": 12,
    "totalDeclined": 3,
    "totalAmount": 4523.50,
    "approvedAmount": 3890.25,
    "declinedAmount": 633.25,
    "byCardBrand": { ... },
    "byDeclineReason": { ... }
  },
  "monthByMonth": [ ... ]
}
```

---

##  Running Tests

```bash
cd backend

# Run all tests with coverage
npm test

# Run tests in watch mode during development
npm run test:watch
```

### Test Coverage

| Category | Tests | Coverage |
|----------|-------|----------|
| Filter Service | Unit tests for each filter type | 100% |
| Aggregation Service | MTD and monthly calculations | 100% |
| API Integration | All endpoints with supertest | 88% |

---

##  Development

### Backend Development (with auto-reload)

```bash
cd backend
npm run dev
```

### Frontend Development (with HMR)

```bash
cd frontend
npm run dev
```

### Building for Production

```bash
cd frontend
npm run build
```

The production build will be in `frontend/dist/`.

---

## Data Model

### Transaction Object

```javascript
{
  transactionId: "TXN-J948DBRFS",      // Unique 10-char alphanumeric ID
  merchantId: "MERCH-GX7AB6",          // Merchant identifier
  amount: 504.43,                       // Transaction amount in USD
  cardBrand: "Visa",                    // Payment network
  status: "Approved",                   // "Approved" or "Declined"
  transactionDate: "2026-02-10T12:09:04.000Z"  // ISO 8601 timestamp
}
```

### Declined Transaction (includes reason)

```javascript
{
  transactionId: "TXN-R3B7LX16N",
  merchantId: "MERCH-OHBR3N",
  amount: 250.00,
  cardBrand: "Mastercard",
  status: "Declined",
  declineReasonCode: "01-Insufficient funds",  // Only present when declined
  transactionDate: "2026-02-09T10:15:00.000Z"
}
```

### Decline Reason Codes

| Code | Description |
|------|-------------|
| `01-Insufficient funds` | Cardholder has insufficient balance |
| `02-Invalid card number` | Card number failed validation |
| `03-Suspected fraud` | Transaction flagged by fraud detection |

---

## Architecture Highlights

- **Layered Backend**: Routes → Services → Data Store separation
- **Composable Filters**: Each filter is an independent, testable function
- **Reactive Frontend**: Filter changes trigger automatic data refresh
- **Responsive UI**: Mobile-first design with Tailwind CSS

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed design decisions.
