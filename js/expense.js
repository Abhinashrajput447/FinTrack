// ===== EXPENSE / TRANSACTION LOGIC =====
const CATEGORIES = {
    expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Rent', 'Other'],
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Refund', 'Other'],
};

const CATEGORY_ICONS = {
    Food: '🍔',
    Transport: '🚕',
    Shopping: '🛒',
    Bills: '💡',
    Entertainment: '🎮',
    Health: '❤️‍🩹',
    Education: '🎓',
    Rent: '🏠',
    Salary: '💼',
    Freelance: '💻',
    Investment: '📈',
    Gift: '🎁',
    Refund: '↩️',
    Other: '⋯',
};

const CATEGORY_COLORS = {
    Food: { bg: 'rgba(249, 115, 22, 0.12)', color: '#f97316' },
    Transport: { bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' },
    Shopping: { bg: 'rgba(168, 85, 247, 0.12)', color: '#a855f7' },
    Bills: { bg: 'rgba(234, 179, 8, 0.12)', color: '#eab308' },
    Entertainment: { bg: 'rgba(236, 72, 153, 0.12)', color: '#ec4899' },
    Health: { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' },
    Education: { bg: 'rgba(20, 184, 166, 0.12)', color: '#14b8a6' },
    Rent: { bg: 'rgba(99, 102, 241, 0.12)', color: '#6366f1' },
    Salary: { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981' },
    Freelance: { bg: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4' },
    Investment: { bg: 'rgba(34, 197, 94, 0.12)', color: '#22c55e' },
    Gift: { bg: 'rgba(244, 63, 94, 0.12)', color: '#f43f5e' },
    Refund: { bg: 'rgba(100, 116, 139, 0.12)', color: '#64748b' },
    Other: { bg: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8' },
};

const Finance = {
    getAll() {
        return Storage.getTransactions();
    },

    canAffordExpense(amount, excludeId = null) {
        const amt = Number(amount);
        if (!Number.isFinite(amt) || amt <= 0) return false;

        let txs = this.getAll();
        if (excludeId) {
            txs = txs.filter(t => t.id !== excludeId);
        }

        const balance = this.getTotals(txs).balance;
        return amt <= balance;
    },

    add(type, amount, category, date, note) {
        const amt = Number(amount);
        if (!Number.isFinite(amt) || amt <= 0) {
            throw new Error('Please enter a valid amount greater than 0.');
        }

        if (type === 'expense' && !this.canAffordExpense(amt)) {
            throw new Error('Your balance is not enough for this expense.');
        }

        return Storage.addTransaction({ type, amount: amt, category, date, note: note || '' });
    },

    remove(id) {
        Storage.deleteTransaction(id);
    },

    update(id, type, amount, category, date, note) {
        const amt = Number(amount);
        if (!Number.isFinite(amt) || amt <= 0) {
            throw new Error('Please enter a valid amount greater than 0.');
        }

        if (type === 'expense' && !this.canAffordExpense(amt, id)) {
            throw new Error('Your balance is not enough for this expense.');
        }

        Storage.updateTransaction(id, { type, amount: amt, category, date, note: note || '' });
    },

    getTotals(transactions) {
        let income = 0, expense = 0;
        transactions.forEach(t => {
            if (t.type === 'income') income += t.amount;
            else expense += t.amount;
        });
        return { income, expense, balance: income - expense };
    },

    getMonthTransactions(transactions, year, month) {
        return transactions.filter(t => {
            const d = new Date(t.date);
            return d.getFullYear() === year && d.getMonth() === month;
        });
    },

    getCurrentMonthExpense(transactions) {
        const now = new Date();
        const monthTxs = this.getMonthTransactions(transactions, now.getFullYear(), now.getMonth());
        return monthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    },

    getCategoryTotals(transactions, type) {
        const map = {};
        transactions.filter(t => t.type === type).forEach(t => {
            map[t.category] = (map[t.category] || 0) + t.amount;
        });
        return map;
    },

    getLast7DaysData(transactions) {
        const days = [];
        const amounts = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
            const dayTotal = transactions
                .filter(t => t.type === 'expense' && t.date === key)
                .reduce((sum, t) => sum + t.amount, 0);
            days.push(label);
            amounts.push(dayTotal);
        }
        return { days, amounts };
    },

    getMonthlyData(transactions) {
        const monthMap = {};
        transactions.forEach(t => {
            const d = new Date(t.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!monthMap[key]) monthMap[key] = { income: 0, expense: 0 };
            monthMap[key][t.type] += t.amount;
        });
        const sortedKeys = Object.keys(monthMap).sort().slice(-6);
        return {
            labels: sortedKeys.map(k => {
                const [y, m] = k.split('-');
                return new Date(y, m - 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
            }),
            income: sortedKeys.map(k => monthMap[k].income),
            expense: sortedKeys.map(k => monthMap[k].expense),
        };
    },

    getDailyTrend(transactions) {
        const last30 = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            const total = transactions
                .filter(t => t.type === 'expense' && t.date === key)
                .reduce((sum, t) => sum + t.amount, 0);
            last30.push({ label: d.getDate().toString(), amount: total });
        }
        return { labels: last30.map(d => d.label), amounts: last30.map(d => d.amount) };
    },

    filter(transactions, { category, type, month }) {
        return transactions.filter(t => {
            if (category && category !== 'all' && t.category !== category) return false;
            if (type && type !== 'all' && t.type !== type) return false;
            if (month) {
                const txMonth = t.date.substring(0, 7);
                if (txMonth !== month) return false;
            }
            return true;
        });
    }
};
