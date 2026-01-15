'use strict';

var value = 0;
var calculatorMode = 'basic';
var isDegrees = true;

// Theme management
function loadTheme() {
    try {
        var savedTheme = localStorage.getItem('calculatorTheme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    } catch(e) {
        console.log('Could not load theme from localStorage');
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    
    try {
        var isDarkTheme = document.body.classList.contains('dark-theme');
        localStorage.setItem('calculatorTheme', isDarkTheme ? 'dark' : 'light');
    } catch(e) {
        console.log('Could not save theme to localStorage');
    }
}

// Scientific calculator mode management
function switchMode(mode) {
    calculatorMode = mode;
    
    var basicButtons = document.getElementById('basicButtons');
    var scientificButtons = document.getElementById('scientificButtons');
    var basicModeBtn = document.getElementById('basicModeBtn');
    var scientificModeBtn = document.getElementById('scientificModeBtn');
    
    if (mode === 'basic') {
        basicButtons.style.display = 'grid';
        scientificButtons.style.display = 'none';
        basicModeBtn.classList.add('active');
        scientificModeBtn.classList.remove('active');
    } else {
        basicButtons.style.display = 'none';
        scientificButtons.style.display = 'grid';
        basicModeBtn.classList.remove('active');
        scientificModeBtn.classList.add('active');
    }
}

function toggleDegRad() {
    isDegrees = !isDegrees;
    var btn = document.getElementById('degRadBtn');
    btn.textContent = isDegrees ? 'DEG' : 'RAD';
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function toDegrees(radians) {
    return radians * (180 / Math.PI);
}

function scientificFunction(func) {
    var currentValue = Number(value);
    var result = null;
    
    try {
        switch(func) {
            case 'sin':
                var sinInput = isDegrees ? toRadians(currentValue) : currentValue;
                result = Math.sin(sinInput);
                break;
            case 'cos':
                var cosInput = isDegrees ? toRadians(currentValue) : currentValue;
                result = Math.cos(cosInput);
                break;
            case 'tan':
                var tanInput = isDegrees ? toRadians(currentValue) : currentValue;
                result = Math.tan(tanInput);
                break;
            case 'sqrt':
                if (currentValue < 0) {
                    setError("Can't sqrt negative");
                    return;
                }
                result = Math.sqrt(currentValue);
                break;
            case 'log':
                if (currentValue <= 0) {
                    setError("Log undefined");
                    return;
                }
                result = Math.log10(currentValue);
                break;
            case 'ln':
                if (currentValue <= 0) {
                    setError("Ln undefined");
                    return;
                }
                result = Math.log(currentValue);
                break;
            case 'factorial':
                if (currentValue < 0 || currentValue % 1 !== 0) {
                    setError("Invalid factorial");
                    return;
                }
                result = factorial(currentValue);
                break;
            case 'percent':
                result = currentValue / 100;
                break;
            default:
                return;
        }
        
        if (result !== null && isFinite(result)) {
            setValue(result);
            addToHistory(currentValue, func, '', result);
        } else {
            setError();
        }
    } catch(e) {
        setError();
    }
}

function factorial(n) {
    if (n > 170) {
        setError("Too large");
        return null;
    }
    if (n === 0 || n === 1) return 1;
    var result = 1;
    for (var i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function togglePlusMinus() {
    value = -value;
    setValue(value);
}

var states = {
    "start": 0,
    "operand1": 1,
    "operator": 2,
    "operand2": 3,
    "complete": 4
};

var state = states.start;

var operand1 = 0;
var operand2 = 0;
var operation = null;
var expression = '';
var useExpression = false;

// Expression evaluator with parentheses support
function evaluateExpression(expr) {
    try {
        // Replace ^ with ** for power operation
        expr = expr.replace(/\^/g, '**');
        
        // Validate expression - only allow numbers, operators, parentheses, and decimal points
        if (!/^[\d\s+\-*/().**]*$/.test(expr)) {
            return null;
        }
        
        // Prevent division by zero
        if (/\/\s*0[\s)]*/.test(expr)) {
            setError("Can't divide by zero");
            return null;
        }
        
        // Use Function constructor instead of eval for better control
        var result = new Function('return ' + expr)();
        
        if (isNaN(result) || !isFinite(result)) {
            setError();
            return null;
        }
        
        return result;
    } catch(e) {
        setError();
        return null;
    }
}

// History management
var calculationHistory = [];
var MAX_HISTORY = 50;

function addToHistory(operand1, operator, operand2, result) {
    var calculation = {
        operand1: operand1,
        operator: operator,
        operand2: operand2,
        result: result,
        timestamp: new Date().getTime()
    };
    
    calculationHistory.unshift(calculation);
    
    if (calculationHistory.length > MAX_HISTORY) {
        calculationHistory.pop();
    }
    
    // Save to localStorage
    try {
        localStorage.setItem('calculatorHistory', JSON.stringify(calculationHistory));
    } catch(e) {
        console.log('Could not save history to localStorage');
    }
    
    updateHistoryDisplay();
}

function loadHistoryFromStorage() {
    try {
        var saved = localStorage.getItem('calculatorHistory');
        if (saved) {
            calculationHistory = JSON.parse(saved);
            updateHistoryDisplay();
        }
    } catch(e) {
        console.log('Could not load history from localStorage');
    }
}

function updateHistoryDisplay() {
    var historyList = document.getElementById('history-list');
    
    if (calculationHistory.length === 0) {
        historyList.innerHTML = '<div class="history-empty">No calculations yet</div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < calculationHistory.length; i++) {
        var item = calculationHistory[i];
        var displayText = item.operand1 + ' ' + item.operator + ' ' + item.operand2 + ' = ' + item.result;
        html += '<div class="history-item" onClick="restoreFromHistory(' + i + ')">';
        html += '<div class="history-item-text">' + displayText + '</div>';
        html += '</div>';
    }
    
    historyList.innerHTML = html;
}

function restoreFromHistory(index) {
    if (calculationHistory[index]) {
        setValue(calculationHistory[index].result);
        state = states.complete;
    }
}

function clearHistory() {
    if (confirm('Clear all calculation history?')) {
        calculationHistory = [];
        try {
            localStorage.removeItem('calculatorHistory');
        } catch(e) {
            console.log('Could not clear localStorage');
        }
        updateHistoryDisplay();
    }
}

function toggleHistory() {
    const historyPanel = document.getElementById('history-panel');
    const isOpen = historyPanel.classList.toggle('show');

    historyPanel.setAttribute('aria-hidden', String(!isOpen));

    if (isOpen) {
        historyPanel.focus();
    }
}

// Client-side calculation for basic operations
function calculateLocal(operand1, operand2, operation) {
    var a = Number(operand1);
    var b = Number(operand2);
    
    switch (operation) {
        case '+':
            return a + b;
        case '-':
            return a - b;
        case '*':
            return a * b;
        case '/':
            if (b === 0) {
                setError("Can't divide by zero");
                return null;
            }
            return a / b;
        default:
            return null;
    }
}

function calculate(operand1, operand2, operation) {
    // Handle basic operations on client-side for instant feedback
    if (['+', '-', '*', '/'].includes(operation)) {
        var result = calculateLocal(operand1, operand2, operation);
        if (result !== null) {
            setValue(result);
            addToHistory(operand1, operation, operand2, result);
        }
        // Note: if result is null, error is already displayed by setError
        return;
    }

    // Use server for complex operations (power, etc.)
    var uri = location.origin + "/arithmetic";

    switch (operation) {
        case '^':
            uri += "?operation=power";
            break;
        default:
            setError();
            return;
    }

    uri += "&operand1=" + encodeURIComponent(operand1.toString());
    uri += "&operand2=" + encodeURIComponent(operand2.toString());

    setLoading(true);

    var http = new XMLHttpRequest();
    http.open("GET", uri, true);
    http.onload = function () {
        setLoading(false);

        if (http.status == 200) {
            var response = JSON.parse(http.responseText);
            setValue(response.result);
            addToHistory(operand1, operation, operand2, response.result);
        } else {
            setError();
        }
    };
    http.onerror = function () {
        setLoading(false);
        setError();
    };
    http.send(null);
}

function clearPressed() {
    setValue(0);

    operand1 = 0;
    operand2 = 0;
    operation = null;
    expression = '';
    useExpression = false;
    state = states.start;
    document.getElementById('calculation-display').textContent = '';
}

function clearEntryPressed() {
    setValue(0);
    state = (state == states.operand2) ? states.operator : states.start;
}

function numberPressed(n) {
    if (useExpression) {
        expression += n;
        // Display expression as plain text, not styled
        document.getElementById('result').textContent = expression;
        // Keep calculation-display empty when showing full expression in main display
        document.getElementById('calculation-display').textContent = '';
        return;
    }
    
    var value = getValue();

    if (state == states.start || state == states.complete) {
        value = n;
        state = (n == '0' ? states.start : states.operand1);
    } else if (state == states.operator) {
        value = n;
        state = (n == '0' ? states.operator : states.operand2);
    } else if (value.replace(/[-\.]/g, '').length < 8) {
        value += n;
    }

    value += "";

    setValue(value);
    
    // Update calculation display when entering second operand
    if (state == states.operand2 && operation) {
        updateCalculationDisplay();
    }
}

function decimalPressed() {
    if (useExpression) {
        if (!expression.endsWith('.')) {
            expression += '.';
            setValue(expression);
            // Keep calculation-display empty when showing full expression in main display
            document.getElementById('calculation-display').textContent = '';
        }
        return;
    }
    
    if (state == states.start || state == states.complete) {
        setValue('0.');
        state = states.operand1;
    } else if (state == states.operator) {
        setValue('0.');
        state = states.operand2;
    } else if (!getValue().toString().includes('.')) {
        setValue(getValue() + '.');
    }
    
    // Update calculation display when entering decimal in second operand
    if (state == states.operand2 && operation) {
        updateCalculationDisplay();
    }
}

function signPressed() {
    var value = getValue();

    if (value != 0) {
        setValue(-1 * value);
    }
}

function operationPressed(op) {
    if (useExpression) {
        expression += op;
        // Display expression as plain text, not styled
        document.getElementById('result').textContent = expression;
        // Keep calculation-display empty when showing full expression in main display
        document.getElementById('calculation-display').textContent = '';
        return;
    }
    
    operand1 = getValue();
    operation = op;
    state = states.operator;
    updateCalculationDisplay();
    console.log("Operation set to " + operation);
}

function updateCalculationDisplay() {
    var displayText = '';
    
    if (operation && state >= states.operator) {
        displayText = operand1 + ' ' + operation;
        if (state == states.operand2) {
            displayText += ' ' + getValue();
        }
    }
    
    document.getElementById('calculation-display').textContent = displayText;
}

function equalPressed() {
    if (useExpression) {
        // Evaluate expression with parentheses
        var result = evaluateExpression(expression);
        if (result !== null) {
            addToHistory(expression, '=', '', result);
            setValue(result);
            expression = '';
            useExpression = false;
            state = states.complete;
        }
        setTimeout(function() {
            document.getElementById('calculation-display').textContent = '';
        }, 100);
        return;
    }
    
    if (state < states.operand2) {
        state = states.complete;
        return;
    }

    if (state == states.operand2) {
        operand2 = getValue();
        state = states.complete;
    } else if (state == states.complete) {
        operand1 = getValue();
    }

    calculate(operand1, operand2, operation);
    // Clear calculation display after equals
    setTimeout(function() {
        document.getElementById('calculation-display').textContent = '';
    }, 100);
}

// TODO: Add key press logics
document.addEventListener('keypress', (event) => {
    if (event.key.match(/^\d+$/)) {
        numberPressed(event.key);
    } else if (event.key == '.') {
        decimalPressed();
    } else if (event.key.match(/^[-*+/]$/) || event.key == '^') {
        operationPressed(event.key);
    } else if (event.key == '=') {
        equalPressed();
    }
});

function getValue() {
    return value;
}

function setValue(n) {
    value = n;
    var displayValue = value;
    var useSprites = true;

    if (displayValue > 99999999) {
        displayValue = displayValue.toExponential(4);
    } else if (displayValue < -99999999) {
        displayValue = displayValue.toExponential(4);
    } else if (displayValue > 0 && displayValue < 0.0000001) {
        displayValue = displayValue.toExponential(4);
    } else if (displayValue < 0 && displayValue > -0.0000001) {
        displayValue = displayValue.toExponential(3);
    } else if (displayValue.toString().includes('.')) {
        // Limit decimal places to 8 to prevent overflow
        var decimalParts = displayValue.toString().split('.');
        if (decimalParts[1] && decimalParts[1].length > 7) {
            displayValue = parseFloat(displayValue.toFixed(7));
        }
    }

    var displayStr = displayValue.toString();
    
    // Check if display string is too long for sprite rendering
    if (displayStr.length > 20) {
        useSprites = false;
    }

    var resultElement = document.getElementById("result");
    
    if (useSprites) {
        var html = "";
        for (var c of displayStr.split("")) {
            if (c == '-') {
                html += "<span class=\"resultchar negative\">" + c + "</span>";
            } else if (c == '.') {
                html += "<span class=\"resultchar decimal\">" + c + "</span>";
            } else if (c == 'e') {
                html += "<span class=\"resultchar exponent\">e</span>";
            } else if (c != '+') {
                html += "<span class=\"resultchar digit" + c + "\">" + c + "</span>";
            }
        }
        resultElement.innerHTML = html;
    } else {
        // Use plain text for very long numbers
        resultElement.style.fontSize = '16px';
        resultElement.style.fontFamily = 'monospace';
        resultElement.textContent = displayStr;
    }
}

function setError(message) {
    var errorMsg = message || "ERROR";
    document.getElementById("result").innerHTML = errorMsg;
}

function setLoading(loading) {
    if (loading) {
        document.getElementById("loading").style.visibility = "visible";
    } else {
        document.getElementById("loading").style.visibility = "hidden";
    }

    var buttons = document.querySelectorAll("BUTTON");

    for (var i = 0; i < buttons.length; i++) {
        buttons[i].disabled = loading;
    }
}
function toggleHelpPopup() {
    const popup = document.getElementById('help-popup');
    const isOpen = popup.classList.toggle('show');
    popup.setAttribute('aria-hidden', String(!isOpen));

    if (isOpen) {
        popup.focus();
    }
}
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {

        const helpPopup = document.getElementById('help-popup');
        const historyPanel = document.getElementById('history-panel');

        if (helpPopup && helpPopup.classList.contains('show')) {
            helpPopup.classList.remove('show');
            helpPopup.setAttribute('aria-hidden', 'true');
        }

        if (historyPanel && historyPanel.classList.contains('show')) {
            historyPanel.classList.remove('show');
            historyPanel.setAttribute('aria-hidden', 'true');
        }
    }
});


function parenthesisPressed(paren) {
    useExpression = true;
    
    // If expression is empty or just "0", start fresh
    if (expression === '' || expression === '0') {
        expression = paren;
    } else {
        expression += paren;
    }
    
    // Display the expression directly without going through setValue
    document.getElementById('result').textContent = expression;
    // Keep calculation-display empty when showing full expression in main display
    document.getElementById('calculation-display').textContent = '';
}
