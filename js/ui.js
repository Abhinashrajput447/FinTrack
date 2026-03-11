// ===== UI RENDERING =====
const UI = {
    CURRENCY_MAP: {
        INR: { symbol: '₹', locale: 'en-IN', name: 'Indian Rupee' },
        USD: { symbol: '$', locale: 'en-US', name: 'US Dollar' },
        EUR: { symbol: '€', locale: 'de-DE', name: 'Euro' },
        GBP: { symbol: '£', locale: 'en-GB', name: 'British Pound' },
        JPY: { symbol: '¥', locale: 'ja-JP', name: 'Japanese Yen' },
        AUD: { symbol: 'A$', locale: 'en-AU', name: 'Australian Dollar' },
        CAD: { symbol: 'C$', locale: 'en-CA', name: 'Canadian Dollar' },
        CNY: { symbol: '¥', locale: 'zh-CN', name: 'Chinese Yuan' },
        KRW: { symbol: '₩', locale: 'ko-KR', name: 'Korean Won' },
        BRL: { symbol: 'R$', locale: 'pt-BR', name: 'Brazilian Real' },
        CHF: { symbol: 'Fr', locale: 'de-CH', name: 'Swiss Franc' },
        SEK: { symbol: 'kr', locale: 'sv-SE', name: 'Swedish Krona' },
        NOK: { symbol: 'kr', locale: 'nb-NO', name: 'Norwegian Krone' },
        DKK: { symbol: 'kr', locale: 'da-DK', name: 'Danish Krone' },
        NZD: { symbol: 'NZ$', locale: 'en-NZ', name: 'New Zealand Dollar' },
        SGD: { symbol: 'S$', locale: 'en-SG', name: 'Singapore Dollar' },
        HKD: { symbol: 'HK$', locale: 'en-HK', name: 'Hong Kong Dollar' },
        MXN: { symbol: 'MX$', locale: 'es-MX', name: 'Mexican Peso' },
        ZAR: { symbol: 'R', locale: 'en-ZA', name: 'South African Rand' },
        TRY: { symbol: '₺', locale: 'tr-TR', name: 'Turkish Lira' },
        RUB: { symbol: '₽', locale: 'ru-RU', name: 'Russian Ruble' },
        PLN: { symbol: 'zł', locale: 'pl-PL', name: 'Polish Zloty' },
        THB: { symbol: '฿', locale: 'th-TH', name: 'Thai Baht' },
        IDR: { symbol: 'Rp', locale: 'id-ID', name: 'Indonesian Rupiah' },
        MYR: { symbol: 'RM', locale: 'ms-MY', name: 'Malaysian Ringgit' },
        PHP: { symbol: '₱', locale: 'en-PH', name: 'Philippine Peso' },
        VND: { symbol: '₫', locale: 'vi-VN', name: 'Vietnamese Dong' },
        TWD: { symbol: 'NT$', locale: 'zh-TW', name: 'Taiwan Dollar' },
        AED: { symbol: 'د.إ', locale: 'ar-AE', name: 'UAE Dirham' },
        SAR: { symbol: '﷼', locale: 'ar-SA', name: 'Saudi Riyal' },
        QAR: { symbol: 'QR', locale: 'ar-QA', name: 'Qatari Riyal' },
        KWD: { symbol: 'د.ك', locale: 'ar-KW', name: 'Kuwaiti Dinar' },
        BHD: { symbol: 'BD', locale: 'ar-BH', name: 'Bahraini Dinar' },
        OMR: { symbol: '﷼', locale: 'ar-OM', name: 'Omani Rial' },
        EGP: { symbol: 'E£', locale: 'ar-EG', name: 'Egyptian Pound' },
        NGN: { symbol: '₦', locale: 'en-NG', name: 'Nigerian Naira' },
        KES: { symbol: 'KSh', locale: 'en-KE', name: 'Kenyan Shilling' },
        GHS: { symbol: 'GH₵', locale: 'en-GH', name: 'Ghanaian Cedi' },
        PKR: { symbol: '₨', locale: 'en-PK', name: 'Pakistani Rupee' },
        BDT: { symbol: '৳', locale: 'bn-BD', name: 'Bangladeshi Taka' },
        LKR: { symbol: 'Rs', locale: 'si-LK', name: 'Sri Lankan Rupee' },
        NPR: { symbol: 'Rs', locale: 'ne-NP', name: 'Nepalese Rupee' },
        MMK: { symbol: 'K', locale: 'my-MM', name: 'Myanmar Kyat' },
        ARS: { symbol: 'AR$', locale: 'es-AR', name: 'Argentine Peso' },
        CLP: { symbol: 'CL$', locale: 'es-CL', name: 'Chilean Peso' },
        COP: { symbol: 'CO$', locale: 'es-CO', name: 'Colombian Peso' },
        PEN: { symbol: 'S/', locale: 'es-PE', name: 'Peruvian Sol' },
        UAH: { symbol: '₴', locale: 'uk-UA', name: 'Ukrainian Hryvnia' },
        CZK: { symbol: 'Kč', locale: 'cs-CZ', name: 'Czech Koruna' },
        HUF: { symbol: 'Ft', locale: 'hu-HU', name: 'Hungarian Forint' },
        RON: { symbol: 'lei', locale: 'ro-RO', name: 'Romanian Leu' },
        ILS: { symbol: '₪', locale: 'he-IL', name: 'Israeli Shekel' },
        JOD: { symbol: 'JD', locale: 'ar-JO', name: 'Jordanian Dinar' },
    },

    getCurrencyInfo() {
        const code = Storage.getCurrency();
        return this.CURRENCY_MAP[code] || this.CURRENCY_MAP['INR'];
    },

    getCurrencySymbol() {
        return this.getCurrencyInfo().symbol;
    },

    formatCurrency(amount) {
        const info = this.getCurrencyInfo();
        return info.symbol + Number(amount).toLocaleString(info.locale);
    },

    formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    },

    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast-msg ' + type;

        const config = {
            success: { icon: 'bi-check-circle-fill', title: 'Success' },
            error:   { icon: 'bi-exclamation-triangle-fill', title: 'Deleted' },
            info:    { icon: 'bi-pencil-fill', title: 'Updated' },
        };
        const c = config[type] || config.success;

        toast.innerHTML = `
            <div class="toast-body">
                <div class="toast-icon-wrap"><i class="bi ${c.icon} toast-icon"></i></div>
                <div class="toast-content">
                    <div class="toast-title">${c.title}</div>
                    <div class="toast-text">${this.escapeHtml(message)}</div>
                </div>
                <button class="toast-close"><i class="bi bi-x-lg"></i></button>
            </div>
            <div class="toast-progress"><div class="toast-progress-bar"></div></div>`;

        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        });
        container.appendChild(toast);
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('removing');
                setTimeout(() => toast.remove(), 300);
            }
        }, 2500);
    },

    updateSummaryCards(transactions) {
        const totals = Finance.getTotals(transactions);
        const monthExp = Finance.getCurrentMonthExpense(transactions);
        const el1 = document.getElementById('totalBalance');
        const el2 = document.getElementById('totalIncome');
        const el3 = document.getElementById('totalExpense');
        const el4 = document.getElementById('monthExpense');
        if (el1) el1.textContent = this.formatCurrency(totals.balance);
        if (el2) el2.textContent = this.formatCurrency(totals.income);
        if (el3) el3.textContent = this.formatCurrency(totals.expense);
        if (el4) el4.textContent = this.formatCurrency(monthExp);
    },

    renderRecentTransactions(transactions) {
        const container = document.getElementById('recentTransactions');
        if (!container) return;
        const recent = transactions.slice(0, 8);

        if (recent.length === 0) {
            container.innerHTML = '<p class="empty-state">No transactions yet. Add your first one!</p>';
            return;
        }

        container.innerHTML = recent.map(t => {
            const icon = CATEGORY_ICONS[t.category] || '⋯';
            const catColor = CATEGORY_COLORS[t.category] || CATEGORY_COLORS['Other'];
            return `
                <div class="tx-item">
                    <div class="tx-icon" style="background:${catColor.bg}"><span class="tx-emoji">${icon}</span></div>
                    <div class="tx-details">
                        <div class="tx-category">${this.escapeHtml(t.category)}</div>
                        <div class="tx-note">${this.escapeHtml(t.note || '—')}</div>
                    </div>
                    <div class="tx-meta">
                        <div class="tx-amount ${t.type}">${t.type === 'income' ? '+' : '-'}${this.formatCurrency(t.amount)}</div>
                        <div class="tx-date">${this.formatDate(t.date)}</div>
                    </div>
                    <div class="tx-actions">
                        <button class="btn-edit" data-id="${this.escapeHtml(t.id)}" title="Edit"><i class="bi bi-pencil"></i></button>
                        <button class="btn-delete" data-id="${this.escapeHtml(t.id)}" title="Delete"><i class="bi bi-trash3"></i></button>
                    </div>
                </div>`;
        }).join('');
    },

    renderHistoryTable(transactions) {
        const tbody = document.getElementById('historyTableBody');
        if (!tbody) return;
        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No transactions found.</td></tr>';
            return;
        }

        tbody.innerHTML = transactions.map(t => {
            const icon = CATEGORY_ICONS[t.category] || '⋯';
            const catColor = CATEGORY_COLORS[t.category] || CATEGORY_COLORS['Other'];
            return `
            <tr>
                <td>${this.formatDate(t.date)}</td>
                <td><span class="category-badge" style="background:${catColor.bg};color:${catColor.color}"><span class="cat-emoji">${icon}</span> ${this.escapeHtml(t.category)}</span></td>
                <td>${this.escapeHtml(t.note || '—')}</td>
                <td class="tx-amount ${t.type}">${t.type === 'income' ? '+' : '-'}${this.formatCurrency(t.amount)}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-edit" data-id="${this.escapeHtml(t.id)}" title="Edit"><i class="bi bi-pencil"></i></button>
                        <button class="btn-delete" data-id="${this.escapeHtml(t.id)}" title="Delete"><i class="bi bi-trash3"></i></button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    },

    populateCategoryDropdown(type) {
        const select = document.getElementById('txCategory');
        if (!select) return;
        const cats = CATEGORIES[type] || [];
        select.innerHTML = '<option value="">Select category</option>' +
            cats.map(c => {
                const icon = CATEGORY_ICONS[c] || 'bi-three-dots';
                return `<option value="${c}">${c}</option>`;
            }).join('');
    },

    populateFilterCategories() {
        const select = document.getElementById('filterCategory');
        if (!select) return;
        const allCats = [...new Set([...CATEGORIES.expense, ...CATEGORIES.income])];
        select.innerHTML = '<option value="all">All Categories</option>' +
            allCats.map(c => `<option value="${c}">${c}</option>`).join('');
    },

    renderBudgetProgress(transactions) {
        const container = document.getElementById('budgetProgressContainer');
        if (!container) return;
        const now = new Date();
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const budgets = Storage.getBudgets();
        const budgetAmount = budgets[monthKey];

        if (!budgetAmount) {
            container.innerHTML = '<p class="empty-state">No budget set for this month. Set one above!</p>';
            return;
        }

        const spent = Finance.getCurrentMonthExpense(transactions);
        const pct = Math.min((spent / budgetAmount) * 100, 100);
        const cls = pct >= 90 ? 'danger' : pct >= 70 ? 'warning' : '';

        container.innerHTML = `
            <div class="budget-bar">
                <div class="budget-labels">
                    <span class="spent">Spent: ${this.formatCurrency(spent)}</span>
                    <span class="limit">Budget: ${this.formatCurrency(budgetAmount)}</span>
                </div>
                <div class="progress-track">
                    <div class="progress-fill ${cls}" style="width: ${pct}%"></div>
                </div>
                <div class="budget-percent">${pct.toFixed(1)}% used</div>
            </div>`;
    },

    setCurrentDate() {
        const el = document.getElementById('currentDate');
        if (el) {
            el.textContent = new Date().toLocaleDateString('en-IN', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
        }
    },

    escapeHtml(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(String(str)));
        return div.innerHTML;
    }
};
