
let autoChart;

function generateGraph() {
    const prompt = document.getElementById('graph-prompt').value;
    if (!prompt.trim()) {
        alert("Please enter a description for your graph.");
        return;
    }

    const data = parseInput(prompt);
    if (!data) {
        alert("Could not extract data. Please try a simpler format like 'Label: Value' or a list of numbers.");
        return;
    }

    const type = determineGraphType(prompt, data);
    renderChart(type, data);
    generateExplanation(type, data);

    document.getElementById('output-section').style.display = 'block';
    // Scroll to output
    document.getElementById('output-section').scrollIntoView({ behavior: 'smooth' });
}

function parseInput(text) {
    // Strategy 1: Look for "Label - Value" or "Label: Value" or "Label Value" lines
    const lines = text.split(/\n|,|;/).filter(l => l.trim());
    const labels = [];
    const values = [];

    // Regex for "Label: Value" or "Label - Value" or "Label Value"
    // Captures: Group 1 (Label), Group 2 (Value)
    const pairRegex = /([a-zA-Z0-9\s]+)[:\-\s]+(\d+(?:\.\d+)?)/;

    // Check for explicit arrays X=[...] Y=[...]
    const xArrayMatch = text.match(/X\s*=\s*\[(.*?)\]/i);
    const yArrayMatch = text.match(/Y\s*=\s*\[(.*?)\]/i);

    if (xArrayMatch && yArrayMatch) {
        const xVals = xArrayMatch[1].split(',').map(v => parseFloat(v.trim()));
        const yVals = yArrayMatch[1].split(',').map(v => parseFloat(v.trim()));
        if (xVals.length === yVals.length) {
            return {
                type: 'xy',
                labels: xVals,
                values: yVals
            };
        }
    }

    // Check for simple list of numbers
    const numberListRegex = /^[\d\s,.]+$/;
    if (numberListRegex.test(text.trim())) {
        const nums = text.match(/(\d+(?:\.\d+)?)/g).map(Number);
        return {
            type: 'list',
            values: nums,
            labels: nums.map((_, i) => `Item ${i + 1}`)
        };
    }

    // Process line by line for pairs
    let foundPairs = false;
    for (let line of lines) {
        const match = line.match(pairRegex);
        if (match) {
            // Ensure the "label" isn't just a number part of a larger list
            const labelCand = match[1].trim();
            const valCand = parseFloat(match[2]);

            // Basic filter to avoid false positives in sentences
            if (labelCand.length < 30 && !isNaN(valCand)) {
                labels.push(labelCand);
                values.push(valCand);
                foundPairs = true;
            }
        }
    }

    if (foundPairs && labels.length > 0) {
        return {
            type: 'pairs',
            labels: labels,
            values: values
        };
    }

    // Fallback: Try to extract all numbers if no structure found
    const allNums = text.match(/(\d+(?:\.\d+)?)/g);
    if (allNums && allNums.length > 1) {
        return {
            type: 'list',
            values: allNums.map(Number),
            labels: allNums.map((_, i) => `Data ${i + 1}`)
        };
    }

    return null;
}

function determineGraphType(text, data) {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('scatter') || lowerText.includes('relationship') || lowerText.includes('correlation')) {
        return 'scatter';
    }
    if (lowerText.includes('line') || lowerText.includes('trend') || lowerText.includes('over time') || lowerText.includes('year')) {
        return 'line';
    }
    if (lowerText.includes('bar') || lowerText.includes('compare') || lowerText.includes('vs')) {
        return 'bar';
    }
    if (lowerText.includes('histogram') || lowerText.includes('distribution')) {
        return 'bar'; // Chart.js uses bar for histogram-like appearance usually, or we can bin data
    }

    // Default logic based on data structure
    if (data.type === 'xy') return 'scatter';
    if (data.type === 'list') return 'bar'; // or line if it looks like a series

    return 'bar'; // Safe default
}

function renderChart(type, data) {
    const ctx = document.getElementById('autoChart').getContext('2d');

    if (autoChart) {
        autoChart.destroy();
    }

    let chartData = {
        labels: data.labels,
        datasets: [{
            label: 'Data',
            data: data.values,
            backgroundColor: [
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 99, 132, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)'
            ],
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    };

    let options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: type !== 'bar' && type !== 'line' } // Hide legend for simple bar/line
        }
    };

    // Specific adjustments
    if (type === 'scatter') {
        chartData = {
            datasets: [{
                label: 'Scatter Dataset',
                data: data.labels.map((x, i) => ({ x: x, y: data.values[i] })),
                backgroundColor: 'rgba(255, 99, 132, 1)'
            }]
        };
        options.scales = {
            x: { type: 'linear', position: 'bottom' }
        };
    } else if (type === 'line') {
        chartData.datasets[0].fill = false;
        chartData.datasets[0].tension = 0.1;
        chartData.datasets[0].borderColor = '#0ea5e9';
        chartData.datasets[0].backgroundColor = '#0ea5e9';
    }

    autoChart = new Chart(ctx, {
        type: type,
        data: chartData,
        options: options
    });
}

function generateExplanation(type, data) {
    const explanationEl = document.getElementById('graph-explanation');
    let text = "";

    const values = data.values;
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);
    const maxIndex = values.indexOf(maxVal);
    const minIndex = values.indexOf(minVal);

    // Calculate average
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = (sum / values.length).toFixed(2);

    if (type === 'bar') {
        text = `The chart compares ${values.length} items. <strong>${data.labels[maxIndex]}</strong> has the highest value (${maxVal}), while <strong>${data.labels[minIndex]}</strong> is the lowest (${minVal}). The average value is ${avg}.`;
    } else if (type === 'line') {
        const first = values[0];
        const last = values[values.length - 1];
        const trend = last > first ? "an upward trend" : (last < first ? "a downward trend" : "no significant change");
        text = `Over the observed period, the data shows <strong>${trend}</strong>. Starting at ${first} and ending at ${last}. The peak value was ${maxVal}.`;
    } else if (type === 'scatter') {
        text = `The scatter plot shows the relationship between two variables. Look for patterns: if points drift upwards from left to right, there is a positive correlation.`;
    } else {
        text = `Here is the visual representation of your data. Max: ${maxVal}, Min: ${minVal}, Average: ${avg}.`;
    }

    explanationEl.innerHTML = text;
}

function downloadGraph() {
    const link = document.createElement('a');
    link.download = 'my-graph.png';
    link.href = document.getElementById('autoChart').toDataURL();
    link.click();
}
