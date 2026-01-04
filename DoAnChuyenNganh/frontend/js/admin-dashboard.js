// Professional Admin Dashboard - Laptop World
const API_BASE = window.location.protocol === 'file:' 
    ? 'http://localhost:3000' 
    : (window.location.port === '3000' ? '' : 'http://localhost:3000');
const API_URL = API_BASE + '/api';

let charts = {};

document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    loadDashboard();
});

function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.vaiTro !== 'admin') {
        alert('Bạn cần đăng nhập với quyền admin!');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

async function loadDashboard() {
    const month = document.getElementById('monthFilter').value;
    const year = document.getElementById('yearFilter').value;
    
    try {
        const token = localStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        let params = `year=${year}`;
        if (month) params += `&month=${month}`;
        
        const response = await fetch(`${API_URL}/admin/statistics?${params}`, { headers });
        const result = await response.json();
        
        if (result.success) {
            updateStats(result.data);
            updateCharts(result.data);
            updateReportTable(result.data);
        } else {
            alert('Không có dữ liệu');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Lỗi khi tải dữ liệu');
    }
}

function updateStats(data) {
    // Doanh thu
    document.getElementById('revenue').textContent = formatNumber(data.totalRevenue / 1000000);
    document.getElementById('revenuePlan').textContent = '120%';
    updatePercent('revenueYoY', data.revenueChange || 0);
    
    // Lợi nhuận gộp (giả sử 25% doanh thu)
    const grossProfit = data.totalRevenue * 0.25;
    document.getElementById('grossProfit').textContent = formatNumber(grossProfit / 1000000);
    document.getElementById('profitPlan').textContent = '128%';
    updatePercent('profitYoY', data.revenueChange * 0.9 || 0);
    
    // Hàng tồn kho
    document.getElementById('inventory').textContent = formatNumber(data.totalProducts || 0);
    updatePercent('inventoryYoY', -15);
    
    // Phải thu
    document.getElementById('receivables').textContent = formatNumber(data.totalOrders || 0);
    updatePercent('receivablesYoY', 25);
    
    // Đơn hàng
    document.getElementById('orders').textContent = formatNumber(data.totalOrders || 0);
    updatePercent('ordersYoY', data.ordersChange || 0);
}

function updatePercent(elementId, value) {
    const element = document.getElementById(elementId);
    element.className = `stat-percent ${value >= 0 ? 'positive' : 'negative'}`;
    element.textContent = (value >= 0 ? '+' : '') + value.toFixed(0) + '%';
}

function updateCharts(data) {
    createProfitMarginChart(data);
    createGrossProfitChart(data);
    createCompletionChart(data);
    createCashCycleChart(data);
    createRevenueExpenseChart(data);
}

function createProfitMarginChart(data) {
    const ctx = document.getElementById('profitMarginChart');
    if (charts.profitMargin) charts.profitMargin.destroy();
    
    const currentMargin = 27;
    const prevMargin = 23;
    
    charts.profitMargin = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Tháng này', 'Kỳ trước', 'Năm trước'],
            datasets: [{
                data: [currentMargin, prevMargin, 6],
                backgroundColor: ['#3b82f6', '#f59e0b', '#9ca3af'],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => context.parsed.y + '%'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 30,
                    ticks: {
                        callback: (value) => value + '%'
                    }
                }
            }
        }
    });
}

function createGrossProfitChart(data) {
    const ctx = document.getElementById('grossProfitChart');
    if (charts.grossProfit) charts.grossProfit.destroy();
    
    const profitMargin = 45;
    
    charts.grossProfit = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Lợi nhuận', 'Chi phí'],
            datasets: [{
                data: [profitMargin, 100 - profitMargin],
                backgroundColor: ['#10b981', '#e5e7eb'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => context.label + ': ' + context.parsed + '%'
                    }
                }
            }
        },
        plugins: [{
            id: 'centerText',
            beforeDraw: (chart) => {
                const ctx = chart.ctx;
                ctx.save();
                const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
                const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
                ctx.font = 'bold 24px Inter';
                ctx.fillStyle = '#333';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(profitMargin + '%', centerX, centerY);
                ctx.restore();
            }
        }]
    });
}

function createCompletionChart(data) {
    const ctx = document.getElementById('completionChart');
    if (charts.completion) charts.completion.destroy();
    
    const completionRate = data.completionRate || 87;
    
    charts.completion = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Hoàn thành', 'Chưa hoàn thành'],
            datasets: [{
                data: [completionRate, 100 - completionRate],
                backgroundColor: ['#3b82f6', '#e5e7eb'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { display: false }
            }
        },
        plugins: [{
            id: 'centerText',
            beforeDraw: (chart) => {
                const ctx = chart.ctx;
                ctx.save();
                const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
                const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
                ctx.font = 'bold 24px Inter';
                ctx.fillStyle = '#333';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(completionRate.toFixed(0) + '%', centerX, centerY);
                ctx.restore();
            }
        }]
    });
}

function createCashCycleChart(data) {
    const ctx = document.getElementById('cashCycleChart');
    if (charts.cashCycle) charts.cashCycle.destroy();
    
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const dso = Array(12).fill(0).map(() => Math.floor(Math.random() * 10) + 40);
    const dio = Array(12).fill(0).map(() => Math.floor(Math.random() * 10) + 35);
    const ccc = dso.map((d, i) => d + dio[i] - 10);
    
    charts.cashCycle = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'DSO (Ngày thu tiền)',
                    data: dso,
                    backgroundColor: '#06b6d4',
                    stack: 'stack1'
                },
                {
                    label: 'DIO (Ngày tồn kho)',
                    data: dio,
                    backgroundColor: '#ef4444',
                    stack: 'stack1'
                },
                {
                    label: 'CCC (Vòng quay tiền)',
                    data: ccc,
                    type: 'line',
                    borderColor: '#1f2937',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { font: { size: 10 } }
                }
            },
            scales: {
                y: {
                    stacked: true,
                    beginAtZero: true
                },
                y1: {
                    position: 'right',
                    beginAtZero: true,
                    grid: { display: false }
                }
            }
        }
    });
}

function createRevenueExpenseChart(data) {
    const ctx = document.getElementById('revenueExpenseChart');
    if (charts.revenueExpense) charts.revenueExpense.destroy();
    
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const monthlyData = data.monthlyRevenue || [];
    
    const revenues = months.map((_, i) => {
        const m = monthlyData.find(d => d.month === i + 1);
        return m ? m.revenue / 1000000 : 0;
    });
    
    const expenses = revenues.map(r => r * 0.75);
    
    charts.revenueExpense = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Doanh thu',
                    data: revenues,
                    backgroundColor: '#10b981',
                    stack: 'stack1'
                },
                {
                    label: 'Chi phí',
                    data: expenses,
                    backgroundColor: '#f59e0b',
                    stack: 'stack2'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { font: { size: 11 } }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => context.dataset.label + ': ' + context.parsed.y.toFixed(0) + ' triệu'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => value + 'M'
                    }
                }
            }
        }
    });
}

function updateReportTable(data) {
    const tbody = document.getElementById('reportTableBody');
    
    const metrics = [
        { label: 'Doanh thu thuần', value: data.totalRevenue, plan: 20, yoy: 211 },
        { label: 'Giá vốn', value: data.totalRevenue * 0.55, plan: -15, yoy: 114 },
        { label: 'Lợi nhuận gộp', value: data.totalRevenue * 0.45, plan: 28, yoy: 594 },
        { label: 'Chi phí bán hàng', value: data.totalRevenue * 0.15, plan: 14, yoy: 107 },
        { label: 'Lợi nhuận ròng', value: data.totalRevenue * 0.25, plan: 41, yoy: 1425 }
    ];
    
    tbody.innerHTML = metrics.map(m => `
        <tr>
            <td><strong>${m.label}</strong></td>
            <td class="text-end">${formatNumber(m.value / 1000000)}</td>
            <td class="text-center ${m.plan >= 0 ? 'trend-up' : 'trend-down'}">
                ${m.plan >= 0 ? '+' : ''}${m.plan}%
                <i class="fas fa-caret-${m.plan >= 0 ? 'up' : 'down'}"></i>
            </td>
            <td class="text-center ${m.yoy >= 0 ? 'trend-up' : 'trend-down'}">
                ${m.yoy >= 0 ? '+' : ''}${m.yoy}%
                <i class="fas fa-caret-${m.yoy >= 0 ? 'up' : 'down'}"></i>
            </td>
        </tr>
    `).join('');
}

function formatNumber(num) {
    return Math.round(num).toLocaleString('vi-VN');
}

function exportExcel() {
    alert('Chức năng xuất Excel đang phát triển!');
}

function exportPDF() {
    alert('Chức năng xuất PDF đang phát triển!');
}
