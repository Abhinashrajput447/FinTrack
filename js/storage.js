// ===== LOCAL STORAGE MANAGER =====
const Storage = {
    KEYS: {
        TRANSACTIONS: 'fintrack_transactions',
        BUDGETS: 'fintrack_budgets',
        THEME: 'fintrack_theme',
        CURRENCY: 'fintrack_currency',
    },

    getTransactions() {
        const data = localStorage.getItem(this.KEYS.TRANSACTIONS);
        return data ? JSON.parse(data) : [];
    },

    saveTransactions(transactions) {
        localStorage.setItem(this.KEYS.TRANSACTIONS, JSON.stringify(transactions));
    },

    addTransaction(tx) {
        const transactions = this.getTransactions();
        tx.id = Date.now().toString();
        transactions.unshift(tx);
        this.saveTransactions(transactions);
        return tx;
    },

    deleteTransaction(id) {
        const transactions = this.getTransactions().filter(t => t.id !== id);
        this.saveTransactions(transactions);
    },

    updateTransaction(id, updates) {
        const transactions = this.getTransactions();
        const idx = transactions.findIndex(t => t.id === id);
        if (idx !== -1) {
            transactions[idx] = { ...transactions[idx], ...updates, id };
            this.saveTransactions(transactions);
        }
    },

    getBudgets() {
        const data = localStorage.getItem(this.KEYS.BUDGETS);
        return data ? JSON.parse(data) : {};
    },

    setBudget(monthKey, amount) {
        const budgets = this.getBudgets();
        budgets[monthKey] = amount;
        localStorage.setItem(this.KEYS.BUDGETS, JSON.stringify(budgets));
    },

    getTheme() {
        return localStorage.getItem(this.KEYS.THEME) || 'light';
    },

    setTheme(theme) {
        localStorage.setItem(this.KEYS.THEME, theme);
    },

    getCurrency() {
        return localStorage.getItem(this.KEYS.CURRENCY) || 'INR';
    },

    setCurrency(code) {
        localStorage.setItem(this.KEYS.CURRENCY, code);
    },

    loadSampleData(sampleTransactions) {
        if (this.getTransactions().length === 0 && sampleTransactions.length > 0) {
            this.saveTransactions(sampleTransactions);
        }
    }
};
