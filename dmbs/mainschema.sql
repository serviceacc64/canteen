-- =====================================
-- CANTEEN REPORTING SYSTEM - FULL SETUP
-- =====================================

-- =========================
-- 1. TABLES
-- =========================

CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  canteen VARCHAR(50) NOT NULL,

  total_sales NUMERIC DEFAULT 0,
  total_expenses NUMERIC DEFAULT 0,
  net_profit NUMERIC DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sales_items (
  id SERIAL PRIMARY KEY,
  report_id INT REFERENCES reports(id) ON DELETE CASCADE,

  category VARCHAR(50) NOT NULL,
  amount NUMERIC NOT NULL
);

CREATE TABLE purchase_items (
  id SERIAL PRIMARY KEY,
  report_id INT REFERENCES reports(id) ON DELETE CASCADE,

  category VARCHAR(50) NOT NULL,
  item_name VARCHAR(100) NOT NULL,
  amount NUMERIC NOT NULL
);

CREATE TABLE consignment_items (
  id SERIAL PRIMARY KEY,
  report_id INT REFERENCES reports(id) ON DELETE CASCADE,

  category VARCHAR(50) NOT NULL,
  item_name VARCHAR(100) NOT NULL,
  amount NUMERIC NOT NULL
);

CREATE TABLE operating_expenses (
  id SERIAL PRIMARY KEY,
  report_id INT REFERENCES reports(id) ON DELETE CASCADE,

  type VARCHAR(50) NOT NULL,
  description VARCHAR(100),
  amount NUMERIC NOT NULL
);

CREATE TABLE salaries (
  id SERIAL PRIMARY KEY,
  report_id INT REFERENCES reports(id) ON DELETE CASCADE,

  employee_name VARCHAR(100) NOT NULL,
  amount NUMERIC NOT NULL
);

-- =========================
-- 2. INDEXES
-- =========================

CREATE INDEX idx_reports_date ON reports(date);
CREATE INDEX idx_reports_canteen ON reports(canteen);

CREATE INDEX idx_sales_report ON sales_items(report_id);
CREATE INDEX idx_purchase_report ON purchase_items(report_id);
CREATE INDEX idx_consignment_report ON consignment_items(report_id);
CREATE INDEX idx_expenses_report ON operating_expenses(report_id);
CREATE INDEX idx_salary_report ON salaries(report_id);

-- =========================
-- 3. ENABLE RLS
-- =========================

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE consignment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE operating_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;

-- =========================
-- 4. POLICIES (OPEN ACCESS - FOR SCHOOL PROJECT)
-- =========================

-- REPORTS
CREATE POLICY "Allow all reports"
ON reports
FOR ALL
USING (true)
WITH CHECK (true);

-- SALES
CREATE POLICY "Allow all sales"
ON sales_items
FOR ALL
USING (true)
WITH CHECK (true);

-- PURCHASES
CREATE POLICY "Allow all purchases"
ON purchase_items
FOR ALL
USING (true)
WITH CHECK (true);

-- CONSIGNMENTS
CREATE POLICY "Allow all consignments"
ON consignment_items
FOR ALL
USING (true)
WITH CHECK (true);

-- EXPENSES
CREATE POLICY "Allow all expenses"
ON operating_expenses
FOR ALL
USING (true)
WITH CHECK (true);

-- SALARIES
CREATE POLICY "Allow all salaries"
ON salaries
FOR ALL
USING (true)
WITH CHECK (true);