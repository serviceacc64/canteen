const DAILY_REPORTS_STORAGE_KEY = 'canteen_daily_reports';
const SELECTED_REPORT_STORAGE_KEY = 'selected_daily_report_id';

function parseReports() {
	try {
		return JSON.parse(localStorage.getItem(DAILY_REPORTS_STORAGE_KEY) || '[]');
	} catch (error) {
		console.error('Error loading daily reports:', error);
		return [];
	}
}

function parseAmount(value) {
	const parsed = parseFloat(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

function formatPeso(value) {
	const amount = Number.isFinite(value) ? value : 0;
	return 'PHP ' + new Intl.NumberFormat('en-PH', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
}

function formatLongDate(dateValue) {
	if (!dateValue) return 'No date';

	const parsed = new Date(`${dateValue}T00:00:00`);
	if (Number.isNaN(parsed.getTime())) return dateValue;

	return parsed.toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
}

function setText(id, value) {
	const element = document.getElementById(id);
	if (element) {
		element.textContent = value;
	}
}

function setMoney(id, value) {
	setText(id, formatPeso(parseAmount(value)));
}

function resolveSelectedReport(reports) {
	const params = new URLSearchParams(window.location.search);
	const reportIdFromQuery = params.get('reportId');
	const reportId = reportIdFromQuery || localStorage.getItem(SELECTED_REPORT_STORAGE_KEY) || '';

	if (reportId) {
		const matchedReport = reports.find((report) => report.id === reportId);
		if (matchedReport) {
			localStorage.setItem(SELECTED_REPORT_STORAGE_KEY, matchedReport.id);
			return matchedReport;
		}
	}

	return reports[0] || null;
}

function renderEmptyState() {
	setText('viewPageTitle', 'No report selected');
	setText('viewSubtitle', 'Open a saved report from the Daily Reports page.');
	setText('viewCanteenId', 'CANTEEN');
	setText('viewReportDate', 'No date');
}

function renderSalaryBreakdown(report) {
	const tbody = document.getElementById('viewSalaryBreakdownBody');
	if (!tbody) return;

	const salaryRows = Array.isArray(report.salaryBreakdown) ? report.salaryBreakdown : [];
	if (!salaryRows.length) {
		tbody.innerHTML = '<tr><td colspan="3">No salary breakdown saved for this report.</td></tr>';
		return;
	}

	tbody.innerHTML = salaryRows.map((row, index) => `
		<tr>
			<td>${index + 1}.</td>
			<td>${row.name || 'Unnamed'}</td>
			<td>${formatPeso(row.amount || 0)}</td>
		</tr>
	`).join('');
}

function renderReport(report) {
	const reportDateText = formatLongDate(report.date);
	const canteenLabel = (report.canteen || 'Canteen').toUpperCase();
	const totalCashPurchases = report.totalCashPurchases || 0;
	const payableToSupplier = report.payableToSupplier || 0;
	const totalOperatingExpenses = report.totalOperatingExpenses || 0;
	const totalExpenses = report.totalExpenses || 0;

	setText('viewCurrentDate', new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	}));
	setText('viewPageTitle', `Daily Canteen Report: ${report.dateLabel || reportDateText}`);
	setText('viewSubtitle', `Saved report details for ${reportDateText}`);
	setText('viewCanteenId', canteenLabel);
	setText('viewReportDate', reportDateText);

	setMoney('viewStoreSales', report.storeSales || 0);
	setMoney('viewKitchenSales', report.kitchenSales || 0);
	setMoney('viewPalamigSales', report.palamigSales || 0);
	setMoney('viewSchoolSuppliesSales', report.schoolSuppliesSales || 0);
	setMoney('viewTotalSales', report.totalSales || 0);
	setMoney('viewCashPurchases', totalCashPurchases);
	setMoney('viewPayableToSupplier', payableToSupplier);
	setMoney('viewOperatingExpensesDeduction', totalOperatingExpenses);
	setMoney('viewTotalExpensesCalc', totalExpenses);
	setMoney('viewSalaryOfHelpers', report.salaryOfHelpers || 0);
	setMoney('viewUtilityExpenses', report.utilityExpenses || 0);
	setMoney('viewSssOfHelpers', report.sssOfHelpers || 0);
	setMoney('viewLpgExpenses', report.lpgExpenses || 0);
	setMoney('viewOtherExpenses', report.otherOperatingExpenses || 0);
	setMoney('viewOperatingExpensesTotal', totalOperatingExpenses);
	setMoney('viewSalaryBreakdownTotal', report.salaryOfHelpers || 0);
	setMoney('viewFinalTotalSales', report.totalSales || 0);
	setMoney('viewFinalTotalExpenses', totalExpenses);
	setMoney('viewNetProfit', report.netProfit || 0);

	renderSalaryBreakdown(report);
}

document.addEventListener('DOMContentLoaded', () => {
	const reports = parseReports();
	const selectedReport = resolveSelectedReport(reports);

	if (!selectedReport) {
		renderEmptyState();
		return;
	}

	renderReport(selectedReport);
});
