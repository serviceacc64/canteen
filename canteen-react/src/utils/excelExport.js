import ExcelJS from 'exceljs';

const TEMPLATE_URL = '/report-template.xlsx';
const MONTHLY_TEMPLATE_URL = '/Monthly-Report.xlsx';
const YEARLY_TEMPLATE_URL = '/Yearly-Report.xlsx';

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
    name6: "G41", amount6: "I41",
    name7: "G42", amount7: "I42"
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
  (report.salaryBreakdownRows ?? []).slice(0, 7).forEach((item, index) => {
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

export const exportMonthlyCanteenSummaryToExcel = async ({ month, rows }) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Monthly Summary');

  worksheet.columns = [
    { header: 'Canteen', key: 'canteen', width: 18 },
    { header: 'Wages', key: 'wages', width: 14, style: { numFmt: '#,##0.00' } },
    { header: 'SSS', key: 'sss', width: 14, style: { numFmt: '#,##0.00' } },
    { header: 'Store Supplies', key: 'storeSupplies', width: 18, style: { numFmt: '#,##0.00' } },
    { header: 'Purchases', key: 'purchases', width: 14, style: { numFmt: '#,##0.00' } },
    { header: 'Total Expenses', key: 'totalExpenses', width: 16, style: { numFmt: '#,##0.00' } },
    { header: 'Gross Sales', key: 'grossSales', width: 14, style: { numFmt: '#,##0.00' } },
    { header: 'Net Sales', key: 'netSales', width: 14, style: { numFmt: '#,##0.00' } },
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  (rows ?? []).forEach((row) => {
    worksheet.addRow({
      canteen: row?.canteen ?? '',
      wages: toNumber(row?.wages),
      sss: toNumber(row?.sss),
      storeSupplies: toNumber(row?.storeSupplies),
      purchases: toNumber(row?.purchases),
      totalExpenses: toNumber(row?.totalExpenses),
      grossSales: toNumber(row?.grossSales),
      netSales: toNumber(row?.netSales),
    });
  });

  const totals = (rows ?? []).reduce(
    (acc, r) => ({
      wages: acc.wages + toNumber(r?.wages),
      sss: acc.sss + toNumber(r?.sss),
      storeSupplies: acc.storeSupplies + toNumber(r?.storeSupplies),
      purchases: acc.purchases + toNumber(r?.purchases),
      totalExpenses: acc.totalExpenses + toNumber(r?.totalExpenses),
      grossSales: acc.grossSales + toNumber(r?.grossSales),
      netSales: acc.netSales + toNumber(r?.netSales),
    }),
    { wages: 0, sss: 0, storeSupplies: 0, purchases: 0, totalExpenses: 0, grossSales: 0, netSales: 0 },
  );

  const totalRow = worksheet.addRow({
    canteen: 'Total',
    ...totals,
  });
  totalRow.font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const fileName = `Monthly-Summary-${month || 'export'}.xlsx`;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

export const exportMonthlyReportToTemplate = async ({ month, rows }) => {
  const workbook = new ExcelJS.Workbook();

  // You can adjust these mappings later to match the template exactly.
  const monthlyMap = {
    meta: {
      // "For the Period of NOVEMBER 2025" (merged cell area in template)
      period: 'F6',
    },
    table: {
      // Header row is 10; canteen rows start at 11
      startRow: 11,
      columns: {
        canteen: 'A',
        wages: 'B',
        sss: 'C',
        // Template has "Office Supplies" in D and "Store Supplies" in E
        storeSupplies: 'E',
        // Purchases column in template
        purchases: 'J',
        // Gross Sales column in template
        grossSales: 'M',
      },
    },
  };

  try {
    const response = await fetch(MONTHLY_TEMPLATE_URL);
    if (!response.ok) throw new Error('Template not found');

    const arrayBuffer = await response.arrayBuffer();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) throw new Error('No worksheet found in template');

    // Meta
    setStringCell(worksheet, monthlyMap.meta.period, month || '');

    // Table
    const startRow = monthlyMap.table.startRow;
    const cols = monthlyMap.table.columns;

    (rows ?? []).forEach((row, index) => {
      const r = startRow + index;

      const canteenLabel = String(row?.canteen ?? '')
        .replace(/^canteen\s*/i, 'Canteen#')
        .replace('# ', '#');

      setStringCell(worksheet, `${cols.canteen}${r}`, canteenLabel);

      // Fill only the input columns; template formulas (if any) can compute totals.
      worksheet.getCell(`${cols.wages}${r}`).value = toNumber(row?.wages);
      worksheet.getCell(`${cols.sss}${r}`).value = toNumber(row?.sss);
      worksheet.getCell(`${cols.storeSupplies}${r}`).value = toNumber(row?.storeSupplies);
      worksheet.getCell(`${cols.purchases}${r}`).value = toNumber(row?.purchases);
      worksheet.getCell(`${cols.grossSales}${r}`).value = toNumber(row?.grossSales);
    });

    // Format numbers (if template doesn't already)
    const numberCols = [cols.wages, cols.sss, cols.storeSupplies, cols.purchases, cols.grossSales];
    for (let i = 0; i < (rows ?? []).length; i += 1) {
      const r = startRow + i;
      numberCols.forEach((c) => {
        worksheet.getCell(`${c}${r}`).numFmt = '#,##0.00';
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const fileName = `Monthly-Report-${month || 'export'}.xlsx`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Monthly template export failed:', error);
    throw new Error('Unable to export monthly report. Ensure the template file is in public/Monthly-Report.xlsx');
  }
};

export const exportYearlyReportToTemplate = async ({ year, rows }) => {
  const workbook = new ExcelJS.Workbook();

  const yearlyMap = {
    meta: {
      period: 'F6',
    },
    table: {
      startRow: 11,
      columns: {
        month: 'A',
        wages: 'B',
        sss: 'C',
        storeSupplies: 'E',
        purchases: 'J',
        grossSales: 'M',
      },
    },
  };

  try {
    const response = await fetch(YEARLY_TEMPLATE_URL);
    if (!response.ok) throw new Error('Template not found');

    const arrayBuffer = await response.arrayBuffer();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) throw new Error('No worksheet found in template');

    // Meta
    setStringCell(worksheet, yearlyMap.meta.period, year || '');

    // Table
    const startRow = yearlyMap.table.startRow;
    const cols = yearlyMap.table.columns;

    (rows ?? []).forEach((row) => {
      const monthValue = parseInt(row.month.split("-")[1], 10);
      const r = (startRow - 1) + monthValue; // Jan (01) -> Row 11, April (04) -> Row 14, etc.

      // We only fill the data if we have a valid month number
      if (!Number.isNaN(r) && r >= 11 && r <= 22) {
        // We don't necessarily need to overwrite the month label if the template has them,
        // but it's safer to ensure it matches the data.
        const monthOnly = (row?.monthName ?? "").split(" ")[0];
        setStringCell(worksheet, `${cols.month}${r}`, monthOnly);

        // Fill only the input columns; template formulas (if any) can compute totals.
        worksheet.getCell(`${cols.wages}${r}`).value = toNumber(row?.wages);
        worksheet.getCell(`${cols.sss}${r}`).value = toNumber(row?.sss);
        worksheet.getCell(`${cols.storeSupplies}${r}`).value =
          toNumber(row?.storeSupplies);
        worksheet.getCell(`${cols.purchases}${r}`).value =
          toNumber(row?.purchases);
        // Yearly view has 'totalSales' for aggregated months
        worksheet.getCell(`${cols.grossSales}${r}`).value =
          toNumber(row?.totalSales);

        // Format numbers for this specific row
        const numberCols = [
          cols.wages,
          cols.sss,
          cols.storeSupplies,
          cols.purchases,
          cols.grossSales,
        ];
        numberCols.forEach((c) => {
          worksheet.getCell(`${c}${r}`).numFmt = "#,##0.00";
        });
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const fileName = `Yearly-Report-${year || 'export'}.xlsx`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Yearly template export failed:', error);
    throw new Error('Unable to export yearly report. Ensure the template file is in public/Yearly-Report.xlsx');
  }
};
