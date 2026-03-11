// ===== EXPORT REPORT LOGIC =====
const ExportReport = {

    getFilteredTransactions() {
        const month = document.getElementById('exportMonth').value;
        const type = document.getElementById('exportType').value;
        const category = document.getElementById('exportCategory').value;
        let txs = Finance.getAll();

        if (month) {
            const [y, m] = month.split('-').map(Number);
            txs = txs.filter(t => {
                const d = new Date(t.date);
                return d.getFullYear() === y && d.getMonth() === m - 1;
            });
        }

        if (type !== 'all') {
            txs = txs.filter(t => t.type === type);
        }

        if (category !== 'all') {
            txs = txs.filter(t => t.category === category);
        }

        return txs.sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    populateExportCategories() {
        const select = document.getElementById('exportCategory');
        const type = document.getElementById('exportType').value;
        let cats;
        if (type === 'expense') cats = CATEGORIES.expense;
        else if (type === 'income') cats = CATEGORIES.income;
        else cats = [...new Set([...CATEGORIES.expense, ...CATEGORIES.income])];

        const current = select.value;
        select.innerHTML = '<option value="all">All Categories</option>' +
            cats.map(c => {
                const icon = CATEGORY_ICONS[c] || '⋯';
                return `<option value="${c}">${icon} ${c}</option>`;
            }).join('');
        // Restore selection if still valid
        if ([...select.options].some(o => o.value === current)) select.value = current;
    },

    renderPreview() {
        const txs = this.getFilteredTransactions();
        const tbody = document.getElementById('exportTableBody');
        const countEl = document.getElementById('exportCount');
        const btnCSV = document.getElementById('btnExportCSV');
        const btnPDF = document.getElementById('btnExportPDF');

        countEl.textContent = txs.length + ' transaction' + (txs.length !== 1 ? 's' : '');

        // Summary
        const totals = Finance.getTotals(txs);
        document.getElementById('exportIncome').textContent = UI.formatCurrency(totals.income);
        document.getElementById('exportExpense').textContent = UI.formatCurrency(totals.expense);
        document.getElementById('exportBalance').textContent = UI.formatCurrency(totals.balance);

        if (txs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No transactions found for selected filters.</td></tr>';
            btnCSV.disabled = true;
            btnPDF.disabled = true;
            return;
        }

        btnCSV.disabled = false;
        btnPDF.disabled = false;

        tbody.innerHTML = txs.map(t => {
            const icon = CATEGORY_ICONS[t.category] || '⋯';
            const catColor = CATEGORY_COLORS[t.category] || CATEGORY_COLORS['Other'];
            return `
            <tr>
                <td>${UI.formatDate(t.date)}</td>
                <td><span class="type-badge ${t.type}">${t.type === 'income' ? 'Income' : 'Expense'}</span></td>
                <td><span class="category-badge" style="background:${catColor.bg};color:${catColor.color}"><span class="cat-emoji">${icon}</span> ${UI.escapeHtml(t.category)}</span></td>
                <td>${UI.escapeHtml(t.note || '—')}</td>
                <td class="tx-amount ${t.type}">${t.type === 'income' ? '+' : '-'}${UI.formatCurrency(t.amount)}</td>
            </tr>`;
        }).join('');
    },

    downloadCSV() {
        const txs = this.getFilteredTransactions();
        if (txs.length === 0) return;

        const symbol = UI.getCurrencySymbol();
        const header = ['Date', 'Type', 'Category', 'Note', 'Amount (' + symbol + ')'];
        const rows = txs.map(t => [
            t.date,
            t.type.charAt(0).toUpperCase() + t.type.slice(1),
            t.category,
            '"' + (t.note || '').replace(/"/g, '""') + '"',
            (t.type === 'income' ? '' : '-') + t.amount.toFixed(2),
        ]);

        // Add summary rows
        const totals = Finance.getTotals(txs);
        rows.push([]);
        rows.push(['', '', '', 'Total Income', totals.income.toFixed(2)]);
        rows.push(['', '', '', 'Total Expenses', '-' + totals.expense.toFixed(2)]);
        rows.push(['', '', '', 'Net Balance', totals.balance.toFixed(2)]);

        const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const monthVal = document.getElementById('exportMonth').value;
        const categoryVal = document.getElementById('exportCategory').value;

        const a = document.createElement('a');
        a.href = url;
        let filename = 'FinTrack_Report';
        if (monthVal) filename += '_' + monthVal;
        if (categoryVal !== 'all') filename += '_' + categoryVal;
        a.download = filename + '.csv';
        a.click();
        URL.revokeObjectURL(url);

        UI.showToast('CSV report downloaded!', 'success');
    },

    downloadPDF() {
        const txs = this.getFilteredTransactions();
        if (txs.length === 0) return;

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const symbol = UI.getCurrencySymbol();
        const monthVal = document.getElementById('exportMonth').value;
        const categoryVal = document.getElementById('exportCategory').value;
        const totals = Finance.getTotals(txs);

        // Title
        doc.setFontSize(20);
        doc.setTextColor(79, 70, 229);
        doc.text('FinTrack', 14, 20);

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        const reportTitle = categoryVal !== 'all' ? categoryVal + ' — Expense Report' : 'Expense Report';
        doc.text(reportTitle, 14, 28);

        // Month & date info
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        let subtitle = 'Generated on ' + new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        if (monthVal) {
            const [y, m] = monthVal.split('-');
            const monthName = new Date(y, m - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
            subtitle = 'Month: ' + monthName + '  |  ' + subtitle;
        }
        if (categoryVal !== 'all') {
            subtitle = 'Category: ' + categoryVal + '  |  ' + subtitle;
        }
        doc.text(subtitle, 14, 35);

        // Summary box
        doc.setDrawColor(230, 230, 230);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, 40, 182, 18, 3, 3, 'FD');

        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('Total Income', 24, 48);
        doc.text('Total Expenses', 84, 48);
        doc.text('Net Balance', 148, 48);

        doc.setFontSize(11);
        doc.setTextColor(16, 185, 129);
        doc.text(symbol + totals.income.toLocaleString(), 24, 54);
        doc.setTextColor(239, 68, 68);
        doc.text(symbol + totals.expense.toLocaleString(), 84, 54);
        doc.setTextColor(79, 70, 229);
        doc.text(symbol + totals.balance.toLocaleString(), 148, 54);

        // Table
        const tableData = txs.map(t => [
            t.date,
            t.type.charAt(0).toUpperCase() + t.type.slice(1),
            t.category,
            (t.note || '—').substring(0, 30),
            (t.type === 'income' ? '+' : '-') + symbol + t.amount.toLocaleString(),
        ]);

        doc.autoTable({
            startY: 64,
            head: [['Date', 'Type', 'Category', 'Note', 'Amount']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [79, 70, 229],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 9,
            },
            bodyStyles: {
                fontSize: 8.5,
                textColor: [50, 50, 50],
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252],
            },
            columnStyles: {
                0: { cellWidth: 28 },
                1: { cellWidth: 22 },
                2: { cellWidth: 32 },
                3: { cellWidth: 55 },
                4: { halign: 'right', cellWidth: 35 },
            },
            margin: { left: 14, right: 14 },
            didParseCell: function (data) {
                if (data.section === 'body' && data.column.index === 4) {
                    const val = data.cell.raw;
                    if (val.startsWith('+')) data.cell.styles.textColor = [16, 185, 129];
                    else data.cell.styles.textColor = [239, 68, 68];
                }
                if (data.section === 'body' && data.column.index === 1) {
                    const val = data.cell.raw;
                    data.cell.styles.textColor = val === 'Income' ? [16, 185, 129] : [239, 68, 68];
                }
            },
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(160, 160, 160);
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text('FinTrack — Personal Finance Tracker', 14, doc.internal.pageSize.height - 10);
            doc.text('Page ' + i + ' of ' + pageCount, doc.internal.pageSize.width - 35, doc.internal.pageSize.height - 10);
        }

        let filename = 'FinTrack_Report';
        if (monthVal) filename += '_' + monthVal;
        if (categoryVal !== 'all') filename += '_' + categoryVal;
        doc.save(filename + '.pdf');

        UI.showToast('PDF report downloaded!', 'success');
    },
};
