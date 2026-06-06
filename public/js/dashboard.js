let charts = {
    salesByEvent: null,
    revenueOverTime: null,
    topEvents: null,
    eventTypes: null
};

async function loadOverviewStats() {
    try {
        const response = await fetch('/api/statistics/overview');
        const data = await response.json();

        if (data.success) {
            document.getElementById('totalEvents').textContent = data.stats.totalEvents || 0;
            document.getElementById('totalTickets').textContent = data.stats.totalTicketsSold || 0;
            document.getElementById('totalRevenue').textContent = `$${(data.stats.totalRevenue || 0).toFixed(2)}`;
            document.getElementById('totalUsers').textContent = data.stats.totalUsers || 0;
        }
    } catch (error) {
        console.error('Error loading overview stats:', error);
    }
}

async function loadSalesByEventChart() {
    try {
        const response = await fetch('/api/statistics/sales-by-event');
        const data = await response.json();

        if (data.success && data.events.length > 0) {
            const ctx = document.getElementById('salesByEventChart').getContext('2d');

            if (charts.salesByEvent) {
                charts.salesByEvent.destroy();
            }

            charts.salesByEvent = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.events.map(e => e.title),
                    datasets: [{
                        label: 'Tickets Sold',
                        data: data.events.map(e => e.tickets_sold),
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error loading sales by event chart:', error);
    }
}

async function loadRevenueOverTimeChart() {
    try {
        const response = await fetch('/api/statistics/revenue-over-time');
        const data = await response.json();

        if (data.success && data.revenue.length > 0) {
            const ctx = document.getElementById('revenueOverTimeChart').getContext('2d');

            if (charts.revenueOverTime) {
                charts.revenueOverTime.destroy();
            }

            charts.revenueOverTime = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.revenue.map(r => r.date),
                    datasets: [{
                        label: 'Revenue ($)',
                        data: data.revenue.map(r => r.total),
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toFixed(2);
                                }
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error loading revenue over time chart:', error);
    }
}

async function loadTopEventsChart() {
    try {
        const response = await fetch('/api/statistics/top-events');
        const data = await response.json();

        if (data.success && data.events.length > 0) {
            const ctx = document.getElementById('topEventsChart').getContext('2d');

            if (charts.topEvents) {
                charts.topEvents.destroy();
            }

            const colors = [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)'
            ];

            charts.topEvents = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: data.events.map(e => e.title),
                    datasets: [{
                        data: data.events.map(e => e.revenue),
                        backgroundColor: colors,
                        borderColor: colors.map(c => c.replace('0.6', '1')),
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'right'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.label + ': $' + context.parsed.toFixed(2);
                                }
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error loading top events chart:', error);
    }
}

async function loadEventTypesChart() {
    try {
        const response = await fetch('/api/statistics/event-types');
        const data = await response.json();

        if (data.success && data.types.length > 0) {
            const ctx = document.getElementById('eventTypesChart').getContext('2d');

            if (charts.eventTypes) {
                charts.eventTypes.destroy();
            }

            charts.eventTypes = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: data.types.map(t => t.type),
                    datasets: [{
                        data: data.types.map(t => t.count),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(255, 206, 86, 0.6)',
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(153, 102, 255, 0.6)',
                            'rgba(255, 159, 64, 0.6)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error loading event types chart:', error);
    }
}

async function loadRecentPurchases() {
    try {
        const response = await fetch('/api/statistics/recent-purchases');
        const data = await response.json();

        const tbody = document.getElementById('recentPurchasesBody');

        if (data.success && data.purchases.length > 0) {
            tbody.innerHTML = data.purchases.map(purchase => `
                <tr>
                    <td>${new Date(purchase.purchase_date).toLocaleDateString()}</td>
                    <td>${purchase.user_email}</td>
                    <td>${purchase.event_title}</td>
                    <td>${purchase.quantity}</td>
                    <td>$${parseFloat(purchase.total_price).toFixed(2)}</td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="loading">No purchases yet</td></tr>';
        }
    } catch (error) {
        console.error('Error loading recent purchases:', error);
        document.getElementById('recentPurchasesBody').innerHTML =
            '<tr><td colspan="5" class="loading">Error loading purchases</td></tr>';
    }
}

async function initializeDashboard() {
    console.log('📊 Initializing dashboard...');

    await loadOverviewStats();
    await loadSalesByEventChart();
    await loadRevenueOverTimeChart();
    await loadTopEventsChart();
    await loadEventTypesChart();
    await loadRecentPurchases();

    console.log('✅ Dashboard loaded successfully');
}

function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const btnText = this.textContent.trim();

            switch (btnText) {
                case 'Home':
                    window.location.href = '/';
                    break;
                case 'About us':
                    window.location.href = '/about.html';
                    break;
                case 'Contact':
                    window.location.href = '/contact.html';
                    break;
                case 'Favourites':
                    window.location.href = '/favourites.html';
                    break;
                case 'Cart':
                    window.location.href = '/cart.html';
                    break;
                case 'Sign in':
                    window.location.href = '/login.html';
                    break;
                case 'Dashboard':
                    break;
                default:
                    break;
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    setupNavigation();
    initializeDashboard();

    setInterval(initializeDashboard, 30000);
});
