
// Normal Distribution Chart
let normalChart;

function initNormalChart() {
    const ctx = document.getElementById('normalChart').getContext('2d');
    normalChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Normal Distribution',
                data: [],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { min: -15, max: 15 },
                y: { min: 0, max: 1 } // Fixed Y scale for better comparison
            }
        }
    });
    updateNormalChart();
}

function updateNormalChart() {
    const mu = parseFloat(document.getElementById('range-mu').value);
    const sigma = parseFloat(document.getElementById('range-sigma').value);

    document.getElementById('val-mu').innerText = mu;
    document.getElementById('val-sigma').innerText = sigma;

    // Generate data points
    const labels = [];
    const data = [];
    for (let x = -15; x <= 15; x += 0.5) {
        labels.push(x);
        // Normal PDF formula
        const y = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
        data.push(y);
    }

    normalChart.data.labels = labels;
    normalChart.data.datasets[0].data = data;
    normalChart.update();
}

// CLT Chart
let cltChart;

function initCLTChart() {
    const ctx = document.getElementById('cltChart').getContext('2d');
    cltChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Distribution of Sample Means',
                data: [],
                backgroundColor: '#10b981'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'Sample Mean' } },
                y: { title: { display: true, text: 'Frequency' } }
            }
        }
    });
}

function runCLT() {
    const n = parseInt(document.getElementById('clt-n').value);
    const numSamples = 1000;
    const means = [];

    // Draw samples from Uniform Distribution [0, 100]
    for (let i = 0; i < numSamples; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) {
            sum += Math.random() * 100;
        }
        means.push(sum / n);
    }

    // Create Histogram Bins
    const bins = {};
    means.forEach(m => {
        const bin = Math.floor(m / 2) * 2; // Bin size 2
        bins[bin] = (bins[bin] || 0) + 1;
    });

    const sortedBins = Object.keys(bins).sort((a, b) => parseFloat(a) - parseFloat(b));
    const data = sortedBins.map(b => bins[b]);

    cltChart.data.labels = sortedBins;
    cltChart.data.datasets[0].data = data;
    cltChart.update();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('normalChart')) initNormalChart();
    if (document.getElementById('cltChart')) initCLTChart();
});
