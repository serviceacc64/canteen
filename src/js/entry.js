document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('.btn-add-entry').forEach(btn => {
		btn.addEventListener('click', () => {
			const targetSelector = btn.dataset.target;
			let container = targetSelector ? document.querySelector(targetSelector) : null;
			if (!container) {
				container = btn.closest('.purchase-group') || btn.closest('.consignment-group') || btn.closest('.section');
			}
			if (!container) return;

			const name = prompt('Enter label for new entry (e.g. Supplier name)') || 'New Entry';

			const row = document.createElement('div');
			row.className = 'input-row';
			row.innerHTML = `
				<label><b>${escapeHtml(name)}</b></label>
				<div class="input-currency">
					<span>₱</span>
					<input type="number" step="0.01" value="0.00" />
				</div>
			`;

			const addRow = container.querySelector('.add-entry-row');
			if (addRow && addRow.parentNode === container) container.insertBefore(row, addRow);
			else container.appendChild(row);
		});
	});
});

function escapeHtml(str) {
	return String(str).replace(/[&<>"']/g, function (s) {
		return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[s];
	});
}

