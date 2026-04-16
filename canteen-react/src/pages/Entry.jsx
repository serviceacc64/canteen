import { useState } from 'react';
import Button from '../components/common/Button';
import InputCurrency from '../components/common/InputCurrency';
import { formatPeso } from '../utils/format';
import { validateEntryMeta } from '../utils/validation';
import useFormCalc from '../hooks/useFormCalc';
import useReports from '../hooks/useReports';
import '../css/Entry.css';

const createRow = (label = '', amount = 0) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  label,
  amount,
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

  const [storePurchaseRows, setStorePurchaseRows] = useState([createRow('Store Purchase', 0)]);
  const [storeConsignmentRows, setStoreConsignmentRows] = useState([
    createRow('Big Boy', 0),
    createRow('Aqua', 0),
    createRow('MSA', 0),
  ]);

  const { createOrUpdateReport } = useReports();

  const totals = useFormCalc({
    cashSalesRows,
    storePurchaseRows,
    storeConsignmentRows,
  });

  const addRow = (setter, defaultLabel) => {
    setter((prev) => [...prev, createRow(defaultLabel, 0)]);
  };

  const removeRow = (setter, id) => {
    setter((prev) => prev.filter((row) => row.id !== id));
  };

  const updateRow = (setter, id, key, value) => {
    setter((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)),
    );
  };

  const onSave = (event) => {
    event.preventDefault();
    const meta = validateEntryMeta({ canteenLocation, date });

    if (!meta.valid) return;

    createOrUpdateReport({
      id: `${date}-${canteenLocation}`,
      date,
      canteenLocation,
      cashSalesRows,
      storePurchaseRows,
      storeConsignmentRows,
      totals,
      updatedAt: new Date().toISOString(),
    });

    setSaveMessage('Entry saved successfully.');
  };

  return (
    <div className="page entry-page">
      <div className="container">
        <header className="page-header">
          <div>
            <h1>New Daily Entry</h1>
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
                <h3 className="section-title">Store Purchases</h3>
                {storePurchaseRows.map((row) => (
                  <div className="input-row" key={row.id}>
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
                ))}
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

          <div className="form-actions">
            <Button variant="secondary" type="button">Cancel</Button>
            <Button variant="primary" type="submit">Save Entry</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Entry;
