# Architecture Documentation

## Overview

The Merchant Transaction Dashboard is a full-stack application designed to display and analyze merchant transaction data. This document explains the architectural decisions, data modeling approach, and trade-offs made during development.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Frontend                                │
│                    (React + Vite + Tailwind)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ FilterSection│  │  MTDSummary  │  │   MonthlySummary     │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│                           │                                      │
│                    ┌──────┴──────┐                               │
│                    │   App.jsx   │                               │
│                    │   (State)   │                               │
│                    └──────┬──────┘                               │
│                           │                                      │
│                  ┌────────┴────────┐                             │
│                  │ transactionApi  │                             │
│                  │  (API Client)   │                             │
│                  └────────┬────────┘                             │
└───────────────────────────┼─────────────────────────────────────┘
                            │ HTTP/REST
┌───────────────────────────┼─────────────────────────────────────┐
│                          Backend                                 │
│                     (Node.js + Express)                          │
│                  ┌────────┴────────┐                             │
│                  │   Express App   │                             │
│                  │   (Routes)      │                             │
│                  └────────┬────────┘                             │
│                           │                                      │
│         ┌─────────────────┼─────────────────┐                    │
│         │                 │                 │                    │
│  ┌──────┴──────┐  ┌───────┴───────┐  ┌─────┴─────┐              │
│  │ filterService│  │aggregationSvc│  │ dataStore │              │
│  └─────────────┘  └───────────────┘  └─────┬─────┘              │
│                                            │                     │
│                                   ┌────────┴────────┐            │
│                                   │ transactions.json│            │
│                                   │   (Mock Data)   │            │
│                                   └─────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## Backend Architecture

### Layer Structure

The backend follows a layered architecture pattern:

1. **Routes Layer** (`src/routes/`)
   - Handles HTTP request/response
   - Validates query parameters
   - Delegates to service layer

2. **Services Layer** (`src/services/`)
   - Contains business logic
   - `filterService.js`: Transaction filtering logic
   - `aggregationService.js`: Metric calculation and grouping

3. **Data Layer** (`src/data/`)
   - Manages data access
   - Loads and caches transaction data
   - Abstracts storage mechanism

### Data Model

Each transaction follows this schema:

```javascript
{
  transactionId: string,      // Unique identifier (e.g., "TXN-ABC123")
  merchantId: string,         // Merchant identifier (e.g., "MERCH-XYZ")
  amount: number,             // Transaction amount in USD
  cardBrand: enum,            // "Visa" | "Mastercard" | "Amex" | "Discover"
  status: enum,               // "Approved" | "Declined"
  declineReasonCode?: string, // Only present if status === "Declined"
  transactionDate: string     // ISO 8601 timestamp
}
```

**Design Decision**: The `declineReasonCode` is only present for declined transactions, following the sparse field pattern. This reduces data size and makes the decline-specific nature explicit.

### Filtering Implementation

Filters are implemented as composable functions:

```javascript
// Each filter is independent and can be combined
function filterByCardBrand(transactions, cardBrand) { ... }
function filterByStatus(transactions, status) { ... }
function filterByDeclineReasonCode(transactions, code) { ... }

// Combined via applyFilters()
function applyFilters(transactions, filters) {
  let result = [...transactions];
  if (filters.cardBrand) result = filterByCardBrand(result, filters.cardBrand);
  if (filters.status) result = filterByStatus(result, filters.status);
  if (filters.declineReasonCode) result = filterByDeclineReasonCode(result, filters.declineReasonCode);
  return result;
}
```

**Rationale**: This approach allows:
- Easy addition of new filter types
- Independent testing of each filter
- Clear filter precedence

### Aggregation Implementation

Aggregation calculates metrics in two scopes:

1. **MTD (Month-to-Date)**
   - Filters transactions to current month
   - Calculates totals, breakdowns by card brand, and decline reasons

2. **Month-by-Month**
   - Groups transactions by month
   - Applies same metric calculation to each group
   - Returns sorted array (most recent first)

**Key Functions**:
- `getMonthKey(date)`: Extracts "YYYY-MM" from dates
- `calculateMetrics(transactions)`: Core aggregation logic
- `calculateMTDSummary()`: Current month metrics
- `calculateMonthByMonthSummary()`: Historical breakdown

## Frontend Architecture

### Component Structure

```
App.jsx (Container)
├── FilterSection.jsx (Filter Controls)
├── MTDSummary.jsx (Current Month Display)
└── MonthlySummary.jsx (Historical Display)
    └── MonthCard (Expandable Month Details)
```

### State Management

State is centralized in `App.jsx`:

```javascript
const [filters, setFilters] = useState({
  cardBrand: 'all',
  status: 'all', 
  declineReasonCode: 'all'
});
const [mtdSummary, setMtdSummary] = useState(null);
const [monthlySummary, setMonthlySummary] = useState([]);
const [loading, setLoading] = useState(true);
```

**Design Decision**: Used React's built-in state instead of Redux/Zustand because:
- Application state is simple and localized
- No need for complex state sharing
- Reduces bundle size and complexity

### Data Flow

1. User changes filter → `handleFilterChange()` updates state
2. `useEffect` detects filter change → calls `loadSummaryData()`
3. API returns data → Updates `mtdSummary` and `monthlySummary`
4. Components re-render with new data

### API Client

The `transactionApi.js` module handles:
- URL construction with query parameters
- Fetch requests to backend
- Error handling

**Proxy Configuration**: Vite proxies `/api` requests to `localhost:3001`, avoiding CORS issues during development.

## Trade-offs and Decisions

### 1. In-Memory vs. Database Storage

**Choice**: JSON file with in-memory caching

**Pros**:
- Simple setup, no database dependencies
- Fast reads after initial load
- Easy to generate and reset test data

**Cons**:
- Not suitable for production scale
- No persistence of updates
- Limited query capabilities

**Future Improvement**: Migrate to PostgreSQL or MongoDB for production.

### 2. Server-Side vs. Client-Side Filtering

**Choice**: Server-side filtering

**Pros**:
- Scales better with large datasets
- Reduces data transfer
- Centralizes business logic

**Cons**:
- More API calls
- Network latency on filter changes

**Alternative Considered**: Client-side filtering with full data load would be faster for small datasets but doesn't scale.

### 3. Component Library vs. Custom Components

**Choice**: Custom components with Tailwind CSS

**Pros**:
- Full control over styling
- Smaller bundle size
- No external dependencies

**Cons**:
- More development time
- Less sophisticated interactions

**Future Improvement**: Add a charting library (e.g., Recharts) for data visualization.

### 4. Testing Strategy

**Choice**: Unit tests for services + Integration tests for API

**Coverage**:
- Filter logic: 100% covered
- Aggregation logic: 100% covered
- API endpoints: Key paths covered

**Future Improvement**: Add frontend testing with React Testing Library and Cypress E2E tests.

## Improvements with More Time

### Short-term Enhancements
1. **Data Visualization**: Add charts for trends (line charts, bar graphs)
2. **Pagination**: For transaction list view
3. **Export Functionality**: CSV/Excel export of filtered data
4. **Date Range Filters**: Custom date range selection

### Medium-term Enhancements
1. **Real Database**: PostgreSQL with proper indexing
2. **Caching Layer**: Redis for frequently accessed summaries
3. **Authentication**: User login and merchant-specific views
4. **Frontend Testing**: React Testing Library + Cypress

### Long-term Architecture
1. **Microservices**: Separate aggregation service for complex calculations
2. **Event Sourcing**: For transaction history and audit trails
3. **Real-time Updates**: WebSocket for live dashboard updates
4. **Horizontal Scaling**: Load balancer with multiple API instances

## Security Considerations

Current implementation assumes a trusted environment. For production:

1. **Input Validation**: Sanitize all query parameters
2. **Rate Limiting**: Prevent API abuse
3. **Authentication**: JWT or session-based auth
4. **HTTPS**: Encrypt all traffic
5. **CORS Configuration**: Restrict to known origins

## Performance Considerations

Current optimizations:
- In-memory data store for fast access
- Single API call for combined MTD + Monthly summaries
- Efficient array operations for filtering

Future optimizations needed:
- Database indexing on frequently filtered fields
- Response caching with TTL
- Lazy loading for historical months
- Virtual scrolling for large lists

## Conclusion

This architecture prioritizes simplicity and testability while providing a solid foundation for future enhancements. The separation of concerns between filtering, aggregation, and presentation makes the codebase maintainable and extensible.
