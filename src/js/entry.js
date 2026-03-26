import * as utils from './form-utils.js';

let currentContainer = null;
const modal = document.getElementById('addEntryModal');
const input = document.getElementById('addEntryLabel');
const confirmBtn = document.getElementById('addEntryConfirm');
const cancelBtn = document.getElementById('addEntryCancel');

/**
 * Initialize all entry page functionality
 */
function initEntryPage() {
  initModals();
  initDynamicRows();
  initFormSubmit();
  initLiveTotals();
}

function initModals() {
  if (!modal) return;

  document.querySelectorAll('.btn-add-entry').forEach(btn => {
    btn.addEventListener('click', openAddEntryModal);
  });

  cancelBtn?.addEventListener('click', closeModal);
  modal.querySelector('.modal-backdrop')?.addEventListener('click', closeModal);

  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmBtn?.click();
    }
    if (e.key === 'Escape') closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) closeModal();
  });
}

function openAddEntryModal(e) {
  const targetSelector = e.currentTarget.dataset.target;
  currentContainer = targetSelector ? document.querySelector(targetSelector) : e.currentTarget.closest('.purchase-group, .consignment-group, .section');
  if (!currentContainer) return;

  input.value = '';
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  input.focus();
}

function closeModal() {
  if (document.activeElement && modal.contains(document.activeElement)) {
    document.activeElement.blur();
  }
  modal.classList.remove('show');
  setTimeout(() => modal.setAttribute('aria-hidden', 'true'), 150);
  input.value = '';
  currentContainer = null;
}

confirmBtn?.addEventListener('click', addDynamicRow);

function addDynamicRow() {
  const name = (input.value || '').trim() || 'New Entry';
  if (!currentContainer) {
    closeModal();
    return;
  }

  const row = document.createElement('div');
  row.className = 'input-row';
  row.innerHTML = `
    <label><b>${utils.escapeHtml(name)}</b></label>
    <div class="input-currency">
      <span>₱</span>
      <input type="number" step="0.01" value="0.00" data-live-total />
    </div>
  `;

  const addRow = currentContainer.querySelector('.add-entry-row');
  if (addRow && addRow.parentNode === currentContainer) {
    currentContainer.insertBefore(row, addRow);
  } else {
    currentContainer.appendChild(row);
  }

  utils.showToast('Entry added');
  closeModal();
  updateTotals();
}

function initDynamicRows() {
  // Salary rows
  const salaryContainer = document.querySelector('.salary-breakdown');
  if (salaryContainer) {
    salaryContainer.querySelector('.add-helper')?.addEventListener('click', addSalaryRow);
    // Event delegation for dynamic delete buttons
    salaryContainer.addEventListener('click', (e) => {
      if (e.target.closest('.delete-button')) {
        e.target.closest('.salary-row').remove();
        updateTotals();
      }
    });
  }
}

function addSalaryRow() {
  const salaryContainer = document.querySelector('.salary-breakdown');
  const addBtn = salaryContainer.querySelector('.add-helper');
  const row = document.createElement('div');
  row.className = 'salary-row';
  row.innerHTML = `
    <input type="text" placeholder="Name" />
    <div class="input-currency small-input">
      <span>₱</span><input type="number" step="1" value="0" data-live-total />
    </div>
    <button class="delete-button" title="Delete" aria-label="Delete row">
      <i class="bi bi-trash"></i>
    </button>
  `;
  salaryContainer.insertBefore(row, addBtn);
  updateTotals();
}

function initFormSubmit() {
  const form = document.querySelector('.daily-entry-form');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }
}

function initLiveTotals() {
  // Live update on input change (debounced)
  document.addEventListener('input', (e) => {
    if (e.target.matches('[data-live-total]')) {
      debounceUpdateTotals();
    }
  });
  updateTotals(); // Initial
}

let debounceTimer;
function debounceUpdateTotals() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(updateTotals, 300);
}

document.addEventListener('DOMContentLoaded', initEntryPage);

async function handleSubmit(e) {
	e.preventDefault();
	const form = e.target;
	const submitBtn = form.querySelector('.btn-save');
	const originalText = submitBtn.innerHTML;
	submitBtn.innerHTML = '<span>Loading...</span>';
	submitBtn.disabled = true;

	try {
		const data = collectFormData();
		const response = await fetch('http://localhost:3000/api/entry', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});

		const result = await response.json();
		if (!response.ok) throw new Error(result.error || 'Failed to save');

		utils.showToast(`Saved! ID: ${result.reportId}`);
		form.reset();
		updateTotals();
		setTimeout(() => location.href = 'dashboard.html', 1500);
	} catch (err) {
		console.error(err);
		utils.showToast(err.message, true);
	} finally {
		submitBtn.innerHTML = originalText;
		submitBtn.disabled = false;
	}
}

function addSalaryRow() {
	const salaryContainer = document.querySelector('.salary-breakdown');
	const addBtn = salaryContainer.querySelector('.add-helper');
	const row = document.createElement('div');
	row.className = 'salary-row';
	row.innerHTML = `
		<input type="text" placeholder="Name" />
		<div class="input-currency small-input">
			<span>₱</span><input type="number" step="1" value="0" />
		</div>
		<button class="delete-button" title="Delete"><i class="bi bi-trash"></i></button>
	`;
	salaryContainer.insertBefore(row, addBtn);
	row.querySelector('.delete-button').addEventListener('click', () => {
		row.remove();
		updateTotals();
	});
	updateTotals();
}

function collectFormData() {
	const date = document.getElementById('date').value;
	const canteen = document.getElementById('canteenLocation').value;

	// 1. SALES (first section with CASH SALES)
	const sales = [];
	const salesRows = document.querySelectorAll('.section:first-of-type .input-row label');
	salesRows.forEach((label, index) => {
		if (index < 4) { // Store, Kitchen, Palamig, School Supplies
			const category = label.textContent.trim();
			const input = label.nextElementSibling.querySelector('input[type="number"]');
			const amount = parseFloat(input?.value || 0);
			if (amount > 0) sales.push({ category, amount });
		}
	});

	// 2. PURCHASES (scan all purchase-group input-row)
	const purchases = [];
	document.querySelectorAll('.purchases .purchase-group .input-row').forEach(row => {
		const label = row.querySelector('label');
		const input = row.querySelector('input[type="number"]');
		if (label && input) {
			const category = row.closest('.purchase-group').querySelector('.subtitle-sm')?.textContent.trim().replace(/^[IV]+\.\s*/, '') || 'General';
			const item_name = label.textContent.trim().replace(/^<b>|<\/b>$/g, '');
			const amount = parseFloat(input.value || 0);
			if (amount > 0) purchases.push({ category, item_name, amount });
		}
	});
	// Dynamic purchase rows
	document.querySelectorAll('.purchases .input-row:not(.add-entry-row) label').forEach(label => {
		if (label.closest('.purchase-group')) {
			const input = label.nextElementSibling.querySelector('input[type="number"]');
			const category = label.closest('.purchase-group').querySelector('.subtitle-sm')?.textContent.trim().replace(/^[IV]+\.\s*/, '') || 'General';
			const item_name = label.textContent.trim().replace(/^<b>|<\/b>$/g, '');
			const amount = parseFloat(input?.value || 0);
			if (amount > 0) purchases.push({ category, item_name, amount });
		}
	});

	// 3. CONSIGNMENTS (by ID + dynamic)
	const consignments = [];
	// Fixed IDs
	const consignmentIds = ['bigboy', 'aqua', 'msa', 'others-store', 'kitchen', 'palamig', 'school-supplies'];
	consignmentIds.forEach(id => {
		const input = document.getElementById(id);
		if (input) {
			const amount = parseFloat(input.value || 0);
			if (amount > 0) {
				const category = id.includes('store') ? 'Store' : id.includes('kitchen') ? 'Kitchen' : id.includes('palamig') ? 'Palamig' : 'School Supplies';
				const item_name = input.previousElementSibling?.textContent.trim() || id;
				consignments.push({ category, item_name, amount });
			}
		}
	});
	// Dynamic consignment rows (similar to purchases)

	// 4. EXPENSES (OPERATING EXPENSES section)
	const expenses = [];
	const expenseRows = document.querySelectorAll('.expenses .input-row');
	expenseRows.forEach(row => {
		const label = row.querySelector('label');
		const input = row.querySelector('input[type="number"]');
		if (label && input) {
			const type = label.textContent.trim();
			const amount = parseFloat(input.value || 0);
			if (amount > 0) expenses.push({ type, amount });
		}
	});

	// 5. SALARIES (all .salary-row)
	const salaries = Array.from(document.querySelectorAll('.salary-row')).map(row => {
		const nameInput = row.querySelector('input[type="text"]');
		const amountInput = row.querySelector('input[type="number"]');
		const name = nameInput?.value.trim();
		const amount = parseFloat(amountInput?.value || 0);
		return { name, amount };
	}).filter(s => s.name && s.amount > 0);

	return {
		date,
		canteen,
		sales,
		purchases,
		consignments,
		expenses,
		salaries
	};
}

/**
 * Complete live totals calculator - Updates all section totals + summary/net profit
 */
function updateTotals() {
  const inputs = document.querySelectorAll('input[type="number"][data-live-total], input[type="number"]');
  
  let salesTotal = 0;
  let purchasesTotal = 0;
  let consignmentTotal = 0;
  let expensesTotal = 0;
  let salariesTotal = 0;

  // 1. Sales (first section)
  const salesSection = document.querySelector('.section:first-of-type');
  salesSection?.querySelectorAll('.input-row input[type="number"]').forEach(input => {
    salesTotal += parseFloat(input.value) || 0;
  });
  utils.updateCurrencyDisplay('.highlight-row .highlight-amount', salesTotal);

  // 2. Purchases
  const purchases = utils.collectSectionData('.purchases [data-section="purchases"]');
  purchasesTotal = purchases.reduce((sum, item) => sum + item.amount, 0);
  utils.updateCurrencyDisplay('.purchases .highlight-total span:last-child', purchasesTotal);

  // 3. Consignments/Payables
  const consignments = utils.collectSectionData('.consignment-section [data-section="consignments"]');
  consignmentTotal = consignments.reduce((sum, item) => sum + item.amount, 0);
  utils.updateCurrencyDisplay('.payable-summary span:last-child', consignmentTotal);

  // 4. Expenses
  const expenses = utils.collectSectionData('.expenses [data-section="expenses"]');
  expensesTotal = expenses.reduce((sum, item) => sum + item.amount, 0);
  utils.updateCurrencyDisplay('.expenses .highlight-total span:last-child', expensesTotal);

  // 5. Salaries
  const salaries = Array.from(document.querySelectorAll('.salary-row input[type="number"]')).reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);
  utils.updateCurrencyDisplay('.breakdown-total span:last-child', salariesTotal);

  // Summary
  const totalExpenses = purchasesTotal + consignmentTotal + expensesTotal + salariesTotal;
  utils.updateCurrencyDisplay('.summary-row:nth-child(1) span:last-child', salesTotal); // Total Sales
  utils.updateCurrencyDisplay('.summary-row:nth-child(2) span:last-child', totalExpenses); // Total Expenses
  const netProfit = salesTotal - totalExpenses;
  utils.updateCurrencyDisplay('.summary-row.net-profit span:last-child', netProfit);
  
  // Color net profit
  const netEl = document.querySelector('.summary-row.net-profit span:last-child');
  if (netEl) {
    netEl.classList.toggle('highlight-green', netProfit > 0);
    netEl.classList.toggle('highlight-orange', netProfit < 0);
  }
}





