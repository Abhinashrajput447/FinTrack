// ===== CHART MANAGER =====
const Charts = {
    instances: {},

    colors: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'],

    destroy(id) {
        if (this.instances[id]) {
            this.instances[id].destroy();
            delete this.instances[id];
        }
    },

    getCtx(id) {
        const el = document.getElementById(id);
        return el ? el.getContext('2d') : null;
    },

    getTextColor() {
        return getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#1a1a2e';
    },

    getGridColor() {
        return getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#e5e7eb';
    },

    renderWeeklyChart(days, amounts) {
        const ctx = this.getCtx('weeklyChart');
        if (!ctx) return;
        this.destroy('weeklyChart');

        this.instances['weeklyChart'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: days,
                datasets: [{
                    label: 'Expense (' + UI.getCurrencySymbol() + ')',
                    data: amounts,
                    backgroundColor: 'rgba(99, 102, 241, 0.7)',
                    borderRadius: 6,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: this.getGridColor() }, ticks: { color: this.getTextColor() } },
                    x: { grid: { display: false }, ticks: { color: this.getTextColor() } },
                }
            }
        });
    },

    renderCategoryChart(categoryTotals) {
        const ctx = this.getCtx('categoryChart');
        if (!ctx) return;
        this.destroy('categoryChart');

        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);

        this.instances['categoryChart'] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: this.colors.slice(0, labels.length),
                    borderWidth: 0,
                    hoverOffset: 6,
                }]
            },
            options: {
                responsive: true,
                cutout: '65%',
                plugins: {
                    legend: { position: 'bottom', labels: { color: this.getTextColor(), padding: 16, usePointStyle: true, pointStyleWidth: 10 } },
                }
            }
        });
    },

    renderMonthlyCompare(labels, income, expense) {
        const ctx = this.getCtx('monthlyCompareChart');
        if (!ctx) return;
        this.destroy('monthlyCompareChart');

        this.instances['monthlyCompareChart'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    { label: 'Income', data: income, backgroundColor: 'rgba(16, 185, 129, 0.7)', borderRadius: 6, borderSkipped: false },
                    { label: 'Expense', data: expense, backgroundColor: 'rgba(239, 68, 68, 0.7)', borderRadius: 6, borderSkipped: false },
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: this.getTextColor(), usePointStyle: true, pointStyleWidth: 10 } } },
                scales: {
                    y: { beginAtZero: true, grid: { color: this.getGridColor() }, ticks: { color: this.getTextColor() } },
                    x: { grid: { display: false }, ticks: { color: this.getTextColor() } },
                }
            }
        });
    },

    renderTopCategories(categoryTotals) {
        const ctx = this.getCtx('topCategoriesChart');
        if (!ctx) return;
        this.destroy('topCategoriesChart');

        const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 6);
        const labels = sorted.map(s => s[0]);
        const data = sorted.map(s => s[1]);

        this.instances['topCategoriesChart'] = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels,
                datasets: [{ data, backgroundColor: this.colors.slice(0, labels.length).map(c => c + 'cc'), borderWidth: 0 }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom', labels: { color: this.getTextColor(), padding: 12, usePointStyle: true, pointStyleWidth: 10 } } },
                scales: { r: { display: false } }
            }
        });
    },

    renderDailyTrend(labels, amounts) {
        const ctx = this.getCtx('dailyTrendChart');
        if (!ctx) return;
        this.destroy('dailyTrendChart');

        this.instances['dailyTrendChart'] = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Daily Spending',
                    data: amounts,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 5,
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: this.getGridColor() }, ticks: { color: this.getTextColor() } },
                    x: { grid: { display: false }, ticks: { color: this.getTextColor(), maxTicksLimit: 10 } },
                }
            }
        });
    },
};
