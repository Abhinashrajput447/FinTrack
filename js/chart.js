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

    getCategoryColors(count) {
        if (count <= this.colors.length) return this.colors.slice(0, count);

        const generated = [];
        for (let i = 0; i < count; i++) {
            const hue = Math.round((i * 360) / count);
            generated.push(`hsl(${hue}, 72%, 52%)`);
        }
        return generated;
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

        const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
        const total = sorted.reduce((sum, [, amount]) => sum + amount, 0);
        const maxSlices = 5;
        const minShare = 0.08; // 8% minimum share to get own slice

        const major = [];
        const minor = [];

        sorted.forEach((entry, idx) => {
            const share = total > 0 ? entry[1] / total : 0;
            if (idx < maxSlices && share >= minShare) major.push(entry);
            else minor.push(entry);
        });

        let labels = major.map(([name]) => name);
        let data = major.map(([, amount]) => amount);

        if (minor.length > 0) {
            const otherTotal = minor.reduce((sum, [, amount]) => sum + amount, 0);
            labels.push('Other');
            data.push(otherTotal);
        }

        // Keep at least one slice if everything is tiny.
        if (labels.length === 0 && sorted.length > 0) {
            labels = [sorted[0][0], 'Other'];
            data = [sorted[0][1], sorted.slice(1).reduce((sum, [, amount]) => sum + amount, 0)];
            if (data[1] === 0) {
                labels = [sorted[0][0]];
                data = [sorted[0][1]];
            }
        }

        if (labels.length === 0) {
            labels = ['No expenses this month'];
            data = [1];
        }

        const palette = labels[0] === 'No expenses this month'
            ? ['#94a3b8']
            : this.getCategoryColors(labels.length);

        this.instances['categoryChart'] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: palette,
                    borderWidth: 0,
                    hoverOffset: 6,
                }]
            },
            options: {
                responsive: true,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: this.getTextColor(),
                            padding: 12,
                            usePointStyle: true,
                            pointStyleWidth: 9,
                            boxWidth: 8,
                            font: { size: 12 },
                        }
                    },
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
            type: 'doughnut',
            data: {
                labels,
                datasets: [{ data, backgroundColor: this.colors.slice(0, labels.length), borderWidth: 0, hoverOffset: 6 }]
            },
            options: {
                responsive: true,
                cutout: '60%',
                plugins: { legend: { position: 'bottom', labels: { color: this.getTextColor(), padding: 16, usePointStyle: true, pointStyleWidth: 10 } } }
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
