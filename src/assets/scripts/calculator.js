var Calculator = function(elements) {
    
    // self-reference
    var calc = this;
    
    // the two screen
    this.topScreen = elements.top;
    this.bottomScreen = elements.bottom;
    
    // the current expression, initialized
    this.expression = new Expression();
    
    // the active number on the lower screen
    this.currentNumber = '0';
    
    // whether the current calculation has been evaluated yet
    this.hasEvaluated = false;
    
    this.justPressedZero = false;
    
    this.SCREEN_SIZE = 15;
    
    this.updateTopDisplay();
    this.updateBottomDisplay();
    
    this.useRad = true;
    
    // callbacks
    
    this.onEvaluate = undefined;
    this.onError = undefined;
    
    // button press event handlers
    
    function pressNumber() {
        
        if (calc.hasEvaluated) {
            
            calc.reset();
            
        }
        
        var num = this.getAttribute('data-value');
        
        if (num == '0' && !parseFloat(calc.currentNumber)) {
            
            calc.justPressedZero = true;
            
        } else {
            
            calc.justPressedZero = false;
            
        }
        
        if (calc.currentNumber.length < 17) {
            
            if (parseFloat(calc.currentNumber) || calc.currentNumber === '0.') {
                
                calc.currentNumber += num;
                
            } else {
             
                calc.currentNumber = num;
                
            }
            
        }
        
        calc.updateBottomDisplay();
        
        calc.hasEvaluated = false;
        
    }
    
    function lastElementIsNumber() {
        
        var char = getLastCharacter();
        
        return char && (char == ')' || /^(?:[0-9-\.e!]|&pi;|<\/?sup>)+$/.test(char) && char != '-');
        
    }
    
    function pressOperator() {
        
        if (!isNaN(parseFloat(calc.currentNumber)) && !calc.hasEvaluated) {
            
            if(!lastElementIsNumber()) {
            
                addNumber(calc.currentNumber);
                
            }
            
        }
        
        calc.clearCurrentNumber();
        
        calc.updateBottomDisplay();
        
        calc.expression.pushOperator(this.getAttribute('data-operator'));
        
        calc.updateTopDisplay();
        
        calc.hasEvaluated = false;
        
    }
    
    function pressParen() {
        
        var char = this.getAttribute('data-paren');
        
        if (!isNaN(parseFloat(calc.currentNumber)) && !calc.hasEvaluated) {
                        
            if ((char == ')' || parseFloat(calc.currentNumber)) && !lastElementIsNumber()) {
                
                addNumber(calc.currentNumber);
                
            }
            
        }
        
        calc.clearCurrentNumber();
        
        calc.updateBottomDisplay();
        
        calc.expression.pushParen(char);
        
        calc.updateTopDisplay();
        
        calc.hasEvaluated = false;
        
    }
    
    function pressFunction() {
        
        if (calc.hasEvaluated) {
            
            calc.reset();
            
        }
        
        var char = this.getAttribute('data-function');
        
        if (!isNaN(parseFloat(calc.currentNumber)) && !calc.hasEvaluated) {
            
            if ((char == 'factorial' || char == 'square' || char == 'cube' || char == 'inverse' || parseFloat(calc.currentNumber)) && !lastElementIsNumber()) {
            
                addNumber(calc.currentNumber);
                
            }
            
        }
        
        calc.clearCurrentNumber();
        
        calc.updateBottomDisplay();
        
        calc.expression.pushFunction(char);
        
        calc.updateTopDisplay();
        
        calc.hasEvaluated = false;
        
    }
    
    function pressCommand() {
        
        var command = this.getAttribute('data-command');
        
        switch (command) {
            
            case 'evaluate':
                
                if ((parseFloat(calc.currentNumber) || calc.justPressedZero) && !calc.hasEvaluated) {
                    
                    addNumber(calc.currentNumber);
                    
                    calc.clearCurrentNumber();
                    
                }
                
                var result = calc.expression.evaluate(calc.useRad);
                
                if (!result) {
                    
                    var error = calc.expression.getError();
                    
                    calc.expression = new Expression();
                    
                    calc.updateTopDisplay(error);
                    
                    calc.currentNumber = 'ERROR';
                    
                    if (calc.onError) calc.onError(error);
                    
                } else {
                    
                    calc.currentNumber = result;
                    
                    calc.updateTopDisplay(' =');
                    
                    if (calc.onEvaluate) calc.onEvaluate(result);
                    
                }
                
                calc.updateBottomDisplay();
                
                calc.hasEvaluated = true;
                
                break;
            
            case 'clear':
                
                calc.reset();
                
                break;
            
            case 'backspace':
                
                if (parseFloat(calc.currentNumber)) {
                    
                    if (calc.currentNumber.length > 1) {
                        
                        calc.currentNumber = calc.currentNumber.substr(0,calc.currentNumber.length - 1);
                        
                    } else if (calc.currentNumber.length === 1) {
                        
                        calc.currentNumber = '0';
                        
                    }
                    
                    calc.updateBottomDisplay();
                    
                } else {
                    
                    calc.expression.removeLast();
                    
                    calc.updateTopDisplay();
                    
                }
                
                break;
            
            case 'degrad':
                
                if (calc.useRad) {
                    
                    calc.useRad = false;
                    
                    elements.rad.className = 'inactive';
                    elements.deg.className = '';
                    
                } else {
                    
                    calc.useRad = true;
                    
                    elements.deg.className = 'inactive';
                    elements.rad.className = '';
                    
                }
                
                break;
            
        }
        
    }
    
    function pressModifier() {
        
        var modifier = this.getAttribute('data-modifier');
        
        if (modifier === 'decimal') {
            
            if (calc.currentNumber.indexOf('.') === -1) {
                
                if (calc.currentNumber) {
                    
                    calc.currentNumber += '.';
                    
                } else {
                    
                    calc.currentNumber = '0.';
                    
                }
                
            }
            
        } else if (modifier === 'plusminus') {
            
            if(/^-/.test(calc.currentNumber)) {
                
                calc.currentNumber = calc.currentNumber.replace(/^-/, '');
                
            } else {
                
                calc.currentNumber = '-' + calc.currentNumber;
                
            }
            
        }
        
        calc.updateBottomDisplay();
        
    }
    
    function pressConstant() {
        
        if (parseFloat(calc.currentNumber) && !calc.hasEvaluated) {
            
            addNumber(calc.currentNumber);
            
        }
        
        calc.clearCurrentNumber();
        
        calc.updateBottomDisplay();
        
        calc.expression.pushConstant(this.getAttribute('data-constant'));
        
        calc.updateTopDisplay();
        
        calc.hasEvaluated = false;
        
    }
    
    function addNumber(number) {
        
        if (number < 0) {
            
            calc.expression.pushParen('(');
            
            calc.expression.pushNumber(number);
            
            calc.expression.pushParen(')');
            
        } else {
            
            calc.expression.pushNumber(number);
            
        }
        
    }
    
    function getLastCharacter() {
        
        var text = calc.expression.getText().trim().split(' ');
        
        return text[text.length - 1];
        
    }
    
    // hook up the buttons to the event handlers
    
    var buttons = elements.buttons;
    
    for (var i = 0; i < buttons.length; i++) {
        
        var b = buttons[i];
        
        switch(b.className.split(' ')[0]) {
            
            case 'number':
                
                b.addEventListener('click', pressNumber, false);
                
                break;
            
            case 'operator':
                
                b.addEventListener('click', pressOperator, false);
                
                break;
            
            case 'paren':
                
                b.addEventListener('click', pressParen, false);
                
                break;
            
            case 'function':
                
                b.addEventListener('click', pressFunction, false);
                
                break;
            
            case 'command':
                
                b.addEventListener('click', pressCommand, false);
                
                break;
            
            case 'modifier':
                
                b.addEventListener('click', pressModifier, false);
                
                break;
            
            case 'constant':
                
                b.addEventListener('click', pressConstant, false);
                
                break;
            
            default:
            
                //
            
        }
        
    }
    
}

Calculator.prototype = {
    
    updateBottomDisplay: function() {
        
        var number = String(this.currentNumber);
        
        if (!isNaN(number) && number.indexOf('.') === -1) {
            
            number += '.';
            
        }
        
        this.bottomScreen.innerHTML = number;
        
    },
    
    updateTopDisplay: function(end) {
        
        if (typeof end === 'undefined') end = '';
        
        this.topScreen.innerHTML = this.expression.getText() + end;
        
    },
    
    clearCurrentNumber: function() {
        
        this.currentNumber = '0';
        
        this.updateBottomDisplay();
        
    },
    
    reset: function() {
        
        this.expression = new Expression();
        
        this.hasEvaluated = false;
        
        this.currentNumber = '0';
        
        this.justPressedZero = false;
        
        this.updateBottomDisplay();
        
        this.updateTopDisplay();
        
    },
    
    error: function(error) {
        
        this.reset();
        
        alert(error);
        
    }
    
}