
// Function to show specific calculator
// Function to show specific calculator
function showCalculator(id) {
    // Hide all calculators
    const calcs = document.querySelectorAll('.calculator-section');
    calcs.forEach(calc => calc.style.display = 'none');

    // Show the selected one
    document.getElementById('calc-' + id).style.display = 'block';

    // Update active state in sidebar
    const links = document.querySelectorAll('.sidebar-link');
    links.forEach(link => link.classList.remove('active'));

    // Find the link that calls this function with this id
    // We can use the href attribute which matches #id
    const activeLink = document.querySelector(`.sidebar-link[href="#${id}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Helper: Parse input string to array of numbers
function parseInput(str) {
    return str.split(',').map(Number).filter(n => !isNaN(n));
}

// Descriptive Statistics
function calculateDescriptive() {
    const input = document.getElementById('desc-data').value;
    const data = parseInput(input);

    if (data.length === 0) {
        alert("Please enter valid numbers separated by commas.");
        return;
    }

    const n = data.length;
    const mean = data.reduce((a, b) => a + b, 0) / n;

    // Median
    const sorted = [...data].sort((a, b) => a - b);
    let median;
    if (n % 2 === 0) {
        median = (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    } else {
        median = sorted[Math.floor(n / 2)];
    }

    // Mode
    const counts = {};
    data.forEach(x => counts[x] = (counts[x] || 0) + 1);
    let mode = [];
    let maxCount = 0;
    for (const num in counts) {
        if (counts[num] > maxCount) {
            mode = [num];
            maxCount = counts[num];
        } else if (counts[num] === maxCount) {
            mode.push(num);
        }
    }
    const modeStr = maxCount > 1 ? mode.join(', ') : "No Mode";

    // Variance & Std Dev (Sample)
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
    const sd = Math.sqrt(variance);

    // Display Results
    document.getElementById('res-mean').innerText = mean.toFixed(4);
    document.getElementById('res-median').innerText = median.toFixed(4);
    document.getElementById('res-mode').innerText = modeStr;
    document.getElementById('res-sd').innerText = sd.toFixed(4);
    document.getElementById('res-var').innerText = variance.toFixed(4);
    document.getElementById('res-n').innerText = n;

    document.getElementById('desc-result').style.display = 'block';
}

// Confidence Interval
function calculateCI() {
    const mean = parseFloat(document.getElementById('ci-mean').value);
    const sd = parseFloat(document.getElementById('ci-sd').value);
    const n = parseFloat(document.getElementById('ci-n').value);
    const level = parseFloat(document.getElementById('ci-level').value);

    if (isNaN(mean) || isNaN(sd) || isNaN(n)) {
        alert("Please enter valid numbers.");
        return;
    }

    // Z-score for confidence level (approx)
    let z;
    if (level === 0.90) z = 1.645;
    else if (level === 0.95) z = 1.96;
    else if (level === 0.99) z = 2.576;
    else z = 1.96;

    const moe = z * (sd / Math.sqrt(n));
    const lower = mean - moe;
    const upper = mean + moe;

    document.getElementById('res-moe').innerText = moe.toFixed(4);
    document.getElementById('res-ci-lower').innerText = lower.toFixed(4);
    document.getElementById('res-ci-upper').innerText = upper.toFixed(4);

    document.getElementById('ci-result').style.display = 'block';
}

// Hypothesis Test (Z-Test)
function calculateZTest() {
    const mu = parseFloat(document.getElementById('ht-mu').value);
    const xbar = parseFloat(document.getElementById('ht-xbar').value);
    const sigma = parseFloat(document.getElementById('ht-sigma').value);
    const n = parseFloat(document.getElementById('ht-n').value);

    if (isNaN(mu) || isNaN(xbar) || isNaN(sigma) || isNaN(n)) {
        alert("Please enter valid numbers.");
        return;
    }

    const z = (xbar - mu) / (sigma / Math.sqrt(n));

    // P-value approximation (Two-tailed)
    // Using a simple approximation for standard normal CDF
    const p = 2 * (1 - normalCDF(Math.abs(z)));

    document.getElementById('res-z').innerText = z.toFixed(4);
    document.getElementById('res-p').innerText = p.toFixed(4);

    document.getElementById('ht-result').style.display = 'block';
}

// Helper: Normal CDF
function normalCDF(x) {
    var t = 1 / (1 + .2316419 * Math.abs(x));
    var d = .3989423 * Math.exp(-x * x / 2);
    var prob = d * t * (.3193815 + t * (-.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    if (x > 0) prob = 1 - prob;
    return prob;
}

// Regression
function calculateRegression() {
    const xInput = document.getElementById('reg-x').value;
    const yInput = document.getElementById('reg-y').value;
    const x = parseInput(xInput);
    const y = parseInput(yInput);

    if (x.length !== y.length || x.length === 0) {
        alert("X and Y must have the same number of values.");
        return;
    }

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const b1 = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b0 = (sumY - b1 * sumX) / n;

    // Correlation (r)
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const r = numerator / denominator;
    const r2 = r * r;

    document.getElementById('res-b0').innerText = b0.toFixed(4);
    document.getElementById('res-b1').innerText = b1.toFixed(4);
    document.getElementById('res-r').innerText = r.toFixed(4);
    document.getElementById('res-r2').innerText = r2.toFixed(4);

    document.getElementById('reg-result').style.display = 'block';

    // Trigger MathJax to re-render if needed (though here we just update text)
}
