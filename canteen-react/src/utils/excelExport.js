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
  },
  operatingExpenses: {

    "SALARY OF HELPERS": "E36",
    "UTILITY EXPENSES": "E37",
    "SSS OF HELPERS": "E38",
    "LPG": "E39",
    "OTHERS": "E40"
  },

  salaryBreakdown: {
    name1: "G36", amount1: "I36",
    name2: "G37", amount2: "I37",
    name3: "G38", amount3: "I38",
    name4: "G39", amount4: "I39",
    name5: "G40", amount5: "I40",
    name6: "G41", amount6: "I41"
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
  const n = Number(value) / 100;
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

// Store Purchases - with Palamig + Store OTHERS auto-sum
  // 1. PALAMIG auto-sum (Ice + Water + Palamig group)
  const palamigRows = (report.storePurchaseRows ?? []).filter(item => 
    normalize(item.label) === 'ICE' || 
    normalize(item.label) === 'WATER' || 
    normalize(item.group) === 'PALAMIG'
  );
  const palamigTotal = palamigRows.reduce((sum, item) => sum + Number(item.amount), 0);
  setNumberCell(worksheet, map.storePurchases.PALAMIG, palamigTotal);

  // 2. STORE OTHERS I17 = sum(ALL Store group *except* BIG BOY/AQUA)
  const storeOthersRows = (report.storePurchaseRows ?? []).filter(item => 
    item.group === 'Store' && 
    normalize(item.label) !== 'BIG BOY' && 
    normalize(item.label) !== 'AQUA'
  );
  const storeOthersTotal = storeOthersRows.reduce((sum, item) => sum + Number(item.amount), 0);
  setNumberCell(worksheet, map.storePurchases["OTHERS"], storeOthersTotal);

  // 3. Individual mappings (skip auto-summed)
  (report.storePurchaseRows ?? []).forEach((item) => {
    const key = normalize(item.label);
    if (map.storePurchases[key] && key !== 'PALAMIG' && key !== 'OTHERS') {
      setNumberCell(worksheet, map.storePurchases[key], item.amount);
    }
  });



  // Consignment to Supplier data; template handles subtotals/totals
  (report.storeConsignmentRows ?? []).forEach((item) => {
    const key = normalize(item.label);
    if (map.consignmentToSupplier[key] && key !== 'OTHERS' && key !== 'PayableToSupplier') {
      setNumberCell(worksheet, map.consignmentToSupplier[key], item.amount);
    }
  });
  // Template handles OTHERS G26, Payable G30


// Operating Expenses - populate individual cells + total
  (report.operatingExpensesRows ?? []).forEach((item) => {
    const key = normalize(item.label);
    if (map.operatingExpenses[key]) {
      setNumberCell(worksheet, map.operatingExpenses[key], item.amount);
    }
  });

  // Operating Expenses data populated; template handles totals


  // Salary Breakdown (index-based)
  (report.salaryBreakdownRows ?? []).slice(0,6).forEach((item, index) => {
    const idx = index + 1;
    const nameKey = `name${idx}`;
    const amountKey = `amount${idx}`;
    if (map.salaryBreakdown[nameKey]) {
      setStringCell(worksheet, map.salaryBreakdown[nameKey], item.label);
    }
    if (map.salaryBreakdown[amountKey]) {
      setNumberCell(worksheet, map.salaryBreakdown[amountKey], item.amount);
    }
  });
  // Template handles I42 total



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
