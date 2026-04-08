const DYNAMIC_SECTION_IDS = ['cash-sales', 'store-purchases', 'store-consignment'];
const DAILY_REPORTS_STORAGE_KEY = 'canteen_daily_reports';

function createDeleteButton() {
	return `
		<button type="button" class="delete-icon-btn" aria-label="Delete entry" title="Delete entry">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="3 6 5 6 21 6"></polyline>
				<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
				<line x1="10" y1="11" x2="10" y2="17"></line>
				<line x1="14" y1="11" x2="14" y2="17"></line>
			</svg>
		</button>
	`;
}

function escapeHtml(str) {
	return String(str).replace(/[&<>"']/g, function (s) {
		return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[s];
	});
}

function parseAmount(value) {
	const parsed = parseFloat(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

function formatPeso(value) {
	const amount = Number.isFinite(value) ? value : 0;
	return '\u20B1' + new Intl.NumberFormat('en-PH', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
}

function sumInputs(inputs) {
	return Array.from(inputs).reduce((total, input) => total + parseAmount(input.value), 0);
}

function updateText(selector, value) {
	const element = document.querySelector(selector);
	if (element) {
		element.textContent = formatPeso(value);
	}
}

function createDynamicRow(label, value = '0.00') {
	const row = document.createElement('div');
	row.className = 'input-row';
	row.innerHTML = `
		<label><b>${escapeHtml(label)}</b></label>
		<div class="input-currency-wrapper">
			${createDeleteButton()}
			<div class="input-currency">
				<span>\u20B1</span>
				<input type="number" step="0.01" value="${escapeHtml(value)}" />
			</div>
		</div>
	`;
	addDeleteListener(row);
	return row;
}

function createSalaryRow(name = '', amount = '0') {
	const row = document.createElement('div');
	row.className = 'salary-row';
	row.innerHTML = `
		<input type="text" placeholder="Name" value="${escapeHtml(name)}" />
		<div class="input-currency small-input">
			<span>\u20B1</span>
			<input type="number" step="1" value="${escapeHtml(amount)}" />
		</div>
		<button type="button" class="delete-button" title="Delete row"><i class="bi bi-trash"></i></button>
	`;
	addDeleteListener(row);
	return row;
}

function addDeleteListener(row) {
	const deleteBtn = row.querySelector('.delete-icon-btn, .delete-button');
	if (!deleteBtn || deleteBtn.dataset.bound === 'true') return;

	deleteBtn.dataset.bound = 'true';
	deleteBtn.addEventListener('click', (e) => {
		e.preventDefault();
		e.stopPropagation();
		showDeleteConfirmModal(row);
	});
}

function showDeleteConfirmModal(row) {
	const modal = document.getElementById('deleteConfirmModal');
	if (!modal) return;

	modal.classList.add('show');
	modal.setAttribute('aria-hidden', 'false');

	const confirmBtn = modal.querySelector('.btn-confirm-delete');
	const cancelBtn = modal.querySelector('.btn-cancel-delete');
	const backdrop = modal.querySelector('.modal-backdrop');

	function closeConfirmModal() {
		modal.classList.remove('show');
		modal.setAttribute('aria-hidden', 'true');
		confirmBtn.removeEventListener('click', handleConfirm);
		cancelBtn.removeEventListener('click', closeConfirmModal);
		backdrop.removeEventListener('click', closeConfirmModal);
	}

	function handleConfirm() {
		closeConfirmModal();
		row.style.transition = 'all 0.2s ease';
		row.style.opacity = '0';
		row.style.transform = 'scale(0.95)';

		setTimeout(() => {
			row.remove();
			recalculateAll();
			saveFormData();
			showDeleteSuccessModal();
		}, 200);
	}

	confirmBtn.addEventListener('click', handleConfirm);
	cancelBtn.addEventListener('click', closeConfirmModal);
	backdrop.addEventListener('click', closeConfirmModal);
}

function showDeleteSuccessModal() {
	const modal = document.getElementById('deleteSuccessModal');
	if (!modal) return;

	modal.classList.add('show');
	modal.setAttribute('aria-hidden', 'false');

	function closeSuccessModal() {
		modal.classList.remove('show');
		modal.setAttribute('aria-hidden', 'true');
	}

	setTimeout(closeSuccessModal, 2500);
}

function getDynamicSectionRows(sectionId) {
	const section = document.getElementById(sectionId);
	if (!section) return [];

	return Array.from(section.querySelectorAll('.input-row:not(.add-entry-row)')).map((row) => {
		const label = row.querySelector('label b');
		const numInput = row.querySelector('input[type="number"]');
		if (!label || !numInput) return null;

		return {
			label: label.textContent.trim(),
			value: numInput.value,
		};
	}).filter(Boolean);
}

function restoreDynamicSectionRows(sectionId, rows) {
	const section = document.getElementById(sectionId);
	if (!section) return;

	section.querySelectorAll('.input-row:not(.add-entry-row)').forEach((row) => row.remove());
	const addRow = section.querySelector('.add-entry-row');

	rows.forEach((rowData) => {
		const row = createDynamicRow(rowData.label, rowData.value);
		if (addRow && addRow.parentNode === section) {
			section.insertBefore(row, addRow);
		} else {
			section.appendChild(row);
		}
	});
}

function getSalaryBreakdownSection() {
	return Array.from(document.querySelectorAll('.section.salary-breakdown')).find((section) => {
		const addHelperButton = section.querySelector('.add-helper');
		return addHelperButton && addHelperButton.closest('.section.salary-breakdown') === section;
	}) || null;
}

function getSalaryRows() {
	return Array.from(document.querySelectorAll('.salary-row'));
}

function getSalaryOfHelpersInput() {
	return document.getElementById('salaryOfHelpers');
}

function getExpenseValue(labelText) {
	const normalizedLabel = labelText.trim().toLowerCase();

	for (const row of document.querySelectorAll('.expenses .input-row')) {
		const label = row.querySelector('label');
		const input = row.querySelector('input[type="number"]');
		if (!label || !input) continue;
		if (label.textContent.trim().toLowerCase() !== normalizedLabel) continue;
		return parseAmount(input.value);
	}

	return 0;
}

function getSalaryBreakdownData() {
	return getSalaryRows().map((row) => {
		const name = row.querySelector('input[type="text"]')?.value.trim() || '';
		const amount = parseAmount(row.querySelector('input[type="number"]')?.value);
		return { name, amount };
	}).filter((row) => row.name !== '' || row.amount !== 0);
}

function syncSalaryOfHelpers() {
	const salaryRows = getSalaryRows();
	const breakdownInputs = salaryRows.map((row) => row.querySelector('input[type="number"]')).filter(Boolean);
	const salaryOfHelpersInput = getSalaryOfHelpersInput();
	const hasBreakdownData = salaryRows.some((row) => {
		const name = row.querySelector('input[type="text"]')?.value.trim() || '';
		const amount = parseAmount(row.querySelector('input[type="number"]')?.value);
		return name !== '' || amount !== 0;
	});
	let salaryTotal = sumInputs(breakdownInputs);

	if (salaryOfHelpersInput && hasBreakdownData) {
		salaryOfHelpersInput.value = salaryTotal.toFixed(2);
	} else if (salaryOfHelpersInput) {
		salaryTotal = parseAmount(salaryOfHelpersInput.value);
	}

	updateText('.breakdown-total span', salaryTotal);
	return salaryTotal;
}

function recalculateAll() {
	const totalSales = sumInputs(document.querySelectorAll('#cash-sales .input-row input[type="number"]'));
	const totalCashPurchases = sumInputs(document.querySelectorAll('.purchases .purchase-group .input-row input[type="number"]'));
	const payableToSupplier = sumInputs(document.querySelectorAll('.consignment-section .consignment-input-row input[type="number"], #store-consignment .input-row input[type="number"]'));
	const salaryBreakdownTotal = syncSalaryOfHelpers();
	const totalOperatingExpenses = sumInputs(document.querySelectorAll('.expenses .input-row input[type="number"]'));
	const totalExpenses = totalCashPurchases + payableToSupplier + totalOperatingExpenses;
	const netProfit = totalSales - totalExpenses;
	const summaryRows = document.querySelectorAll('.summary .summary-row');

	updateText('#cash-sales .highlight-amount', totalSales);
	updateText('.purchases .highlight-total span:last-child', totalCashPurchases);
	updateText('.payable-summary span:last-child', payableToSupplier);
	updateText('.expenses .highlight-total span:last-child', totalOperatingExpenses);
	if (summaryRows[0]) summaryRows[0].querySelector('span:last-child').textContent = formatPeso(totalSales);
	if (summaryRows[1]) summaryRows[1].querySelector('span:last-child').textContent = formatPeso(totalExpenses);
	updateText('.summary .summary-row.net-profit .highlight-green', netProfit);

	return {
		totalSales,
		totalCashPurchases,
		payableToSupplier,
		salaryBreakdownTotal,
		totalOperatingExpenses,
		totalExpenses,
		netProfit,
	};
}

function sumRowsByLabel(sectionSelector, labelText) {
	const normalizedLabel = labelText.trim().toLowerCase();

	return Array.from(document.querySelectorAll(`${sectionSelector} .input-row`)).reduce((total, row) => {
		const label = row.querySelector('label b');
		const input = row.querySelector('input[type="number"]');
		if (!label || !input) return total;
		if (label.textContent.trim().toLowerCase() !== normalizedLabel) return total;
		return total + parseAmount(input.value);
	}, 0);
}

function formatDisplayDate(dateValue) {
	if (!dateValue) return 'No date';

	const parsed = new Date(`${dateValue}T00:00:00`);
	if (Number.isNaN(parsed.getTime())) return dateValue;

	return parsed.toLocaleDateString('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}

function buildReportEntry(totals) {
	const dateValue = document.getElementById('date')?.value || '';
	const canteen = document.getElementById('canteenLocation')?.value || 'Unknown Canteen';
	const storeSales = sumRowsByLabel('#cash-sales', 'store');
	const kitchenSales = sumRowsByLabel('#cash-sales', 'kitchen');
	const palamigSales = sumRowsByLabel('#cash-sales', 'palamig');
	const schoolSuppliesSales = sumRowsByLabel('#cash-sales', 'school supplies');
	const salaryOfHelpers = getExpenseValue('Salary of Helpers');
	const utilityExpenses = getExpenseValue('Utility Expenses');
	const sssOfHelpers = getExpenseValue('SSS of Helpers');
	const lpgExpenses = getExpenseValue('LPG');
	const otherOperatingExpenses = getExpenseValue('Others');
	const salaryBreakdown = getSalaryBreakdownData();

	return {
		id: `report-${Date.now()}`,
		date: dateValue,
		dateLabel: formatDisplayDate(dateValue),
		canteen,
		storeSales,
		kitchenSales,
		palamigSales,
		schoolSuppliesSales,
		totalCashPurchases: totals.totalCashPurchases,
		totalSales: totals.totalSales,
		payableToSupplier: totals.payableToSupplier,
		salaryOfHelpers,
		utilityExpenses,
		sssOfHelpers,
		lpgExpenses,
		otherOperatingExpenses,
		salaryBreakdown,
		totalOperatingExpenses: totals.totalOperatingExpenses,
		totalExpenses: totals.totalExpenses,
		netProfit: totals.netProfit,
		createdAt: new Date().toISOString(),
	};
}

function saveReportEntry(reportEntry) {
	const currentReports = JSON.parse(localStorage.getItem(DAILY_REPORTS_STORAGE_KEY) || '[]');
	currentReports.unshift(reportEntry);
	localStorage.setItem(DAILY_REPORTS_STORAGE_KEY, JSON.stringify(currentReports));
}

function saveFormData() {
	return;
}

function removeDynamicSectionRows(sectionId) {
	const section = document.getElementById(sectionId);
	if (!section) return;

	section.querySelectorAll('.input-row:not(.add-entry-row)').forEach((row) => row.remove());
}

function resetFormState() {
	const form = document.querySelector('.daily-entry-form');
	if (!form) return;

	form.reset();

	DYNAMIC_SECTION_IDS.forEach(removeDynamicSectionRows);

	const salarySection = getSalaryBreakdownSection();
	if (salarySection) {
		const rows = salarySection.querySelectorAll('.salary-row');
		rows.forEach((row, index) => {
			if (index === 0) {
				const textInput = row.querySelector('input[type="text"]');
				const numberInput = row.querySelector('input[type="number"]');
				if (textInput) textInput.value = '';
				if (numberInput) numberInput.value = '0';
			} else {
				row.remove();
			}
		});
	}

	const salaryOfHelpersInput = getSalaryOfHelpersInput();
	if (salaryOfHelpersInput) salaryOfHelpersInput.value = '0.00';

	recalculateAll();
}

function initializeSalaryBreakdown() {
	getSalaryRows().forEach(addDeleteListener);

	const salarySection = getSalaryBreakdownSection();
	const addHelperButton = salarySection?.querySelector('.add-helper');
	if (!salarySection || !addHelperButton) return;

	addHelperButton.addEventListener('click', () => {
		const row = createSalaryRow('', '0');
		salarySection.insertBefore(row, addHelperButton);
		recalculateAll();
		saveFormData();
	});
}

function showSuccessToast(text) {
	const el = document.getElementById('addEntrySuccess');
	if (!el) return;

	el.textContent = text;
	el.classList.add('show');
	if (el._hideTimeout) clearTimeout(el._hideTimeout);

	el._hideTimeout = setTimeout(() => {
		el.classList.remove('show');
		el._hideTimeout = null;
	}, 3000);
}

function showSaveSuccessModal() {
	const modal = document.getElementById('saveSuccessModal');
	if (!modal) return;

	modal.classList.add('show');
	modal.setAttribute('aria-hidden', 'false');

	const closeButton = modal.querySelector('.btn-close-save');
	const backdrop = modal.querySelector('.modal-backdrop');

	function closeModal() {
		modal.classList.remove('show');
		modal.setAttribute('aria-hidden', 'true');
		closeButton.removeEventListener('click', closeModal);
		backdrop.removeEventListener('click', closeModal);
	}

	closeButton.addEventListener('click', closeModal);
	backdrop.addEventListener('click', closeModal);
}

document.addEventListener('DOMContentLoaded', () => {
	resetFormState();
	initializeSalaryBreakdown();
	recalculateAll();

	const modal = document.getElementById('addEntryModal');
	const input = document.getElementById('addEntryLabel');
	const confirmBtn = document.getElementById('addEntryConfirm');
	const cancelBtn = document.getElementById('addEntryCancel');
	const form = document.querySelector('.daily-entry-form');
	let currentContainer = null;

	if (form) {
		form.addEventListener('input', () => {
			recalculateAll();
		});

		form.addEventListener('change', () => {
			recalculateAll();
		});

		form.addEventListener('submit', (e) => {
			e.preventDefault();
			const totals = recalculateAll();
			saveReportEntry(buildReportEntry(totals));
			showSaveSuccessModal();
			resetFormState();
		});
	}

	document.querySelectorAll('.btn-add-entry').forEach((btn) => {
		btn.addEventListener('click', () => {
			const targetSelector = btn.dataset.target;
			currentContainer = targetSelector
				? document.querySelector(targetSelector)
				: (btn.closest('.purchase-group') || btn.closest('.consignment-group') || btn.closest('.section'));

			if (!currentContainer) return;

			input.value = '';
			modal.classList.add('show');
			modal.setAttribute('aria-hidden', 'false');
			setTimeout(() => input.focus(), 50);
		});
	});

	function closeModal() {
		modal.classList.remove('show');
		modal.setAttribute('aria-hidden', 'true');
		input.value = '';
		currentContainer = null;
	}

	cancelBtn.addEventListener('click', closeModal);
	modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

	confirmBtn.addEventListener('click', () => {
		const name = (input.value || '').trim() || 'New Entry';
		if (!currentContainer) {
			closeModal();
			return;
		}

		const row = createDynamicRow(name, '0.00');
		const addRow = currentContainer.querySelector('.add-entry-row');

		if (addRow && addRow.parentNode === currentContainer) {
			currentContainer.insertBefore(row, addRow);
		} else {
			currentContainer.appendChild(row);
		}

		showSuccessToast('Entry added');
		closeModal();
		recalculateAll();
	});

	input.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			confirmBtn.click();
		}

		if (e.key === 'Escape') {
			closeModal();
		}
	});

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && modal.classList.contains('show')) {
			closeModal();
		}
	});
});

window.addEventListener('pageshow', () => {
	resetFormState();
});
