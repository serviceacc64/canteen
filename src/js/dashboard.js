const DAILY_REPORTS_STORAGE_KEY = 'canteen_daily_reports';

function loadReports() {
	try {
		return JSON.parse(localStorage.getItem(DAILY_REPORTS_STORAGE_KEY) || '[]');
	} catch (error) {
		console.error('Error loading dashboard reports:', error);
		return [];
	}
}

function formatPeso(value) {
	const amount = Number.isFinite(value) ? value : 0;
	return 'PHP ' + new Intl.NumberFormat('en-PH', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
}

function formatLongDate(dateValue) {
	if (!dateValue) return 'No saved reports yet';
	const date = new Date(`${dateValue}T00:00:00`);
	if (Number.isNaN(date.getTime())) return dateValue;

	return date.toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
}

function formatMonthLabel(dateValue) {
	if (!dateValue) return 'No saved reports yet';
	const date = new Date(`${dateValue}T00:00:00`);
	if (Number.isNaN(date.getTime())) return dateValue;

	return date.toLocaleDateString('en-US', {
		month: 'long',
		year: 'numeric',
	});
}

function aggregateByDate(reports) {
	const grouped = new Map();

	reports.forEach((report) => {
		const key = report.date || report.createdAt || '';
		if (!grouped.has(key)) {
			grouped.set(key, {
				label: report.date ? new Date(`${report.date}T00:00:00`).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }) : 'N/A',
				totalSales: 0,
				totalExpenses: 0,
			});
		}

		const current = grouped.get(key);
		current.totalSales += Number(report.totalSales || 0);
		current.totalExpenses += Number(report.totalExpenses || 0);
	});

	return Array.from(grouped.entries())
		.sort((a, b) => new Date(a[0]) - new Date(b[0]))
		.map(([, value]) => value);
}

function renderCards(reports) {
	const totalSales = reports.reduce((sum, report) => sum + Number(report.totalSales || 0), 0);
	const totalExpenses = reports.reduce((sum, report) => sum + Number(report.totalExpenses || 0), 0);
	const totalPayables = reports.reduce((sum, report) => sum + Number(report.payableToSupplier || 0), 0);
	const netProfit = reports.reduce((sum, report) => sum + Number(report.netProfit || 0), 0);
	const latestReport = reports[0];
	const periodLabel = latestReport ? formatMonthLabel(latestReport.date) : 'No saved reports yet';

	const totalSalesEl = document.getElementById('dashboardTotalSales');
	const totalExpensesEl = document.getElementById('dashboardTotalExpenses');
	const netProfitEl = document.getElementById('dashboardNetProfit');
	const payablesEl = document.getElementById('dashboardPayables');

	if (totalSalesEl) totalSalesEl.textContent = formatPeso(totalSales);
	if (totalExpensesEl) totalExpensesEl.textContent = formatPeso(totalExpenses);
	if (netProfitEl) netProfitEl.textContent = formatPeso(netProfit);
	if (payablesEl) payablesEl.textContent = formatPeso(totalPayables);

	const salesPeriodEl = document.getElementById('dashboardSalesPeriod');
	const expensesPeriodEl = document.getElementById('dashboardExpensesPeriod');
	const profitPeriodEl = document.getElementById('dashboardProfitPeriod');
	if (salesPeriodEl) salesPeriodEl.textContent = periodLabel;
	if (expensesPeriodEl) expensesPeriodEl.textContent = periodLabel;
	if (profitPeriodEl) profitPeriodEl.textContent = periodLabel;

	const currentDateEl = document.getElementById('dashboardCurrentDate');
	if (currentDateEl) currentDateEl.textContent = latestReport ? formatLongDate(latestReport.date) : 'No saved reports yet';

	const trendEl = document.getElementById('dashboardSalesTrend');
	if (trendEl) {
		const trendText = trendEl.querySelector('span');
		if (trendText) {
			trendText.textContent = reports.length > 1
				? `${reports.length} saved report${reports.length > 1 ? 's' : ''} available`
				: 'No comparison available yet';
		}
	}
}

function renderChart(reports) {
	const ctx = document.getElementById('salesExpensesChart');
	if (!ctx || typeof Chart === 'undefined') return;

	const chartTitle = document.getElementById('dashboardChartTitle');
	const grouped = aggregateByDate(reports);
	const labels = grouped.map((item) => item.label);
	const salesData = grouped.map((item) => item.totalSales);
	const expensesData = grouped.map((item) => item.totalExpenses);

	if (chartTitle) {
		chartTitle.textContent = reports.length
			? `Daily Sales vs Expenses - ${formatMonthLabel(reports[0].date)}`
			: 'Daily Sales vs Expenses';
	}

	new Chart(ctx.getContext('2d'), {
		type: 'bar',
		data: {
			labels,
			datasets: [
				{
					label: 'Total Sales',
					data: salesData,
					backgroundColor: '#10b981',
					borderRadius: 6,
					barThickness: 18,
				},
				{
					label: 'Total Expenses',
					data: expensesData,
					backgroundColor: '#ef4444',
					borderRadius: 6,
					barThickness: 18,
				},
			],
		},
		options: {
			maintainAspectRatio: false,
			scales: {
				y: {
					beginAtZero: true,
					ticks: {
						callback(value) {
							return formatPeso(Number(value));
						},
					},
					grid: { color: 'rgba(0,0,0,0.05)' },
				},
				x: { grid: { display: false } },
			},
			plugins: {
				legend: { display: false },
				tooltip: {
					callbacks: {
						label(context) {
							const value = context.parsed.y ?? context.parsed;
							return `${context.dataset.label}: ${formatPeso(Number(value))}`;
						},
					},
				},
			},
		},
	});
}

document.addEventListener('DOMContentLoaded', () => {
	const reports = loadReports().sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
	renderCards(reports);
	renderChart(reports);
});
