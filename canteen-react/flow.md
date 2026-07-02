# System Flow: Canteen Financial Suite

## Tech Stack
- **Frontend**: React 19, Vite 8, React Router 7
- **Backend**: Supabase (Auth + PostgreSQL)
- **Charts**: Chart.js + react-chartjs-2
- **Excel**: ExcelJS (template-based export)
- **Styling**: CSS with dark/light theme

## Entry Point (`src/main.jsx`)
- Renders `<ThemeProvider>` wrapping `<App />`
- ThemeProvider reads `localStorage.theme` or `prefers-color-scheme`; sets `data-theme` on `<html>`

---

## Flow by Page

### 1. Login (`/login`) — `src/pages/Login.jsx`
- **Purpose**: Authenticate users via Supabase Auth
- **Flow**:
  1. User enters email + password
  2. Clicks "Remember this device" toggle (sets `localStorage.remember_me`)
  3. On submit: calls `signIn(email, password)` from `supabaseAuthApi.js`
  4. On success: calls `login({ user, session })` from `useAuth` hook
  5. `login()` writes auth state to `authStore.js` (notifies all subscribers)
  6. `authStore` also listens to `supabase.auth.onAuthStateChange` for token refresh
  7. If already authenticated (`isAuthenticated === true`), redirects to `/`
  8. "Remember me" controls whether session is stored in `localStorage` vs `sessionStorage`

### 2. Register (`/register`) — `src/pages/Register.jsx`
- **Purpose**: Handle Supabase magic-link / invite password setup
- **Flow**:
  1. On mount: checks if there's an active Supabase session (from invite link)
  2. If no session: shows "Access Restricted" — no active invitation
  3. If session exists: shows password form
  4. User sets password + confirm
  5. On submit: calls `updatePassword(password)`, then `signOut()`, redirects to `/login`
  6. Catches invite callback URLs on any page via `RedirectInviteToRegister` component in `App.jsx`
     - Checks URL params for `type=signup`, `type=invite`, or `access_token` + `refresh_token`

### 3. Dashboard (`/dashboard`) — `src/pages/Dashboard.jsx`
- **Purpose**: Show real-time financial overview with a line chart
- **Flow**:
  1. Uses `useReports` hook to fetch all reports from Supabase
  2. Shows 4 stat cards: Gross Revenue, Operational Costs, Net Performance, Reports Filed
  3. Shows a line chart (Sales vs Expenses over time) using Chart.js
  4. Date range filter (from/to) filters the report data client-side
  5. Chart renders if filtered data exists
  6. `useReports` calls `getReports()` → `supabaseReportsApi.getReports()` → `SELECT * FROM reports ORDER BY report_date DESC`

### 4. Create Report (`/entry`) — `src/pages/Entry.jsx`
- **Purpose**: Create or edit daily financial reports
- **Sections** (each is an array of rows with `{ id, label, amount, group? }`):
  - **Cash Revenue Streams** (Cash Sales): Store, Kitchen, Palamig, School Supplies
  - **Inventory Procurement** (Store Purchases): labeled rows with groups (Store, Kitchen, Palamig, School Supplies)
  - **Operational Overhead** (Operating Expenses): Salary of Helpers, Utility, SSS, LPG, Others
  - **Workforce Payroll** (Salary Breakdown): staff name + amount rows
  - **Consignments** (Store Consignment): supplier name + amount rows
- **Flow**:
  1. Select canteen location (Canteen 1–4) + date
  2. Add/remove rows via buttons
  3. Amounts entered via `InputCurrency` component (stores as cents, displays as PHP)
  4. `useFormCalc` computes live totals: `totalSales`, `totalCashPurchases`, `payableToSupplier`, `totalOperatingExpenses`, `salaryBreakdownTotal`, `totalExpenses = totalCashPurchases + totalOperatingExpenses`, `netProfit = totalSales - totalExpenses`
  5. "Live Performance Audit" summary bar at bottom shows totals in real time
  6. **Edit mode**: if `?edit=<id>` present in URL, loads that report via `getReportById(id)` and populates all sections
  7. On save: calls `createOrUpdateReport()` → `reportsApi.saveReport()` → upserts into 6 Supabase tables:
     - `reports` (id, user_id, report_date, canteen_location, remarks, totals JSON, updated_at)
     - `report_cash_sales` (report_id, label, amount, sort_order)
     - `report_store_purchases` (report_id, label, group_name, amount, sort_order)
     - `report_store_consignment` (report_id, label, amount, sort_order)
     - `report_operating_expenses` (report_id, label, amount, sort_order)
     - `report_salary_breakdown` (report_id, helper_name, amount, sort_order)
  8. On success: navigates to `/daily`

### 5. Daily Reports (`/daily`) — `src/pages/DailyReports.jsx`
- **Purpose**: View all daily reports, filter by date, toggle between individual/aggregated views
- **Flow**:
  1. Uses `useReports` to fetch all reports
  2. Date filter input to narrow down reports
  3. **Individual View**: paginated table of each report (date, location, revenue, costs, net profit, view/delete actions)
  4. **Aggregated View**: groups reports by date, shows combined totals per day
  5. Delete: confirms via `window.confirm`, then calls `removeReport(id)` → Supabase `DELETE`
  6. View: links to `/view/<id>`
  7. "New Session" button links to `/entry`
  8. Header shows summary stats for filtered set (total revenue, costs, net profit, avg per session)

### 6. View Report (`/view/:id`) — `src/pages/ViewReport.jsx`
- **Purpose**: View a single report or aggregated monthly/yearly view
- **Flow**:
  - **Single report** (`/view/:id`): loads full report with 5 section tables (Cash Sales, Store Purchases, Consignment, Operating Expenses, Salary Breakdown)
  - **Monthly** (`/view/monthly/:month`): aggregates all reports in that month, shows branch-by-branch breakdown with wages, SSS, supplies, purchases, revenue, net
  - **Yearly** (`/view/yearly/:year`): aggregates all reports in that year, shows month-by-month breakdown
  - **Export**:
    - Single: `exportDailyReportToTemplate(report)` — loads `report-template.xlsx`, maps data to cells via `map` config
    - Monthly: `exportMonthlyReportToTemplate({ month, rows })` — loads `Monthly-Report.xlsx`
    - Yearly: `exportYearlyReportToTemplate({ year, rows })` — loads `Yearly-Report.xlsx`
  - Edit button links to `/entry?edit=<id>`

### 7. Monthly Reports (`/monthly`) — `src/pages/MonthlyReports.jsx`
- **Purpose**: Browse reports grouped by month
- **Flow**:
  1. Groups all reports by month (YYYY-MM key)
  2. Shows cards with month name, log count, total revenue, costs, net profit
  3. View button → `/view/monthly/<YYYY-MM>`
  4. Delete button → deletes all reports in that month

### 8. Yearly Reports (`/yearly`) — `src/pages/YearlyReports.jsx`
- **Purpose**: Browse reports grouped by fiscal year
- **Flow**:
  1. Groups all reports by year (YYYY key)
  2. Shows cards with year, record count, revenue, costs, net profit, plus breakdown of wages/SSS/purchases
  3. View button → `/view/yearly/<YYYY>`
  4. Delete button → deletes all reports in that year

---

## Auth Flow (`src/services/authStore.js`)
- **authStore** is a simple pub/sub store (not React state)
  - `getAuthState()` — returns current `{ isAuthenticated, user, session }`
  - `setAuthState(next)` — updates state + notifies all listeners
  - `subscribe(listener)` — registers listener, returns unsubscribe fn
  - `initializeAuth()` — called once on app mount:
    1. Checks `supabase.auth.getSession()` for existing session
    2. Sets up `onAuthStateChange` listener for token refresh/login/logout
- **`useAuth` hook**: subscribes to authStore, provides `login`, `logout`, `isAuthenticated`, `user`, `session`
- **`supabaseClient.js`**: creates Supabase client with custom storage (session vs local depending on `remember_me`)
- **`ProtectedRoute`** in `App.jsx`: redirects unauthenticated users to `/login`

## Routing (`src/App.jsx`)
- `/` → redirects to `/dashboard` if authenticated, else `/login`
- `/login` → Login page (public)
- `/register` → Register page (public, but requires invite session)
- `/dashboard` → Dashboard (protected)
- `/daily` → Daily Reports (protected)
- `/entry` → Create Report (protected, `?edit=<id>` for edit)
- `/monthly` → Monthly Reports (protected)
- `/yearly` → Yearly Reports (protected)
- `/view/:id` → View single report (protected)
- `/view/monthly/:month` → View monthly aggregated (protected)
- `/view/yearly/:year` → View yearly aggregated (protected)
- `*` → redirect to `/`

## Data Model (Supabase Tables)
| Table | Key Columns |
|---|---|
| `reports` | `id UUID PK`, `user_id`, `report_date`, `canteen_location`, `remarks`, `totals JSONB`, `created_at`, `updated_at` |
| `report_cash_sales` | `report_id FK`, `label`, `amount`, `sort_order` |
| `report_store_purchases` | `report_id FK`, `label`, `group_name`, `amount`, `sort_order` |
| `report_store_consignment` | `report_id FK`, `label`, `amount`, `sort_order` |
| `report_operating_expenses` | `report_id FK`, `label`, `amount`, `sort_order` |
| `report_salary_breakdown` | `report_id FK`, `helper_name`, `amount`, `sort_order` |

## Currency Handling
- Amounts stored as **cents** (integers) in Supabase
- `InputCurrency` component: shows PHP format, stores cents
- `formatPeso(value)`: `₱1,234.56` (value is already in peso units)
- `useFormCalc` divides by 100: `Number(row?.amount) / 100`
- `excelExport` also divides by 100: `toNumberSafe` = `Number(value) / 100`

## Excel Export
- 3 template files in `/public/`: `report-template.xlsx`, `Monthly-Report.xlsx`, `Yearly-Report.xlsx`
- `map` object in `excelExport.js` defines cell coordinates for each field
- Special auto-sum logic for Palamig (sums Ice + Water + Palamig group) and Store OTHERS (sums everything in Store group except Big Boy/Aqua)
- Consignment OTHERS is summed by template formula (cell G26)
