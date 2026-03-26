document.addEventListener('DOMContentLoaded', () => {
	const modal = document.getElementById('addEntryModal');
	const input = document.getElementById('addEntryLabel');
	const confirmBtn = document.getElementById('addEntryConfirm');
	const cancelBtn = document.getElementById('addEntryCancel');
	let currentContainer = null;

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

		// show success toast briefly then close modal
		showSuccessToast('Entry added');
		closeModal();
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

