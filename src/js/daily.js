const DAILY_REPORTS_STORAGE_KEY = 'canteen_daily_reports';

function parseReports() {
	try {
		return JSON.parse(localStorage.getItem(DAILY_REPORTS_STORAGE_KEY) || '[]');
	} catch (error) {
		console.error('Error loading daily reports:', error);
		return [];
	}
}

function formatPeso(value) {
	const amount = Number.isFinite(value) ? value : 0;
	return '\u20B1' + new Intl.NumberFormat('en-PH', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
}

function escapeAttribute(value) {
	return String(value ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function renderSummaryCards(reports) {
	const totalSales = reports.reduce((sum, report) => sum + (report.totalSales || 0), 0);
	const totalExpenses = reports.reduce((sum, report) => sum + (report.totalExpenses || 0), 0);
	const netProfit = reports.reduce((sum, report) => sum + (report.netProfit || 0), 0);
	const amounts = document.querySelectorAll('.financial-summary .amount');

	if (amounts[0]) amounts[0].textContent = formatPeso(totalSales);
	if (amounts[1]) amounts[1].textContent = formatPeso(totalExpenses);
	if (amounts[2]) amounts[2].textContent = formatPeso(netProfit);
}

function createActionButton(type, title, icon, reportId) {
	if (type === 'view') {
		return `
			<a href="view.html?reportId=${encodeURIComponent(reportId)}" class="action-btn ${type}" title="${title}" aria-label="${title}" data-report-id="${escapeAttribute(reportId)}">
				${icon}
			</a>
		`;
	}

	return `
		<button class="action-btn ${type}" title="${title}" aria-label="${title}" type="button" disabled>
			${icon}
		</button>
	`;
}

function renderTable(reports) {
	const tbody = document.getElementById('dailyReportsTableBody');
	if (!tbody) return;

	if (!reports.length) {
		tbody.innerHTML = `
			<tr>
				<td colspan="8" class="empty-state">No saved daily reports yet.</td>
			</tr>
		`;
		return;
	}

	tbody.innerHTML = reports.map((report) => `
		<tr>
			<td>${report.dateLabel || report.date || 'No date'}</td>
			<td><span class="status-dot green"></span>${report.canteen || 'Unknown Canteen'}</td>
			<td>${formatPeso(report.storeSales || 0)}</td>
			<td>${formatPeso(report.kitchenSales || 0)}</td>
			<td>${formatPeso(report.totalSales || 0)}</td>
			<td>${formatPeso(report.totalExpenses || 0)}</td>
			<td class="profit">${formatPeso(report.netProfit || 0)}</td>
			<td class="actions">
				${createActionButton('view', 'View', `
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
						<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
						<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6" fill="none"/>
					</svg>
				`, report.id)}
				${createActionButton('edit', 'Edit', `
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
						<path d="M3 21v-3.75L14.06 6.19a2 2 0 0 1 2.83 0l1.94 1.94a2 2 0 0 1 0 2.83L7.75 21H3z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
						<path d="M14 7l3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
					</svg>
				`)}
				${createActionButton('delete', 'Delete', `
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
						<polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
						<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
						<path d="M10 11v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
						<path d="M14 11v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
					</svg>
				`)}
			</td>
		</tr>
	`).join('');
}

document.addEventListener('DOMContentLoaded', () => {
	const reports = parseReports();
	renderSummaryCards(reports);
	renderTable(reports);

	document.addEventListener('click', (event) => {
		const viewLink = event.target.closest('a.action-btn.view[data-report-id]');
		if (!viewLink) return;

		localStorage.setItem('selected_daily_report_id', viewLink.dataset.reportId || '');
	});

	const newEntryButton = document.querySelector('.new-entry-btn');
	if (newEntryButton) {
		newEntryButton.addEventListener('click', () => {
			window.location.href = 'entry.html';
		});
	}
});
