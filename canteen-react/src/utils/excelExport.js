import ExcelJS from 'exceljs';

const TEMPLATE_URL = '/report-template.xlsx';

// =========================
// 📌 MAPPING CONFIG
// =========================
const map = {
  meta: {
    date: "F4",
    canteenLocation: "F3",
    remarks: "B48"
  },
  cashSales: {
    STORE: "I7",
    KITCHEN: "I8",
    PALAMIG: "I9",
    "SCHOOL SUPPLIES": "I10"
  },
  storePurchases: {
    "BIG BOY": "I15",
    "AQUA": "I16",
    "OTHERS": "I17",
    "KITCHEN": "I18",
    "PALAMIG": "I19",
    "SCHOOL SUPPLIES": "I20"
  },
  consignmentToSupplier: {
    "BIG BOY": "G24",
    "AQUA": "G25",
    "OTHERS": "G26",
    "KITCHEN": "G27",
    "PALAMIG": "G28",
    "SCHOOL SUPPLIES": "G29",
    "PayableToSupplier": "G30"
  },
  operatingExpenses: {
    "SALARY OF HELPERS": "E36",
    "UTILITY EXPENSES": "E37",
    "SSS OF HELPERS": "E38",
    "LPG": "E39",
    "OTHERS": "E40"
  },
  operatingExpenses: {
    "Salary of Helpers": "E36",
    "Utility Expenses": "E37",
    "SSS of Helpers": "E38",
    "LPG": "E39",
    "Others": "E40"
  },
  salaryBreakdown: {
    "1": "G36",
    "2": "G37",
    "3": "G38",
    "4": "G39",
    "5": "G40",
    "6": "G41",
    "TOTAL": "G42"
  },
  totals: {
    totalSales: "G44",
    totalExpenses: "G45",
    netProfit: "G47"
  }
};

// =========================
// 🛠 HELPER FUNCTIONS
// =========================
const normalize = (str) => str?.toString().trim().toUpperCase() || '';

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const toNumberSafe = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const setNumberCell = (worksheet, cellAddress, value) => {
  const cell = worksheet.getCell(cellAddress);
  cell.value = toNumberSafe(value);
  cell.numFmt = '#,##0.00';
};

const setStringCell = (worksheet, cellAddress, value) => {
  const cell = worksheet.getCell(cellAddress);
  cell.value = value || '';
};

// =========================
// 📌 APPLY TEMPLATE DATA
// =========================
const applyTemplateData = (worksheet, report) => {
  // Meta information
  setStringCell(worksheet, map.meta.date, report.date);
  setStringCell(worksheet, map.meta.canteenLocation, report.canteenLocation);
  setStringCell(worksheet, map.meta.remarks, report.remarks);

// Cash Sales
  (report.cashSalesRows ?? []).forEach((item) => {
    const key = normalize(item.label);
    if (map.cashSales[key]) {
      setNumberCell(worksheet, map.cashSales[key], item.amount);
    }
  });

// Store Purchases - with Palamig auto-sum (Ice + Water + Palamig group)
  // Calculate Palamig total first
  const palamigRows = (report.storePurchaseRows ?? []).filter(item => 
    normalize(item.label) === 'ICE' || 
    normalize(item.label) === 'WATER' || 
    normalize(item.group) === 'PALAMIG'
  );
  const palamigTotal = palamigRows.reduce((sum, item) => sum + toNumberSafe(item.amount), 0);
  setNumberCell(worksheet, map.storePurchases.PALAMIG, palamigTotal);

  // Individual mappings (skip Palamig overwrites)
  (report.storePurchaseRows ?? []).forEach((item) => {
    const key = normalize(item.label);
    if (map.storePurchases[key] && key !== 'PALAMIG') {
      setNumberCell(worksheet, map.storePurchases[key], item.amount);
    }
  });

  // Consignment to Supplier
  let payableTotal = 0;
  (report.storeConsignmentRows ?? []).forEach((item) => {
    const key = normalize(item.label);
    if (map.consignmentToSupplier[key]) {
      setNumberCell(worksheet, map.consignmentToSupplier[key], item.amount);
    }
    payableTotal += toNumberSafe(item.amount); // sum ALL consignment
  });
  setNumberCell(worksheet, map.consignmentToSupplier.PayableToSupplier, payableTotal);

// Operating Expenses - populate individual cells + total
  (report.operatingExpensesRows ?? []).forEach((item) => {
    const key = normalize(item.label);
    if (map.operatingExpenses[key]) {
      setNumberCell(worksheet, map.operatingExpenses[key], item.amount);
    }
  });

  // Keep total computation (unchanged)
  const opExRowsSum = (report.operatingExpensesRows ?? []).reduce((sum, i) => sum + toNumberSafe(i.amount), 0);

  // Salary Breakdown (index-based)
  let salaryTotal = 0;
  (report.salaryBreakdownRows ?? []).slice(0,6).forEach((item, index) => {
    const key = String(index + 1);
    const cellAddress = map.salaryBreakdown[key];
    if (cellAddress) {
      setNumberCell(worksheet, cellAddress, item.amount);
      salaryTotal += toNumberSafe(item.amount);
    }
  });
  setNumberCell(worksheet, map.salaryBreakdown.TOTAL, salaryTotal);

  // Totals (use pre-calculated or compute fallback)
  // Computed totals per spec
  const totalSales = (report.cashSalesRows ?? []).reduce((sum, i) => sum + toNumberSafe(i.amount), 0);

  const opExSum = (report.operatingExpensesRows ?? []).reduce((sum, i) => sum + toNumberSafe(i.amount), 0);

  const totalExpenses = opExSum + payableTotal;

  const netProfit = totalSales - totalExpenses;

  setNumberCell(worksheet, map.totals.totalSales, totalSales);
  setNumberCell(worksheet, map.totals.totalExpenses, totalExpenses);
  setNumberCell(worksheet, map.totals.netProfit, netProfit);
};

// =========================
// 💾 EXPORT FUNCTION
// =========================
export const exportDailyReportToTemplate = async (report) => {
  if (!report) {
    throw new Error('Report is required for export.');
  }

  const workbook = new ExcelJS.Workbook();

  try {
    const response = await fetch(TEMPLATE_URL);
    if (!response.ok) {
      throw new Error('Template not found');
    }

    const arrayBuffer = await response.arrayBuffer();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error('No worksheet found in template');
    }

    applyTemplateData(worksheet, report);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const fileName = `Daily-Report-${report.date || 'export'}.xlsx`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error('Unable to export report. Ensure the template file is in public/report-template.xlsx');
  }
};
