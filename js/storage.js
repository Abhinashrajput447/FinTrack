// ===== LOCAL STORAGE MANAGER =====
const Storage = {
    KEYS: {
        TRANSACTIONS: 'fintrack_transactions',
        BUDGETS: 'fintrack_budgets',
        THEME: 'fintrack_theme',
        CURRENCY: 'fintrack_currency',
        CUSTOM_CATEGORIES: 'fintrack_custom_categories',
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
    },

    // Custom Categories Management
    getCustomCategories() {
        const data = localStorage.getItem(this.KEYS.CUSTOM_CATEGORIES);
        return data ? JSON.parse(data) : { expense: [], income: [] };
    },

    saveCustomCategories(categories) {
        localStorage.setItem(this.KEYS.CUSTOM_CATEGORIES, JSON.stringify(categories));
    },

    addCustomCategory(type, categoryName) {
        if (!categoryName || !categoryName.trim()) return false;
        
        const categories = this.getCustomCategories();
        const sanitized = categoryName.trim().substring(0, 30);
        
        if (!categories[type]) categories[type] = [];
        if (categories[type].includes(sanitized)) return false; // Already exists
        
        categories[type].push(sanitized);
        this.saveCustomCategories(categories);
        return true;
    }
};
