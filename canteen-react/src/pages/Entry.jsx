import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Plus,
  ChevronLeft,
  Save,
  Trash2,
  Info,
  CreditCard,
  ShoppingCart,
  Package,
  Activity,
  Users,
  MessageSquare,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import Button from "../components/common/Button";
import InputCurrency from "../components/common/InputCurrency";
import { formatPeso } from "../utils/format";
import { validateEntryMeta } from "../utils/validation";
import { getReportById } from "../services/reportsApi";
import useFormCalc from "../hooks/useFormCalc";
import useReports from "../hooks/useReports";
import "../css/Entry.css";

const createRow = (label = "", amount = 0, group = "") => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  label,
  amount,
  group,
});

const Entry = () => {
  const navigate = useNavigate();
  const [canteenLocation, setCanteenLocation] = useState("Canteen 1");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saveMessage, setSaveMessage] = useState("");

  const [cashSalesRows, setCashSalesRows] = useState([
    createRow("Store", 0),
    createRow("Kitchen", 0),
    createRow("Palamig", 0),
    createRow("School Supplies", 0),
  ]);

  const [storePurchaseRows, setStorePurchaseRows] = useState([
    createRow("Big Boy", 0, "Store"),
    createRow("Aqua", 0, "Store"),
    createRow("Kitchen", 0, "Kitchen"),
    createRow("Palamig", 0, "Palamig"),
    createRow("Ice", 0, "Palamig"),
    createRow("Water", 0, "Palamig"),
    createRow("School Supplies", 0, "School Supplies"),
  ]);
  const [storeConsignmentRows, setStoreConsignmentRows] = useState([
    createRow("Big Boy", 0),
    createRow("Aqua", 0),
  ]);
  const [operatingExpensesRows, setOperatingExpensesRows] = useState([
    createRow("Salary of Helpers", 0),
    createRow("Utility Expenses", 0),
    createRow("SSS of Helpers", 0),
    createRow("LPG", 0),
    createRow("Others", 0),
  ]);
  const [salaryBreakdownRows, setSalaryBreakdownRows] = useState([
    createRow("Name", 0),
  ]);
  const [remarks, setRemarks] = useState("");

  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const [editMode, setEditMode] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const { createOrUpdateReport } = useReports();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

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
        setCanteenLocation(report.canteenLocation || "Canteen 1");
        setDate(report.date || new Date().toISOString().slice(0, 10));
        setRemarks(report.remarks || "");
        setCashSalesRows(report.cashSalesRows || []);
        setStorePurchaseRows(report.storePurchaseRows || []);
        setStoreConsignmentRows(report.storeConsignmentRows || []);
        setOperatingExpensesRows(report.operatingExpensesRows || []);
        setSalaryBreakdownRows(report.salaryBreakdownRows || []);
        setEditMode(true);
      } catch {
        setEditError("Failed to load report for editing.");
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
    const newRow = createRow("New Store Item", 0, "Store");
    const lastStoreIndex = storePurchaseRows.reduce(
      (last, row, i) => (row.group === "Store" ? i : last),
      -1,
    );
    setStorePurchaseRows((prev) => {
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
    setSaveError("");

    try {
      await createOrUpdateReport({
        ...(editId ? { id: editId } : {}),
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

      setSaveMessage("Statement recorded successfully.");
      setTimeout(() => navigate("/daily"), 1500);
    } catch {
      setSaveError("Transaction processing failed. Please retry.");
    } finally {
      setSaving(false);
    }
  };

  if (editLoading) {
    return (
      <div className="page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Syncing report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page entry-page">
      <header className="page-header">
        <div className="page-header__left">
          <button onClick={() => navigate(-1)} className="btn-back">
            <ChevronLeft size={20} />
          </button>
          <div className="page-header__main">
            <h1 className="page-header__title">
              {editMode ? "Refine Transaction" : "Record New Session"}
            </h1>
            <p className="page-header__subtitle">
              Precision accounting for canteen operations
            </p>
          </div>
        </div>

        <div className="page-header__actions">
          <Button variant="secondary" onClick={() => navigate("/daily")}>
            Discard
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            disabled={saving}
            className="btn-save"
          >
            <Save size={18} />
            <span>
              {saving
                ? "Processing..."
                : editMode
                  ? "Sync Changes"
                  : "Commit Session"}
            </span>
          </Button>
        </div>
      </header>

      <form className="entry-grid" onSubmit={onSave}>
        <div className="entry-main">
          {/* Metadata Section */}
          <section className="form-card metadata-card">
            <div className="form-card__header">
              <Info size={18} />
              <h3>Session Details</h3>
            </div>
            <div className="form-card__body grid-2">
              <div className="form-group">
                <label>Operational Unit</label>
                <select
                  value={canteenLocation}
                  onChange={(e) => setCanteenLocation(e.target.value)}
                  className="form-select"
                >
                  <option>Canteen 1</option>
                  <option>Canteen 2</option>
                  <option>Canteen 3</option>
                  <option>Canteen 4</option>
                </select>
              </div>
              <div className="form-group">
                <label>Statement Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </section>

          {/* Cash Sales Section */}
          <section className="form-card">
            <div className="form-card__header">
              <CreditCard size={18} />
              <h3>Cash Revenue Streams</h3>
            </div>
            <div className="form-card__body">
              <div className="entry-rows">
                {cashSalesRows.map((row) => (
                  <div className="entry-row" key={row.id}>
                    <input
                      type="text"
                      className="form-input"
                      value={row.label}
                      onChange={(e) =>
                        updateRow(
                          setCashSalesRows,
                          row.id,
                          "label",
                          e.target.value,
                        )
                      }
                      placeholder="Source description"
                    />
                    <InputCurrency
                      value={row.amount}
                      onChange={(e) =>
                        updateRow(
                          setCashSalesRows,
                          row.id,
                          "amount",
                          e.target.value,
                        )
                      }
                    />
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeRow(setCashSalesRows, row.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn-add"
                onClick={() => addRow(setCashSalesRows, "New Sale")}
              >
                <Plus size={16} />
                <span>Add Revenue Stream</span>
              </button>
            </div>
            <div className="form-card__footer">
              <span>Section Total</span>
              <strong>{formatPeso(totals.totalSales)}</strong>
            </div>
          </section>

          {/* Store Purchase Section */}
          <section className="form-card">
            <div className="form-card__header">
              <ShoppingCart size={18} />
              <h3>Inventory Procurement</h3>
            </div>
            <div className="form-card__body">
              <div className="entry-rows">
                {storePurchaseRows.map((row, index) => {
                  const showGroup =
                    row.group &&
                    (index === 0 ||
                      row.group !== storePurchaseRows[index - 1].group);
                  return (
                    <div key={row.id} className="entry-row-wrapper">
                      {showGroup && (
                        <div className="row-group-tag">{row.group}</div>
                      )}
                      <div className="entry-row">
                        <input
                          type="text"
                          className="form-input"
                          value={row.label}
                          onChange={(e) =>
                            updateRow(
                              setStorePurchaseRows,
                              row.id,
                              "label",
                              e.target.value,
                            )
                          }
                        />
                        <InputCurrency
                          value={row.amount}
                          onChange={(e) =>
                            updateRow(
                              setStorePurchaseRows,
                              row.id,
                              "amount",
                              e.target.value,
                            )
                          }
                        />
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() =>
                            removeRow(setStorePurchaseRows, row.id)
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {row.group === "Store" &&
                        index ===
                          storePurchaseRows.reduce(
                            (last, r, i) => (r.group === "Store" ? i : last),
                            -1,
                          ) && (
                          <button
                            type="button"
                            className="btn-add btn-add--inline"
                            onClick={addStoreRow}
                          >
                            <Plus size={14} />
                            <span>Add Store Item</span>
                          </button>
                        )}
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                className="btn-add"
                onClick={() => addRow(setStorePurchaseRows, "New Purchase")}
              >
                <Plus size={16} />
                <span>Add General Purchase</span>
              </button>
            </div>
            <div className="form-card__footer">
              <span>Procurement Total</span>
              <strong>{formatPeso(totals.totalCashPurchases)}</strong>
            </div>
          </section>

          {/* Operating Expenses */}
          <section className="form-card">
            <div className="form-card__header">
              <Activity size={18} />
              <h3>Operational Overhead</h3>
            </div>
            <div className="form-card__body">
              <div className="entry-rows">
                {operatingExpensesRows.map((row) => (
                  <div className="entry-row" key={row.id}>
                    <input
                      type="text"
                      className="form-input"
                      value={row.label}
                      onChange={(e) =>
                        updateRow(
                          setOperatingExpensesRows,
                          row.id,
                          "label",
                          e.target.value,
                        )
                      }
                    />
                    <InputCurrency
                      value={row.amount}
                      onChange={(e) =>
                        updateRow(
                          setOperatingExpensesRows,
                          row.id,
                          "amount",
                          e.target.value,
                        )
                      }
                    />
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() =>
                        removeRow(setOperatingExpensesRows, row.id)
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn-add"
                onClick={() => addRow(setOperatingExpensesRows, "New Expense")}
              >
                <Plus size={16} />
                <span>Add Expense Item</span>
              </button>
            </div>
            <div className="form-card__footer">
              <span>Overhead Total</span>
              <strong>{formatPeso(totals.totalOperatingExpenses)}</strong>
            </div>
          </section>
        </div>

        <aside className="entry-sidebar">

          {/* Secondary Sections */}
          <section className="form-card">
            <div className="form-card__header">
              <Users size={18} />
              <h3>Workforce Payroll</h3>
            </div>
            <div className="form-card__body">
              <div className="entry-rows">
                {salaryBreakdownRows.map((row) => (
                  <div className="entry-row" key={row.id}>
                    <input
                      type="text"
                      className="form-input"
                      value={row.label}
                      onChange={(e) =>
                        updateRow(
                          setSalaryBreakdownRows,
                          row.id,
                          "label",
                          e.target.value,
                        )
                      }
                      placeholder="Staff name"
                    />
                    <InputCurrency
                      value={row.amount}
                      onChange={(e) =>
                        updateRow(
                          setSalaryBreakdownRows,
                          row.id,
                          "amount",
                          e.target.value,
                        )
                      }
                    />
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeRow(setSalaryBreakdownRows, row.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn-add"
                onClick={() => addRow(setSalaryBreakdownRows, "Name")}
              >
                <Plus size={16} />
                <span>Add Staff</span>
              </button>
            </div>
          </section>

          <section className="form-card">
            <div className="form-card__header">
              <Package size={18} />
              <h3>Consignments</h3>
            </div>
            <div className="form-card__body">
              <div className="entry-rows">
                {storeConsignmentRows.map((row) => (
                  <div className="entry-row" key={row.id}>
                    <input
                      type="text"
                      className="form-input"
                      value={row.label}
                      onChange={(e) =>
                        updateRow(
                          setStoreConsignmentRows,
                          row.id,
                          "label",
                          e.target.value,
                        )
                      }
                      placeholder="Supplier"
                    />
                    <InputCurrency
                      value={row.amount}
                      onChange={(e) =>
                        updateRow(
                          setStoreConsignmentRows,
                          row.id,
                          "amount",
                          e.target.value,
                        )
                      }
                    />
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeRow(setStoreConsignmentRows, row.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn-add"
                onClick={() => addRow(setStoreConsignmentRows, "New Supplier")}
              >
                <Plus size={16} />
                <span>Add Supplier</span>
              </button>
            </div>
          </section>

          <section className="form-card">
            <div className="form-card__header">
              <MessageSquare size={18} />
              <h3>Audit Remarks</h3>
            </div>
            <div className="form-card__body">
              <textarea
                className="form-textarea"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Internal notes regarding this session..."
              />
            </div>
          </section>
        </aside>
      </form>

      {/* Live Performance Audit Summary */}
      <section className="summary-card-bottom">
        <div className="summary-card-bottom__header">
          <div className="summary-card-bottom__title-group">
            <Activity size={20} />
            <h3>Live Performance Audit</h3>
            <div className="live-tag">
              <span className="dot"></span>
              LIVE
            </div>
          </div>
        </div>
        <div className="summary-card-bottom__body">
          <div className="summary-grid">
            <div className="summary-stat">
              <span className="summary-stat__label">Total Revenue</span>
              <span className="summary-stat__value text-success">
                {formatPeso(totals.totalSales)}
              </span>
            </div>
            <div className="summary-stat">
              <span className="summary-stat__label">Operational Costs</span>
              <span className="summary-stat__value text-danger">
                {formatPeso(totals.totalExpenses)}
              </span>
            </div>
            <div className="summary-stat summary-stat--highlight">
              <span className="summary-stat__label">Projected Net Performance</span>
              <span className="summary-stat__value">
                {formatPeso(totals.netProfit)}
              </span>
            </div>
          </div>
          <div className="summary-card-bottom__actions">
            <Button
              variant="primary"
              onClick={onSave}
              disabled={saving}
              className="btn-commit-full"
            >
              <Save size={18} />
              <span>{saving ? "Processing..." : "Commit Transaction"}</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <div className="form-notifications">
        {saveMessage && (
          <div className="notification notification--success">
            <ShieldCheck size={18} />
            <span>{saveMessage}</span>
          </div>
        )}
        {saveError && (
          <div className="notification notification--error">
            <AlertCircle size={18} />
            <span>{saveError}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Entry;
