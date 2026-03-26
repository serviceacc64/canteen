const STORAGE_KEY = 'canteen_entry_form_data';

// Save all form data to localStorage
function saveFormData() {
	const formData = {};
	
	// Save date and canteen location
	const dateInput = document.getElementById('date');
	const locationInput = document.getElementById('canteenLocation');
	if (dateInput) formData.date = dateInput.value;
	if (locationInput) formData.location = locationInput.value;
	
	// Save all input values
	const form = document.querySelector('.daily-entry-form');
	if (!form) return;
	
	formData.inputs = {};
	const inputs = form.querySelectorAll('input[type="number"], input[type="text"], textarea, select');
	inputs.forEach((input) => {
		if (input.id) formData.inputs[input.id] = input.value;
	});
	
	// Save dynamic rows structure
	const sections = ['cash-sales', 'store-purchases', 'store-consignment'];
	formData.dynamicRows = {};
	sections.forEach(sectionId => {
		const section = document.getElementById(sectionId);
		if (section) {
			formData.dynamicRows[sectionId] = [];
			const rows = section.querySelectorAll('.input-row:not(.add-entry-row)');
			rows.forEach(row => {
				const label = row.querySelector('label b');
				const numInput = row.querySelector('input[type="number"]');
				if (label && numInput) {
					formData.dynamicRows[sectionId].push({
						label: label.textContent,
						value: numInput.value
					});
				}
			});
		}
	});
	
	localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
}

// Restore form data from localStorage
function restoreFormData() {
	const saved = localStorage.getItem(STORAGE_KEY);
	if (!saved) return;
	
	try {
		const formData = JSON.parse(saved);
		
		// Restore date and location
		const dateInput = document.getElementById('date');
		const locationInput = document.getElementById('canteenLocation');
		if (dateInput && formData.date) dateInput.value = formData.date;
		if (locationInput && formData.location) locationInput.value = formData.location;
		
		// Restore input values
		if (formData.inputs) {
			Object.keys(formData.inputs).forEach(id => {
				const input = document.getElementById(id);
				if (input) input.value = formData.inputs[id];
			});
		}
		
		// Restore dynamic rows
		if (formData.dynamicRows) {
			Object.keys(formData.dynamicRows).forEach(sectionId => {
				const section = document.getElementById(sectionId);
				if (section) {
					formData.dynamicRows[sectionId].forEach(rowData => {
						const row = document.createElement('div');
						row.className = 'input-row';
						row.innerHTML = `
							<label><b>${escapeHtml(rowData.label)}</b></label>
							<div class="input-currency">
								<span>₱</span>
								<input type="number" step="0.01" value="${escapeHtml(rowData.value)}" />
							</div>
						`;
						
						const addRow = section.querySelector('.add-entry-row');
						if (addRow && addRow.parentNode === section) {
							section.insertBefore(row, addRow);
						} else {
							section.appendChild(row);
						}
					});
				}
			});
		}
	} catch (e) {
		console.error('Error restoring form data:', e);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	// Restore saved data on page load
	restoreFormData();
	
	const modal = document.getElementById('addEntryModal');
	const input = document.getElementById('addEntryLabel');
	const confirmBtn = document.getElementById('addEntryConfirm');
	const cancelBtn = document.getElementById('addEntryCancel');
	let currentContainer = null;

	// Auto-save on input changes
	const form = document.querySelector('.daily-entry-form');
	if (form) {
		form.addEventListener('input', saveFormData);
		form.addEventListener('change', saveFormData);
	}

	document.querySelectorAll('.btn-add-entry').forEach(btn => {
		btn.addEventListener('click', () => {
			const targetSelector = btn.dataset.target;
			currentContainer = targetSelector ? document.querySelector(targetSelector) : (btn.closest('.purchase-group') || btn.closest('.consignment-group') || btn.closest('.section'));
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
		if (!currentContainer) { closeModal(); return; }

		const row = document.createElement('div');
		row.className = 'input-row';
		row.innerHTML = `
			<label><b>${escapeHtml(name)}</b></label>
			<div class="input-currency">
				<span>₱</span>
				<input type="number" step="0.01" value="0.00" />
			</div>
		`;

		const addRow = currentContainer.querySelector('.add-entry-row');
		if (addRow && addRow.parentNode === currentContainer) currentContainer.insertBefore(row, addRow);
		else currentContainer.appendChild(row);

		// Add auto-save to new input
		const newInput = row.querySelector('input');
		if (newInput) {
			newInput.addEventListener('input', saveFormData);
			newInput.addEventListener('change', saveFormData);
		}

		// show success toast briefly then close modal
		showSuccessToast('Entry added');
		closeModal();
		
		// Save after adding entry
		saveFormData();
	});

	input.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') { e.preventDefault(); confirmBtn.click(); }
		if (e.key === 'Escape') closeModal();
	});

	document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('show')) closeModal(); });
});

function escapeHtml(str) {
	return String(str).replace(/[&<>"']/g, function (s) {
		return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[s];
	});
}

// Success toast helper
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

