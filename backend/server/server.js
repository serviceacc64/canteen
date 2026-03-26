const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Load environment variables from .env

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..'))); // Serve static files from project root (src/, pages/, index.html)

// 🔑 Supabase config (loaded from env vars)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Basic validation to ensure env vars are set
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials in environment variables. Check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  } // Optional: Recommended for server-side to avoid unnecessary token refreshes
});

// =========================
// CREATE REPORT
// =========================
app.post('/api/reports', async (req, res) => {
  try {
    const {
      date,
      canteen,
      sales,
      purchases,
      consignments,
      expenses,
      salaries
    } = req.body;

    // 1. Insert main report
    const { data: report, error } = await supabase
      .from('reports')
      .insert([{ date, canteen }])
      .select()
      .single();

    if (error) throw error;

    const reportId = report.id;

    // 2. Insert sales
    if (sales?.length) {
      const salesData = sales.map(s => ({
        report_id: reportId,
        category: s.category,
        amount: s.amount
      }));

      await supabase.from('sales_items').insert(salesData);
    }

    // 3. Insert purchases (dynamic items)
    if (purchases?.length) {
      const purchaseData = purchases.map(p => ({
        report_id: reportId,
        category: p.category,
        item_name: p.item_name,
        amount: p.amount
      }));

      await supabase.from('purchase_items').insert(purchaseData);
    }

    // 4. Insert consignments
    if (consignments?.length) {
      const consignmentData = consignments.map(c => ({
        report_id: reportId,
        category: c.category,
        item_name: c.item_name,
        amount: c.amount
      }));

      await supabase.from('consignment_items').insert(consignmentData);
    }

    // 5. Insert expenses
    if (expenses?.length) {
      const expenseData = expenses.map(e => ({
        report_id: reportId,
        type: e.type,
        description: e.description,
        amount: e.amount
      }));

      await supabase.from('operating_expenses').insert(expenseData);
    }

    // 6. Insert salaries
    if (salaries?.length) {
      const salaryData = salaries.map(s => ({
        report_id: reportId,
        employee_name: s.name,
        amount: s.amount
      }));

      await supabase.from('salaries').insert(salaryData);
    }

    res.json({ message: 'Report created', reportId });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// GET ALL REPORTS
// =========================
app.get('/api/reports', async (req, res) => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('date', { ascending: false });

  if (error) return res.status(500).json({ error });

  res.json(data);
});

// =========================
// GET SINGLE REPORT (WITH DETAILS)
// =========================
app.get('/api/reports/:id', async (req, res) => {
  const id = req.params.id;

  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      sales_items (*),
      purchase_items (*),
      consignment_items (*),
      operating_expenses (*),
      salaries (*)
    `)
    .eq('id', id)
    .single();

  if (error) return res.status(500).json({ error });

  res.json(data);
});

// =========================
// UPDATE REPORT (basic)
// =========================
app.put('/api/reports/:id', async (req, res) => {
  const id = req.params.id;
  const { date, canteen } = req.body;

  const { error } = await supabase
    .from('reports')
    .update({ date, canteen })
    .eq('id', id);

  if (error) return res.status(500).json({ error });

  res.json({ message: 'Report updated' });
});

// =========================
// DELETE REPORT (CASCADE)
// =========================
app.delete('/api/reports/:id', async (req, res) => {
  const id = req.params.id;

  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error });

  res.json({ message: 'Report deleted' });
});

// Import entry logic
const entryLogic = require('./logics/entrylogic');

// =========================
// CREATE DAILY ENTRY (New endpoint using entrylogic)
// =========================
app.post('/api/entry', (req, res) => entryLogic.createDailyEntry(req, res, supabase));

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
