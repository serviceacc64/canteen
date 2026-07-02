import { useState, useRef, useEffect } from 'react';
import '../../css/UserGuide.css';

const SECTIONS = [
  {
    id: 'create',
    label: 'Creating a Report',
    title: 'Creating a Daily Report',
    steps: [
      <>Navigate to <strong>Create Report</strong> from the sidebar or click <strong>New Session</strong> on the Daily Reports page.</>,
      <>Select a <strong>Canteen Location</strong> (Canteen 1–4) from the dropdown.</>,
      <>Pick the <strong>Report Date</strong> using the date picker.</>,
      <>Fill in <strong>Cash Revenue Streams</strong> — enter amounts for Store, Kitchen, Palamig, and School Supplies. Use the <strong>Add Store Entry</strong>, <strong>Add Kitchen Entry</strong>, <strong>Add Palamig Entry</strong>, or <strong>Add Other Entry</strong> buttons to add rows.</>,
      <>Fill in <strong>Inventory Procurement</strong> — enter your store purchases grouped by category (Store, Kitchen, Palamig, School Supplies).</>,
      <>Fill in <strong>Operational Overhead</strong> — enter expenses like Salary of Helpers, Utility, SSS, LPG, and Others.</>,
      <>Fill in <strong>Workforce Payroll</strong> — type each helper's name and their salary amount.</>,
      <>Fill in <strong>Consignments</strong> — enter supplier names and their consignment amounts.</>,
      <>Check the <strong>Live Performance Audit</strong> bar at the bottom to see running totals (Total Sales, Total Expenses, Net Profit) update in real time.</>,
      <>Click <strong>Save Report</strong> when done. You'll be redirected to the Daily Reports page.</>,
    ],
  },
  {
    id: 'edit',
    label: 'Editing a Report',
    title: 'Editing an Existing Report',
    steps: [
      <>Go to <strong>Daily Reports</strong> from the sidebar.</>,
      <>Find the report you want to edit in the table.</>,
      <>Click the <strong>View</strong> button (eye icon) to open the report details.</>,
      <>On the View Report page, click the <strong>Edit</strong> button in the top-right area.</>,
      <>This opens the report in <strong>edit mode</strong> — all fields are pre-filled with existing data.</>,
      <>Make your changes to any section (Cash Sales, Purchases, Expenses, Payroll, or Consignment).</>,
      <>Click <strong>Save Report</strong> to update the record. You'll return to the Daily Reports page.</>,
    ],
  },
  {
    id: 'daily',
    label: 'Daily Reports',
    title: 'Viewing Daily Reports',
    steps: [
      <>Navigate to <strong>Daily Reports</strong> from the sidebar.</>,
      <>Use the <strong>Date Filter</strong> input to narrow down reports by date.</>,
      <>Toggle between <strong>Individual View</strong> and <strong>Aggregated View</strong> using the toggle buttons. Individual shows each report as a row; Aggregated groups reports by date.</>,
      <>In Individual View, click <strong>View</strong> (eye icon) on any row to see the full report details.</>,
      <>To delete a report, click the <strong>Delete</strong> button (trash icon) and confirm in the popup.</>,
      <>The header shows summary stats for the filtered set: Total Revenue, Total Costs, Net Profit, and Average per Session.</>,
      <>Click <strong>New Session</strong> to create a new report.</>,
    ],
  },
  {
    id: 'monthly-yearly',
    label: 'Monthly & Yearly',
    title: 'Monthly & Yearly Reports',
    steps: [
      <>Go to <strong>Monthly Reports</strong> or <strong>Yearly Reports</strong> from the sidebar.</>,
      <>Browse the cards showing each month/year with its record count, total revenue, costs, and net profit.</>,
      <>Click <strong>View</strong> on a card to open the aggregated view for that period.</>,
      <>The <strong>Monthly View</strong> shows a branch-by-branch breakdown with wages, SSS, supplies, purchases, revenue, and net profit.</>,
      <>The <strong>Yearly View</strong> shows a month-by-month breakdown for the selected year.</>,
      <>To delete all reports in a month/year, click the <strong>Delete</strong> button on the card and confirm.</>,
    ],
  },
  {
    id: 'export',
    label: 'Export to Excel',
    title: 'How to Export a Report',
    steps: [
      <>Go to <strong>Daily Reports</strong>, <strong>Monthly Reports</strong>, or <strong>Yearly Reports</strong> from the sidebar.</>,
      <>Find the report or period you want to export and click <strong>View</strong> to open it.</>,
      <>On the View Report page, look for the <strong>Export</strong> button (download icon) in the top-right corner of the header.</>,
      <>For a <strong>single daily report</strong>, the button says <strong>Excel</strong>. Click it and an <code>.xlsx</code> file will download automatically.</>,
      <>For a <strong>monthly summary</strong>, the button says <strong>Export Excel</strong>. Click it to download the monthly branch breakdown.</>,
      <>For a <strong>yearly summary</strong>, the button also says <strong>Export Excel</strong>. Click it to download the yearly month-by-month report.</>,
      <>The exported file uses a pre-formatted template — all data is mapped to the correct cells, ready for printing or sharing.</>,
      <>If the export fails, you'll see an alert. Simply try again or check your connection.</>,
    ],
  },
];

const UserGuide = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState(SECTIONS[0].id);
  const popupRef = useRef(null);
  const active = SECTIONS.find((s) => s.id === activeTab);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="guide-popup" ref={popupRef}>
      <div className="guide-popup__header">
        <h3 className="guide-popup__title">User Guide</h3>
        <button className="guide-popup__close" onClick={onClose} aria-label="Close guide">
          &times;
        </button>
      </div>
      <div className="guide-tabs" role="tablist">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            className={`guide-tab${activeTab === s.id ? ' active' : ''}`}
            onClick={() => setActiveTab(s.id)}
            role="tab"
            aria-selected={activeTab === s.id}
          >
            {s.label}
          </button>
        ))}
      </div>
      {active && (
        <div className="guide-section" role="tabpanel">
          <h4>{active.title}</h4>
          <ol className="guide-steps">
            {active.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default UserGuide;
