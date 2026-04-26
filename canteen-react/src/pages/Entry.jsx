import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../components/common/Button';
import InputCurrency from '../components/common/InputCurrency';
import { formatPeso } from '../utils/format';
import { validateEntryMeta } from '../utils/validation';
import { getReportById } from '../services/reportsApi';
import useFormCalc from '../hooks/useFormCalc';
import useReports from '../hooks/useReports';
import '../css/Entry.css';

const createRow = (label = '', amount = 0, group = '') => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  label,
  amount,
  group,
});

const Entry = () => {
  const [canteenLocation, setCanteenLocation] = useState('Canteen 1');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saveMessage, setSaveMessage] = useState('');

  const [cashSalesRows, setCashSalesRows] = useState([
    createRow('Store', 0),
    createRow('Kitchen', 0),
    createRow('Palamig', 0),
    createRow('School Supplies', 0),
  ]);

  const [storePurchaseRows, setStorePurchaseRows] = useState([
    createRow('Big Boy', 0, 'Store'),
    createRow('Aqua', 0, 'Store'),
    createRow('Kitchen', 0, 'Kitchen'),
    createRow('Ice', 0, 'Palamig'),
    createRow('Water', 0, 'Palamig'),
    createRow('School Supplies', 0, 'School Supplies'),
  ]);
  const [storeConsignmentRows, setStoreConsignmentRows] = useState([
    createRow('Big Boy', 0),
    createRow('Aqua', 0),
   
  ]);
  const [operatingExpensesRows, setOperatingExpensesRows] = useState([
    createRow('Salary of Helpers', 0),
    createRow('Utility Expenses', 0),
    createRow('SSS of Helpers', 0),
    createRow('LPG', 0),
    createRow('Others', 0),
  ]);
  const [salaryBreakdownRows, setSalaryBreakdownRows] = useState([createRow('Name', 0)]);
  const [remarks, setRemarks] = useState('');

  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [editMode, setEditMode] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const { createOrUpdateReport } = useReports();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!editId) {
      setEditMode(false);
      return;
    }

    const loadReport = async () => {
      setEditLoading(true);
      setEditError(null);
      try {
        const report = await getReportById(editId);
        setCanteenLocation(report.canteenLocation || 'Canteen 1');
        setDate(report.date || new Date().toISOString().slice(0, 10));
        setRemarks(report.remarks || '');
        setCashSalesRows(report.cashSalesRows || []);
        setStorePurchaseRows(report.storePurchaseRows || []);
        setStoreConsignmentRows(report.storeConsignmentRows || []);
        setOperatingExpensesRows(report.operatingExpensesRows || []);
        setSalaryBreakdownRows(report.salaryBreakdownRows || []);
        setEditMode(true);
      } catch {
        setEditError('Failed to load report for editing.');
      } finally {
        setEditLoading(false);
      }
    };

    loadReport();
  }, [editId]);

  const totals = useFormCalc({
    cashSalesRows,
    storePurchaseRows,
    storeConsignmentRows,
    operatingExpensesRows,
    salaryBreakdownRows,
  });

  const addRow = (setter, defaultLabel) => {
    setter((prev) => [...prev, createRow(defaultLabel, 0)]);
  };

  const addStoreRow = () => {
    const newRow = createRow('New Store Item', 0, 'Store');
    const lastStoreIndex = storePurchaseRows.reduce((last, row, i) => 
      row.group === 'Store' ? i : last, -1);
    setStorePurchaseRows(prev => {
      const newRows = [...prev];
      if (lastStoreIndex >= 0) {
        newRows.splice(lastStoreIndex + 1, 0, newRow);
      } else {
        newRows.push(newRow);
      }
      return newRows;
    });
  };

  const removeRow = (setter, id) => {
    setter((prev) => prev.filter((row) => row.id !== id));
  };

  const updateRow = (setter, id, key, value) => {
    setter((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)),
    );
  };

  const onSave = async (event) => {
    event.preventDefault();
    const meta = validateEntryMeta({ canteenLocation, date });

    if (!meta.valid) return;

    setSaving(true);
    setSaveError('');

    try {
      await createOrUpdateReport({
        date,
        canteenLocation,
        cashSalesRows,
        storePurchaseRows,
        storeConsignmentRows,
        operatingExpensesRows,
        salaryBreakdownRows,
        remarks,
        totals,
        updatedAt: new Date().toISOString(),
      });

      setSaveMessage('Entry saved successfully.');
      } catch {
        setSaveError('Unable to save entry. Please try again.');
      } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page entry-page">
      <div className="container">
        <header className="page-header">
          <div>
            <h1>{editMode ? 'Edit Daily Entry' : 'New Daily Entry'}</h1>
            <p className="subtitle">Daily Canteen Report of Canteen Operation</p>
          </div>
        </header>

        <form className="daily-entry-form" onSubmit={onSave}>
          <div className="top-fields">
            <div className="field-group">
              <label htmlFor="canteenLocation" className="label">Canteen Location</label>
              <select
                id="canteenLocation"
                value={canteenLocation}
                onChange={(e) => setCanteenLocation(e.target.value)}
              >
                <option>Canteen 1</option>
                <option>Canteen 2</option>
                <option>Canteen 3</option>
                <option>Canteen 4</option>
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="date" className="label">Date</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="main-content">
            <div className="left-column">
              <section className="section">
                <h3 className="section-title">Cash Sales</h3>
                {cashSalesRows.map((row) => (
                  <div className="input-row" key={row.id}>
                    <input
                      type="text"
                      value={row.label}
                      onChange={(e) => updateRow(setCashSalesRows, row.id, 'label', e.target.value)}
                    />
                    <InputCurrency
                      value={row.amount}
                      onChange={(e) => updateRow(setCashSalesRows, row.id, 'amount', e.target.value)}
                    />
                    <Button variant="danger" onClick={() => removeRow(setCashSalesRows, row.id)}>Delete</Button>
                  </div>
                ))}
                <Button variant="secondary" onClick={() => addRow(setCashSalesRows, 'New Sale')}>Add Entry</Button>
                <div className="highlight-row">
                  <span>TOTAL CASH SALES</span>
                  <span>{formatPeso(totals.totalSales)}</span>
                </div>
              </section>

              <section className="section">
                <h3 className="section-title">Less Purchases (Cash Purchases)</h3>
                {storePurchaseRows.map((row, index) => {
                  const showGroup = row.group && (index === 0 || row.group !== storePurchaseRows[index - 1].group);
                  return (
                    <div key={row.id}>
{showGroup && <div className="group-label">{row.group}</div>}
                      <div className="input-row">
                        <input
                          type="text"
                          value={row.label}
                          onChange={(e) => updateRow(setStorePurchaseRows, row.id, 'label', e.target.value)}
                        />
                        <InputCurrency
                          value={row.amount}
                          onChange={(e) => updateRow(setStorePurchaseRows, row.id, 'amount', e.target.value)}
                        />
                        <Button variant="danger" onClick={() => removeRow(setStorePurchaseRows, row.id)}>Delete</Button>
                      </div>
                      {row.group === 'Store' && index === storePurchaseRows.reduce((last, r, i) => r.group === 'Store' ? i : last, -1) && (
                        <div className="group-add-row" style={{ display: 'flex', justifyContent: 'start', margin: '4px 0', gap: '8px' }}>
                          <Button 
                            variant="secondary" 
                            onClick={addStoreRow}
                          >
                            + Add Store Item
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
                <Button variant="secondary" onClick={() => addRow(setStorePurchaseRows, 'New Purchase')}>Add Entry</Button>
                <div className="highlight-total">
                  <span>TOTAL CASH PURCHASES</span>
                  <span>{formatPeso(totals.totalCashPurchases)}</span>
                </div>
              </section>

              <section className="section">
                <h3 className="section-title">Consignment to Supplier</h3>
                {storeConsignmentRows.map((row) => (
                  <div className="input-row" key={row.id}>
                    <input
                      type="text"
                      value={row.label}
                      onChange={(e) => updateRow(setStoreConsignmentRows, row.id, 'label', e.target.value)}
                    />
                    <InputCurrency
                      value={row.amount}
                      onChange={(e) => updateRow(setStoreConsignmentRows, row.id, 'amount', e.target.value)}
                    />
                    <Button variant="danger" onClick={() => removeRow(setStoreConsignmentRows, row.id)}>Delete</Button>
                  </div>
                ))}
                <Button variant="secondary" onClick={() => addRow(setStoreConsignmentRows, 'New Supplier')}>Add Entry</Button>
                <div className="payable-summary">
                  <span>Payable to Supplier</span>
                  <span>{formatPeso(totals.payableToSupplier)}</span>
                </div>
              </section>
            </div>

            <div className="right-column">
              <section className="section">
                <h3 className="section-title">Summary of Operating Expenses</h3>
                {operatingExpensesRows.map((row) => (
                  <div className="input-row" key={row.id}>
                    <input
                      type="text"
                      value={row.label}
                      onChange={(e) => updateRow(setOperatingExpensesRows, row.id, 'label', e.target.value)}
                    />
                    <InputCurrency
                      value={row.amount}
                      onChange={(e) => updateRow(setOperatingExpensesRows, row.id, 'amount', e.target.value)}
                    />
                    <Button variant="danger" onClick={() => removeRow(setOperatingExpensesRows, row.id)}>Delete</Button>
                  </div>
                ))}
                <Button variant="secondary" onClick={() => addRow(setOperatingExpensesRows, 'New Expense')}>Add Entry</Button>
                <div className="highlight-row">
                  <span>TOTAL OPERATING EXPENSES</span>
                  <span>{formatPeso(totals.totalOperatingExpenses)}</span>
                </div>
              </section>

              <section className="section">
                <h3 className="section-title">Salary Breakdown</h3>
                {salaryBreakdownRows.map((row) => (
                  <div className="input-row" key={row.id}>
                    <input
                      type="text"
                      value={row.label}
                      onChange={(e) => updateRow(setSalaryBreakdownRows, row.id, 'label', e.target.value)}
                      placeholder="Name"
                    />
                    <InputCurrency
                      value={row.amount}
                      onChange={(e) => updateRow(setSalaryBreakdownRows, row.id, 'amount', e.target.value)}
                    />
                    <Button variant="danger" onClick={() => removeRow(setSalaryBreakdownRows, row.id)}>Delete</Button>
                  </div>
                ))}
                <Button variant="secondary" onClick={() => addRow(setSalaryBreakdownRows, 'Name')}>Add helper</Button>
                <div className="highlight-row">
                  <span>Breakdown Total</span>
                  <span>{formatPeso(totals.salaryBreakdownTotal)}</span>
                </div>
              </section>

              <section className="section">
                <h3 className="section-title">Remarks</h3>
                <textarea
                  className="remarks-textarea"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Optional remarks..."
                />
              </section>

              <section className="section summary">
                <div className="summary-header">
                  <strong>Summary</strong>
                </div>
                <div className="summary-row">
                  <span>Total Sales</span>
                  <span>{formatPeso(totals.totalSales)}</span>
                </div>
                <div className="summary-row">
                  <span>Total Expenses</span>
                  
                  <span>{formatPeso(totals.totalExpenses)}</span>
                </div>
                <div className="summary-row net-profit">
                  <span>Net Profit</span>
                  <span className="highlight-green">{formatPeso(totals.netProfit)}</span>
                </div>
              </section>
            </div>
          </div>

{saveMessage && <p className="save-message">{saveMessage}</p>}
          {saveError && <p className="error-message">{saveError}</p>}
          {editLoading && <p className="save-message">Loading report for editing...</p>}
          {editError && <p className="error-message">{editError}</p>}

          <div className="form-actions">
            {editMode ? (
              <>
                <Button variant="secondary" type="button" onClick={() => window.history.back() || (window.location.href = '/daily')}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={saving}>
                  {saving ? 'Updating...' : 'Update Entry'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" type="button">Cancel</Button>
                <Button variant="primary" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Entry'}
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Entry;