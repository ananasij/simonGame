// GAME LOGIC
var STATE_PLAY = 'STATE_PLAY';
var STATE_LOCKED = 'STATE_LOCKED';
var STATE_OFF = 'STATE_OFF';
var CLR_RED = 'CLR_RED';
var CLR_YELLOW = 'CLR_YELLOW';
var CLR_GREEN = 'CLR_GREEN';
var CLR_BLUE = 'CLR_BLUE';
var LEVELS_LIMIT = 5;

var Simon = function() {
    this.colors = [CLR_RED, CLR_YELLOW, CLR_GREEN, CLR_BLUE];
    this.callbacks = {
        onNextLevel: null,
        onWrongGuess: null,
        onGameEnd: null
    };
};

Simon.prototype.startGame = function(strictmode) {
    this.strictmode = strictmode;
    this.state = STATE_LOCKED;
    this.pattern = [];
    this.nextLevel();
};

Simon.prototype.endGame = function() {
    this.trigger('onGameEnd');
};

Simon.prototype.getRandomColor = function() {
    var index = Math.floor(Math.random() * this.colors.length);
    return this.colors[index];
};

Simon.prototype.nextLevel = function() {
    this.state = STATE_LOCKED;
    if (this.currentPosition === LEVELS_LIMIT) {
        this.endGame();
    } else {
        this.pattern.push(this.getRandomColor());
        this.trigger('onNextLevel');
    }
    this.currentPosition = 0;
};

Simon.prototype.processInput = function(inputColor) {
    if (this.state === STATE_PLAY) {
        if (inputColor === this.pattern[this.currentPosition]) {
            this.currentPosition += 1;
            if (this.currentPosition === this.pattern.length) {
                this.nextLevel();
            }
        } else {
            this.wrongGuess();
        }
    }
};

Simon.prototype.wrongGuess = function() {
    this.state = STATE_LOCKED;
    this.trigger('onWrongGuess');
    this.currentPosition = 0;
};

Simon.prototype.on = function(eventName, callback) {
    this.callbacks[eventName] = callback;
};

Simon.prototype.trigger = function(eventName, value) {
    if (this.callbacks[eventName]) {
        this.callbacks[eventName](value);
    }
};

// UI LOGIC
var simon;
var sounds = {};

function init() {
    simon = new Simon();
    simon.on('onNextLevel', playPattern);
    simon.on('onWrongGuess', wrongGuess);
    simon.on('onGameEnd', endGame);
    sounds[CLR_RED] = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound1.mp3');
    sounds[CLR_YELLOW] = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound2.mp3');
    sounds[CLR_GREEN] = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound3.mp3');
    sounds[CLR_BLUE] = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound4.mp3');

    $('.js-start-btn').on('click', function() {
        var strictmode = false;
        if ($('.js-strictmode').is(':checked')) {
            strictmode = true;
        }
        switchViews();
        simon.startGame(strictmode);
    });

    $('.js-reset').on('click', function(e) {
        e.preventDefault();
        switchViews();
        simon.state = STATE_OFF;
    });

    $('.js-color-btn').on('mousedown', function(e) {
        var $btn = $(e.target);
        if (simon.state === STATE_PLAY) {
            activateBtn($btn);
            simon.processInput($btn.data('color'));
        }
    });
}

function activateBtn($btn) {
    var color = $btn.data('color');
    var activeClass = getActiveClass(color);
    $btn.addClass(activeClass);
    lampBlink(color);
    playSound(color);
    setTimeout(function() {
        $btn.removeClass(activeClass);
    }, 300);
}

function switchViews() {
    $('.js-start').toggleClass('overlay');
    $('.js-inputs').toggleClass('overlay');
}

function playSound(color) {
    sounds[color].play();
}

function playPattern() {
    var pattern = simon.pattern;
    var level = pattern.length;
    updateCounter(level);
    setTimeout(function() {
        loopColors(0);
    }, 500);

    function loopColors(counter) {
        setTimeout(function() {
            var $btn;
            var color;
            color = pattern[counter];
            $btn = $('.js-' + color);
            activateBtn($btn);
            if (counter === level - 1) {
                simon.state = STATE_PLAY;
            } else {
                loopColors(counter + 1);
            }
        }, 500);
    }
}

function updateCounter(value) {
    var $counter = $('.js-counter');
    $counter.text(value);
}

function wrongGuess() {
    setTimeout(lampBlinkWrong, 500);

    if (simon.strictmode) {
        updateCounter('Uh-oh! You lost...');
    } else {
        updateCounter('Wrong!');
        setTimeout(playPattern, 1000);
    }
}

function endGame() {
    updateCounter('Woo-hoo! You won!');
    lampBlinkWin();
}

function getActiveClass(color) {
    switch (color) {
        case CLR_RED:
            return 'btn-red-active';
        case CLR_YELLOW:
            return 'btn-yellow-active';
        case CLR_GREEN:
            return 'btn-green-active';
        case CLR_BLUE:
            return 'btn-blue-active';
        default:
            return null;
    }
}

function lampBlink(color) {
    var $light = $('.js-light');
    var lightClass = getLightClass(color);
    $light.addClass(lightClass);
    setTimeout(function() {
        $light.removeClass(lightClass);
    }, 300);
}

function getLightClass(color) {
    switch (color) {
        case CLR_RED:
            return 'light-red';
        case CLR_YELLOW:
            return 'light-yellow';
        case CLR_GREEN:
            return 'light-green';
        case CLR_BLUE:
            return 'light-blue';
        default:
            return null;
    }
}

function lampBlinkWin() {
    var colors = [CLR_RED, CLR_YELLOW, CLR_GREEN, CLR_BLUE];
    var position = 0;
    loopBlinks(position);

    function loopBlinks(colorPosition) {
        var counter = colorPosition;
        lampBlink(colors[counter]);
        counter += 1;
        if (counter === colors.length) {
            counter = 0;
        }
        if (simon.state !== STATE_OFF) {
            setTimeout(function() {
                loopBlinks(counter);
            }, 400);
        }
    }
}

function lampBlinkWrong() {
    var $light = $('.js-light');
    var lightClass = getLightClass(CLR_RED);
    $light.addClass(lightClass);
    $light.effect('pulsate', 'slow');
    setTimeout(function() {
        $light.removeClass(lightClass);
    }, 500);
}

$(document).ready(init);