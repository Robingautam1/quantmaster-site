let displayValue = '0';
let historyValue = '';
let isRadians = false;

const display = document.getElementById('display');
const history = document.getElementById('history');
const degBtn = document.getElementById('deg-btn');
const radBtn = document.getElementById('rad-btn');

function updateDisplay() {
    display.innerText = displayValue;
    history.innerText = historyValue;
}

function insert(val) {
    if (displayValue === '0' && isNaN(val) === false) {
        displayValue = val;
    } else if (displayValue === 'Error') {
        displayValue = val;
    } else {
        displayValue += val;
    }
    updateDisplay();
}

function clearAll() {
    displayValue = '0';
    historyValue = '';
    updateDisplay();
}

function clearEntry() {
    displayValue = '0';
    updateDisplay();
}

function setMode(mode) {
    if (mode === 'rad') {
        isRadians = true;
        radBtn.classList.add('active');
        degBtn.classList.remove('active');
    } else {
        isRadians = false;
        degBtn.classList.add('active');
        radBtn.classList.remove('active');
    }
}

function handleFunc(func) {
    if (displayValue === 'Error') displayValue = '0';

    switch (func) {
        case 'sin':
            displayValue += 'sin(';
            break;
        case 'cos':
            displayValue += 'cos(';
            break;
        case 'tan':
            displayValue += 'tan(';
            break;
        case 'asin':
            displayValue += 'asin(';
            break;
        case 'acos':
            displayValue += 'acos(';
            break;
        case 'atan':
            displayValue += 'atan(';
            break;
        case 'log':
            displayValue += 'log(';
            break;
        case 'ln':
            displayValue += 'ln(';
            break;
        case 'sqrt':
            displayValue += 'sqrt(';
            break;
        case 'sq':
            displayValue += '^2';
            break;
        case 'fact':
            displayValue += '!';
            break;
    }
    updateDisplay();
}

function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}

function calculate() {
    try {
        historyValue = displayValue + ' =';

        // Replace user-friendly symbols with JS math
        let expression = displayValue
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/\^/g, '**')
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E');

        // Handle Factorial (!)
        // Regex to find number followed by !
        expression = expression.replace(/(\d+)!/g, function (match, number) {
            return factorial(parseInt(number));
        });

        // Handle Trig Functions with Mode
        // We need to wrap arguments in conversion if DEG mode
        // This is a simplified parser; for a truly robust one we'd need a tokenizer.
        // For now, we'll override the Math functions in the eval scope.

        const toRad = (deg) => deg * (Math.PI / 180);
        const toDeg = (rad) => rad * (180 / Math.PI);

        // Custom math scope
        const scope = {
            sin: (x) => Math.sin(isRadians ? x : toRad(x)),
            cos: (x) => Math.cos(isRadians ? x : toRad(x)),
            tan: (x) => Math.tan(isRadians ? x : toRad(x)),
            asin: (x) => isRadians ? Math.asin(x) : toDeg(Math.asin(x)),
            acos: (x) => isRadians ? Math.acos(x) : toDeg(Math.acos(x)),
            atan: (x) => isRadians ? Math.atan(x) : toDeg(Math.atan(x)),
            log: (x) => Math.log10(x),
            ln: (x) => Math.log(x),
            sqrt: (x) => Math.sqrt(x),
            Math: Math
        };

        // Safe eval using Function constructor with scope
        // We'll replace function calls to use our scope
        // e.g. sin(90) -> scope.sin(90)

        let evalExpr = expression
            .replace(/sin\(/g, 'scope.sin(')
            .replace(/cos\(/g, 'scope.cos(')
            .replace(/tan\(/g, 'scope.tan(')
            .replace(/asin\(/g, 'scope.asin(')
            .replace(/acos\(/g, 'scope.acos(')
            .replace(/atan\(/g, 'scope.atan(')
            .replace(/log\(/g, 'scope.log(')
            .replace(/ln\(/g, 'scope.ln(')
            .replace(/sqrt\(/g, 'scope.sqrt(');

        // Evaluate
        const func = new Function('scope', 'return ' + evalExpr);
        let result = func(scope);

        // Format result
        if (!isFinite(result) || isNaN(result)) {
            displayValue = 'Error';
        } else {
            // Fix floating point errors (e.g. 0.1 + 0.2)
            displayValue = parseFloat(result.toPrecision(12)).toString();
        }
    } catch (e) {
        displayValue = 'Error';
        console.error(e);
    }
    updateDisplay();
}
