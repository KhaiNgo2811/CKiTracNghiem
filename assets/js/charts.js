/**
 * charts.js — Khởi tạo các biểu đồ Chart.js cho trang dashboard
 */

let barChartInstance = null;
let donutChartInstance = null;

/** Vẽ biểu đồ cột số câu đúng/sai theo từng chương */
export function renderBarChart(canvasId, labels, correctData, wrongData) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  if (barChartInstance) barChartInstance.destroy();

  barChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Đúng', data: correctData, backgroundColor: '#4f46e5' },
        { label: 'Sai', data: wrongData, backgroundColor: '#f43f5e' }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } }
      }
    }
  });
}

/** Vẽ biểu đồ donut tỉ lệ đúng/sai tổng thể */
export function renderDonutChart(canvasId, correct, wrong) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  if (donutChartInstance) donutChartInstance.destroy();

  donutChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Đúng', 'Sai'],
      datasets: [{ data: [correct, wrong], backgroundColor: ['#22c55e', '#f43f5e'] }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}
