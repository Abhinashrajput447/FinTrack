// ===== APP CONTROLLER (Multi-Page) =====
(function () {
    'use strict';

    const PAGE = document.body.dataset.page || 'dashboard';
    let deleteTargetId = null;

    // ---- Refresh current page data ----
    function refreshAll() {
        const txs = Finance.getAll();
        updateCurrencyLabels();

        if (PAGE === 'dashboard') {
            UI.updateSummaryCards(txs);
            UI.renderRecentTransactions(txs);
            UI.setCurrentDate();
            const weekly = Finance.getLast7DaysData(txs);
            Charts.renderWeeklyChart(weekly.days, weekly.amounts);

            // Category breakdown should reflect current month expenses only.
            const now = new Date();
            const currentMonthTxs = Finance.getMonthTransactions(txs, now.getFullYear(), now.getMonth());
            Charts.renderCategoryChart(Finance.getCategoryTotals(currentMonthTxs, 'expense'));
        }

        if (PAGE === 'history') {
            applyHistoryFilters();
        }

        if (PAGE === 'reports') {
            const currentDate = new Date();
            const monthName = currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
            const periodEl = document.getElementById('reportsPeriod');
            if (periodEl) periodEl.textContent = 'Period: ' + monthName;

            const monthly = Finance.getMonthlyData(txs);
            Charts.renderMonthlyCompare(monthly.labels, monthly.income, monthly.expense);
            Charts.renderTopCategories(Finance.getCategoryTotals(txs, 'expense'));
            const daily = Finance.getDailyTrend(txs);
            Charts.renderDailyTrend(daily.labels, daily.amounts);
        }

        if (PAGE === 'budget') {
            UI.renderBudgetProgress(txs);
        }

        if (PAGE === 'export') {
            ExportReport.renderPreview();
        }
    }

    // ---- Mobile menu ----
    const menuBtn = document.getElementById('menuToggle');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });
    }

    // ---- Theme toggle ----
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const icon = document.querySelector('#themeToggle i');
        if (icon) icon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
    }

    applyTheme(Storage.getTheme());

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const next = Storage.getTheme() === 'dark' ? 'light' : 'dark';
            Storage.setTheme(next);
            applyTheme(next);
            refreshAll();
        });
    }

    // ---- Add Transaction (add-expense page) ----
    if (PAGE === 'add-transaction') {
        const txTypeButtons = [document.getElementById('btnExpense'), document.getElementById('btnIncome')];
        txTypeButtons.forEach(btn => {
            if (!btn) return;
            btn.addEventListener('click', () => {
                txTypeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById('txType').value = btn.dataset.type;

                const txCat = document.getElementById('txCategory');
                const txCustomCat = document.getElementById('txCustomCategory');
                if (txCat) txCat.style.display = 'block';
                if (txCustomCat) {
                    txCustomCat.style.display = 'none';
                    txCustomCat.value = '';
                }

                UI.populateCategoryDropdown(btn.dataset.type);
            });
        });

        // Handle category dropdown change
        const txCategorySelect = document.getElementById('txCategory');
        if (txCategorySelect) {
            txCategorySelect.addEventListener('change', function() {
                const customInput = document.getElementById('txCustomCategory');
                if (this.value === '__add_custom__') {
                    this.value = '';
                    this.style.display = 'none';
                    if (customInput) {
                        customInput.style.display = 'block';
                        customInput.focus();
                    }
                }
            });
        }

        const txForm = document.getElementById('transactionForm');
        if (txForm) {
            txForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const type = document.getElementById('txType').value;
                const amount = document.getElementById('txAmount').value;
                let category = document.getElementById('txCategory').value;
                const customCategory = document.getElementById('txCustomCategory').value;
                const date = document.getElementById('txDate').value;
                const note = document.getElementById('txNote').value;

                // Use custom category if provided, otherwise use dropdown selection
                if (customCategory && customCategory.trim()) {
                    category = customCategory.trim();
                }

                // Validate: amount, date are required, and category (either dropdown or custom)
                if (!amount || !date || (!category && !customCategory)) {
                    UI.showToast('Please fill all required fields (select or create a category).', 'error');
                    return;
                }

                try {
                    Finance.add(type, amount, category, date, note);
                    UI.showToast('Transaction added successfully!', 'success');
                    
                        // Reset form and UI
                    this.reset();
                    document.getElementById('txType').value = 'expense';
                    
                        // Reset category section - hide custom input, show dropdown
                        const txCat = document.getElementById('txCategory');
                        const txCustomCat = document.getElementById('txCustomCategory');
                        if (txCat) txCat.style.display = 'block';
                        if (txCustomCat) {
                            txCustomCat.style.display = 'none';
                            txCustomCat.value = '';
                        }
                    
                    txTypeButtons.forEach(b => b.classList.remove('active'));
                    if (txTypeButtons[0]) txTypeButtons[0].classList.add('active');
                    UI.populateCategoryDropdown('expense');
                } catch (err) {
                    UI.showToast(err.message || 'Unable to add transaction.', 'error');
                }
            });
        }

        const txDateInput = document.getElementById('txDate');
        if (txDateInput) txDateInput.value = new Date().toISOString().split('T')[0];

        UI.populateCategoryDropdown('expense');
    }

    // ---- Delete Transaction Modal ----
    function openDeleteModal(id) {
        const modal = document.getElementById('deleteModal');
        if (!modal) return;
        deleteTargetId = id;
        const txs = Finance.getAll();
        const t = txs.find(x => x.id === id);

        const preview = document.getElementById('deletePreview');
        if (t && preview) {
            const catIcon = CATEGORY_ICONS[t.category] || '⋯';
            const catColor = CATEGORY_COLORS[t.category] || CATEGORY_COLORS['Other'];
            preview.innerHTML = `
                <div class="dp-row"><span class="dp-label">Type</span><span class="dp-value" style="color:${t.type === 'income' ? 'var(--green)' : 'var(--red)'}">${t.type.charAt(0).toUpperCase() + t.type.slice(1)}</span></div>
                <div class="dp-row"><span class="dp-label">Category</span><span class="dp-value" style="color:${catColor.color}">${catIcon} ${UI.escapeHtml(t.category)}</span></div>
                <div class="dp-row"><span class="dp-label">Amount</span><span class="dp-value">${UI.formatCurrency(t.amount)}</span></div>
                <div class="dp-row"><span class="dp-label">Date</span><span class="dp-value">${UI.formatDate(t.date)}</span></div>`;
        }

        modal.classList.add('active');
    }

    function closeDeleteModal() {
        const modal = document.getElementById('deleteModal');
        if (modal) modal.classList.remove('active');
        deleteTargetId = null;
    }

    const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
    if (deleteConfirmBtn) {
        deleteConfirmBtn.addEventListener('click', () => {
            if (deleteTargetId) {
                Finance.remove(deleteTargetId);
                UI.showToast('Transaction deleted!', 'error');
                refreshAll();
            }
            closeDeleteModal();
        });
    }

    const deleteCancelBtn = document.getElementById('deleteCancelBtn');
    if (deleteCancelBtn) deleteCancelBtn.addEventListener('click', closeDeleteModal);
    const deleteModalClose = document.getElementById('deleteModalClose');
    if (deleteModalClose) deleteModalClose.addEventListener('click', closeDeleteModal);

    // ---- Edit Transaction Modal ----
    function openEditModal(id) {
        const modal = document.getElementById('editModal');
        if (!modal) return;
        const txs = Finance.getAll();
        const t = txs.find(x => x.id === id);
        if (!t) return;

        document.getElementById('editId').value = t.id;
        document.getElementById('editType').value = t.type;
        document.getElementById('editAmount').value = t.amount;
        document.getElementById('editDate').value = t.date;
        document.getElementById('editNote').value = t.note || '';

        document.querySelectorAll('.edit-type-btn').forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`.edit-type-btn[data-type="${t.type}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        populateEditCategories(t.type);
        document.getElementById('editCategory').value = t.category;

        modal.classList.add('active');
    }

    function closeEditModal() {
        const modal = document.getElementById('editModal');
        if (modal) modal.classList.remove('active');
    }

    function populateEditCategories(type) {
        const select = document.getElementById('editCategory');
        if (!select) return;
        const cats = CATEGORIES[type] || [];
        select.innerHTML = '<option value="">Select category</option>' +
            cats.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    document.querySelectorAll('.edit-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.edit-type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('editType').value = btn.dataset.type;
            populateEditCategories(btn.dataset.type);
        });
    });

    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const id = document.getElementById('editId').value;
            const type = document.getElementById('editType').value;
            const amount = document.getElementById('editAmount').value;
            const category = document.getElementById('editCategory').value;
            const date = document.getElementById('editDate').value;
            const note = document.getElementById('editNote').value;

            if (!amount || !category || !date) {
                UI.showToast('Please fill all required fields.', 'error');
                return;
            }

            try {
                Finance.update(id, type, amount, category, date, note);
                UI.showToast('Transaction updated successfully!', 'info');
                closeEditModal();
                refreshAll();
            } catch (err) {
                UI.showToast(err.message || 'Unable to update transaction.', 'error');
            }
        });
    }

    const editCancelBtn = document.getElementById('editCancelBtn');
    if (editCancelBtn) editCancelBtn.addEventListener('click', closeEditModal);
    const editModalClose = document.getElementById('editModalClose');
    if (editModalClose) editModalClose.addEventListener('click', closeEditModal);

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function (e) {
            if (e.target === this) {
                this.classList.remove('active');
                deleteTargetId = null;
            }
        });
    });

    // ---- Delegated click handlers for edit/delete buttons ----
    document.addEventListener('click', function (e) {
        const editBtn = e.target.closest('.btn-edit');
        if (editBtn) {
            openEditModal(editBtn.dataset.id);
            return;
        }
        const delBtn = e.target.closest('.btn-delete');
        if (delBtn) {
            openDeleteModal(delBtn.dataset.id);
            return;
        }
    });

    // ---- History Filters ----
    function applyHistoryFilters() {
        const categoryEl = document.getElementById('filterCategory');
        const typeEl = document.getElementById('filterType');
        const monthEl = document.getElementById('filterMonth');
        if (!categoryEl || !typeEl || !monthEl) return;
        const filtered = Finance.filter(Finance.getAll(), {
            category: categoryEl.value,
            type: typeEl.value,
            month: monthEl.value,
        });
        UI.renderHistoryTable(filtered);
    }

    if (PAGE === 'history') {
        const fc = document.getElementById('filterCategory');
        const ft = document.getElementById('filterType');
        const fm = document.getElementById('filterMonth');
        if (fc) fc.addEventListener('change', applyHistoryFilters);
        if (ft) ft.addEventListener('change', applyHistoryFilters);
        if (fm) fm.addEventListener('change', applyHistoryFilters);
        UI.populateFilterCategories();
    }

    // ---- Budget Form ----
    if (PAGE === 'budget') {
        const budgetMonthInput = document.getElementById('budgetMonth');
        if (budgetMonthInput) {
            const now = new Date();
            budgetMonthInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        }

        const budgetForm = document.getElementById('budgetForm');
        if (budgetForm) {
            budgetForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const month = document.getElementById('budgetMonth').value;
                const amount = document.getElementById('budgetAmount').value;
                if (!month || !amount) return;
                Storage.setBudget(month, Number(amount));
                UI.showToast('Budget set successfully!', 'success');
                refreshAll();
            });
        }
    }

    // ---- Currency selector ----
    function updateCurrencyLabels() {
        const sym = UI.getCurrencySymbol();
        const code = Storage.getCurrency();
        const txLabel = document.getElementById('txAmountLabel');
        const budgetLabel = document.getElementById('budgetAmountLabel');
        const editLabel = document.getElementById('editAmountLabel');
        const btnLabel = document.getElementById('currencyBtnLabel');
        if (txLabel) txLabel.textContent = 'Amount (' + sym + ')';
        if (budgetLabel) budgetLabel.textContent = 'Monthly Budget (' + sym + ')';
        if (editLabel) editLabel.textContent = 'Amount (' + sym + ')';
        if (btnLabel) btnLabel.textContent = sym + ' ' + code;
    }

    const currencyBtn = document.getElementById('currencyBtn');
    const currencyPopup = document.getElementById('currencyPopup');
    const currencySearchInput = document.getElementById('currencySearchInput');
    const currencyListEl = document.getElementById('currencyList');

    function renderCurrencyList(filter) {
        if (!currencyListEl) return;
        const current = Storage.getCurrency();
        const query = (filter || '').toLowerCase();
        const entries = Object.entries(UI.CURRENCY_MAP);
        const filtered = entries.filter(([code, info]) =>
            code.toLowerCase().includes(query) ||
            info.name.toLowerCase().includes(query) ||
            info.symbol.toLowerCase().includes(query)
        );

        if (filtered.length === 0) {
            currencyListEl.innerHTML = '<li class="no-results">No currencies found</li>';
            return;
        }

        currencyListEl.innerHTML = filtered.map(([code, info]) => `
            <li data-code="${code}" class="${code === current ? 'active' : ''}">
                <span class="cur-symbol">${info.symbol}</span>
                <span class="cur-info">
                    <span class="cur-code">${code}</span>
                    <span class="cur-name">${info.name}</span>
                </span>
            </li>
        `).join('');
    }

    function openCurrencyPopup() {
        if (!currencyPopup) return;
        currencyPopup.classList.add('open');
        if (currencySearchInput) {
            currencySearchInput.value = '';
            setTimeout(() => currencySearchInput.focus(), 50);
        }
        renderCurrencyList('');
    }

    function closeCurrencyPopup() {
        if (currencyPopup) currencyPopup.classList.remove('open');
    }

    if (currencyBtn) {
        currencyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currencyPopup && currencyPopup.classList.contains('open') ? closeCurrencyPopup() : openCurrencyPopup();
        });
    }

    if (currencySearchInput) {
        currencySearchInput.addEventListener('input', () => {
            renderCurrencyList(currencySearchInput.value);
        });
    }

    if (currencyListEl) {
        currencyListEl.addEventListener('click', (e) => {
            const li = e.target.closest('li[data-code]');
            if (!li) return;
            Storage.setCurrency(li.dataset.code);
            closeCurrencyPopup();
            refreshAll();
        });
    }

    document.addEventListener('click', (e) => {
        if (currencyPopup && currencyPopup.classList.contains('open') &&
            !currencyPopup.contains(e.target) && currencyBtn && e.target !== currencyBtn && !currencyBtn.contains(e.target)) {
            closeCurrencyPopup();
        }
    });

    // ---- Export Report ----
    if (PAGE === 'export') {
        const exportMonthInput = document.getElementById('exportMonth');
        if (exportMonthInput) {
            const now = new Date();
            exportMonthInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        }

        const em = document.getElementById('exportMonth');
        const et = document.getElementById('exportType');
        const ec = document.getElementById('exportCategory');
        if (em) em.addEventListener('change', () => ExportReport.renderPreview());
        if (et) et.addEventListener('change', () => {
            ExportReport.populateExportCategories();
            ExportReport.renderPreview();
        });
        if (ec) ec.addEventListener('change', () => ExportReport.renderPreview());
        ExportReport.populateExportCategories();

        const btnCSV = document.getElementById('btnExportCSV');
        const btnPDF = document.getElementById('btnExportPDF');
        if (btnCSV) btnCSV.addEventListener('click', () => ExportReport.downloadCSV());
        if (btnPDF) btnPDF.addEventListener('click', () => ExportReport.downloadPDF());
    }

    // ---- Initial load ----
    UI.populateCategoryDropdown('expense');
    UI.populateFilterCategories();
    refreshAll();
})();