/**
 * Entry Logic Module - Handles daily entry creation
 * Separates business logic from main server.js
 */

async function createDailyEntry(req, res, supabase) {
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

    // Validation
    if (!date || !canteen) {
      return res.status(400).json({ error: 'Date and canteen required' });
    }

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
        amount: parseFloat(s.amount)
      }));

      await supabase.from('sales_items').insert(salesData);
    }

    // 3. Insert purchases
    if (purchases?.length) {
      const purchaseData = purchases.map(p => ({
        report_id: reportId,
        category: p.category,
        item_name: p.item_name,
        amount: parseFloat(p.amount)
      }));

      await supabase.from('purchase_items').insert(purchaseData);
    }

    // 4. Insert consignments
    if (consignments?.length) {
      const consignmentData = consignments.map(c => ({
        report_id: reportId,
        category: c.category,
        item_name: c.item_name,
        amount: parseFloat(c.amount)
      }));

      await supabase.from('consignment_items').insert(consignmentData);
    }

    // 5. Insert expenses
    if (expenses?.length) {
      const expenseData = expenses.map(e => ({
        report_id: reportId,
        type: e.type,
        description: e.description,
        amount: parseFloat(e.amount)
      }));

      await supabase.from('operating_expenses').insert(expenseData);
    }

    // 6. Insert salaries
    if (salaries?.length) {
      const salaryData = salaries.map(s => ({
        report_id: reportId,
        employee_name: s.name,
        amount: parseFloat(s.amount)
      }));

      await supabase.from('salaries').insert(salaryData);
    }

    // Optional: Update totals in reports (computed query-side or trigger)
    res.json({ 
      success: true, 
      message: 'Daily entry created successfully', 
      reportId 
    });

  } catch (err) {
    console.error('Entry creation error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createDailyEntry };

