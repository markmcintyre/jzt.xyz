(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * JZT User Experience: FullScreen
 * Copyright © 2014 Mark McIntyre
 * @author Mark McIntyre
 */

/*jslint node: true */

'use strict';

function isFullscreenSupported() {
    return document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled;
}

function attachFullscreenHandler(buttonElement, fullscreenElement) {

    function isFullscreen() {
        return document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen || document.msFullscreenElement;
    }

    function onFullscreenChange() {

        if (isFullscreen()) {
            fullscreenElement.style.height = '100%';
            fullscreenElement.style.width = '100%';
        } else {
            fullscreenElement.style.width = '800px';
            fullscreenElement.style.height = '640px';
        }

        buttonElement.checked = false;

    }

    buttonElement.addEventListener('click', function () {
        if (fullscreenElement.requestFullscreen) {
            fullscreenElement.requestFullscreen();
        } else if (fullscreenElement.webkitRequestFullscreen) {
            fullscreenElement.webkitRequestFullscreen();
        } else if (fullscreenElement.mozRequestFullScreen) {
            fullscreenElement.mozRequestFullScreen();
        } else if (fullscreenElement.msRequestFullscreen) {
            fullscreenElement.msRequestFullscreen();
        }
    });

    if (document.fullscreenEnabled) {
        document.addEventListener('fullscreenchange', onFullscreenChange);
    } else if (document.webkitFullscreenEnabled) {
        document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    } else if (document.mozFullsSreenEnabled) {
        document.addEventListener('mozfullscreenchange', onFullscreenChange);
    } else if (document.msFullscreenEnabled) {
        document.addEventListener('msfullscreenchange', onFullscreenChange);
    }

}

exports.isFullscreenSupported = isFullscreenSupported;
exports.attachFullscreenHandler = attachFullscreenHandler;

},{}],2:[function(require,module,exports){
/**
 * JZT User Experience: High Score Listener
 * Copyright © 2014 Mark McIntyre
 * @author Mark McIntyre
 */

/*jslint node: true */

'use strict';

/**
 * HighScoreListener is a notification listener that specifically expects victory and gameover
 * events so that it can display a high score to the player.
 *
 * @param {object} alertElement - A DOM element of an alert to display
 */
function HighScoreListener(alertElement) {

    var me = this;

    this.alertElement = alertElement;
    this.types = ['victory', 'game-over', 'file-management'];

    alertElement.querySelector('.close').addEventListener('click', function () {
        me.alertElement.classList.remove('in');
    }, false);

}

/**
 * An event to be triggered when this HighScoreListener should display a victory or
 * game over notification.
 *
 * @param {string} type - A type of notification to display
 * @param {object} notification - Notification details
 */
HighScoreListener.prototype.callback = function (type, notification) {

    var hours,
        minutes,
        seconds,
        formattedScore,
        messageElement  = this.alertElement.querySelector('.message'),
        scoreElement    = this.alertElement.querySelector('.score'),
        playtimeElement = this.alertElement.querySelector('.playtime'),
        scoreValue      = scoreElement.querySelector('.value'),
        playtimeValue   = playtimeElement.querySelector('.value'),
        shareButton     = this.alertElement.querySelector('.social-share'),
        shareMessage    = this.alertElement.querySelector('.clipboard'),
        gameTitle       = shareButton.dataset.gameTitle,
        me              = this;

    function template (score, game, url) {
        return `I just scored ${score} points playing ${game}! ${url} #JZT`;
    };

    setTimeout(function () {

        // Depending on our type of notification...
        if (type === 'victory') {

            // The player has won!
            messageElement.innerHTML = 'Congratulations; you’ve won!';

            // Calculate our total play time
            hours = Math.floor(notification.time / 36e5);
            minutes = Math.floor((notification.time % 36e5) / 6e4);
            seconds = Math.floor((notification.time % 6e4) / 1000);

            seconds = seconds < 9 ? '0' + seconds : seconds;
            minutes = minutes < 9 ? '0' + minutes : minutes;
            hours = hours < 9 ? '0' + hours : hours;

            playtimeElement.style.display = 'block';
            playtimeValue.innerHTML = hours + ':' + minutes + ':' + seconds;


        } else if (type === 'game-over') {

            // It's game over
            messageElement.innerHTML = 'Better luck next time!';

            // No need to display the playtime
            playtimeElement.style.display = 'none';

        } else {

            // Anything else...
            me.alertElement.classList.remove('in');
            return;

        }

        // Show our score
        formattedScore = notification.score.toLocaleString('en');
        scoreValue.innerHTML = formattedScore;

        // Share on social
        shareButton.addEventListener('click', function () {
            navigator.clipboard.writeText(template(formattedScore, gameTitle, window.location));
            shareMessage.classList.add('active');
            setTimeout(function () {
                shareMessage.classList.remove('active');
            }, 5000);
        });

        me.alertElement.classList.add('in');

    }, type === 'victory' || type === 'game-over' ? 1000 : 0);

};

exports.HighScoreListener = HighScoreListener;

},{}],3:[function(require,module,exports){

/**
 * JZT User Experience: High Score Listener
 * Copyright © 2014 Mark McIntyre
 * @author Mark McIntyre
 */

/*jslint node: true */
/*global jzt */

'use strict';

var HighScoreListener = require('./highscore').HighScoreListener,
    Settings = require('./settings').Settings,
    isFullscreenSupported = require('./fullscreen').isFullscreenSupported,
    attachFullscreenHandler = require('./fullscreen').attachFullscreenHandler;

function initializeJzt() {

    var settingsElement = document.getElementById('settings-bar'),
        fullscreenElement = settingsElement.querySelector('.full-screen'),
        gameElement = document.getElementById('game-area'),
        canvasElement = gameElement.querySelector('canvas'),
        highScoreListener = new HighScoreListener(gameElement.querySelector('.alert')),
        jztWorld = gameElement.getAttribute('data-jzt-world'),
        game;

    game = new jzt.Game({
        canvasElement: canvasElement,
        notificationListeners: [highScoreListener],
        onLoadCallback: function (success) {
            if (success) {
                game.run('/assets/data/jzt/' + jztWorld + '.json');
                game.observeSettings(new Settings(settingsElement));
            } else {
                document.getElementById('unsupported-browser').style.display = 'block';
                canvasElement.parentNode.removeChild(canvasElement);
            }
        }
    });

    settingsElement.classList.remove('inactive');

    if (isFullscreenSupported()) {
        attachFullscreenHandler(fullscreenElement, gameElement);
    } else {
        fullscreenElement = fullscreenElement.parentNode;
        fullscreenElement.parentNode.removeChild(fullscreenElement);
    }

}

(function () {

    var gameElement = document.getElementById('game-area'),
        startElement = document.querySelector('.start'),
        keyboardElement = document.querySelector('.keyboard-required');

    if ("ontouchstart" in document.documentElement) {
        keyboardElement.classList.add('active');
    }

    startElement.addEventListener('click', function () {
        gameElement.removeChild(startElement);
        initializeJzt();
    });

}());

},{"./fullscreen":1,"./highscore":2,"./settings":4}],4:[function(require,module,exports){
/**
 * JZT User Experience: Settings UX
 * Copyright © 2014 Mark McIntyre
 * @author Mark McIntyre
 */

/*jslint node:true */

'use strict';

/**
 * Settings is a user experience controller that notifies interested listeners
 * in user-initiated changes in settings to volume, mute capabilities, and language.
 *
 * @param {object} settingsElement - A DOM element containing the UX elements
 */
function Settings(settingsElement) {

    var me = this;

    if (!(this instanceof Settings)) {
        throw 'Settings must be constructed with new';
    }

    this.listenerCallbacks = [];
    this.audioMuteElement = settingsElement.querySelector('.mute');
    this.audioVolumeElement = settingsElement.querySelector('input[name=\'audio-volume\']');
    this.languageElement = settingsElement.querySelector('select[name=\'language\']');

    if (this.audioMuteElement) {
        this.audioMuteElement.addEventListener('click', function (event) {
            var button = event.target.closest('.button');
            button.classList.toggle('active');
            me.notify({audioMute: button.classList.contains('active')});
        });
    }

    if (this.audioVolumeElement) {
        this.audioVolumeElement.addEventListener('change', function (event) {
            me.notify({audioVolume: parseFloat(event.target.value) / 10});
        });
    }

    if (this.languageElement) {
        this.languageElement.addEventListener('change', function (event) {
            me.notify({language: event.target.value});
        });
    }

}

/**
 * Adds a provided listener callback function to this Setting's collection of
 * interested parties.
 *
 * @param listenerCallback - A callback function to be initiated when settings change
 */
Settings.prototype.addListener = function (listenerCallback) {
    this.listenerCallbacks.push(listenerCallback);
};

/**
 * Notifies all of this Setting's listeners that one or more settings have changed.
 *
 * @param {object} settings: An object containing the setting names and new values.
 */
Settings.prototype.notify = function (settings) {
    var index;

    for (index = 0; index < this.listenerCallbacks.length; index += 1) {
        this.listenerCallbacks[index](settings);
    }
};

/**
 * Initializes this Settings instance with some initial values to use for its
 * user interface.
 *
 * @param initialSettings - An object containing initial settings
 */
Settings.prototype.initialize = function (initialSettings) {

    if (initialSettings.audioActive) {
        if (this.audioMuteElement) {
            if(initialSettings.audioMute) {
                this.audioMuteElement.classList.add('active');
            } else {
                this.audioMuteElement.classList.remove('active');
            }
        }
        if (this.audioVolumeElement) {
            this.audioVolumeElement.value = initialSettings.audioVolume * 10;
        }
    } else {
        if (this.audioMuteElement) {
            this.audioMuteElement.classList.add('active');
        }
        if (this.audioVolumeElement) {
            this.audioVolumeElement.disabled = true;
        }
    }

    if (this.languageElement) {
        this.languageElement.value = initialSettings.language;
    }

};

exports.Settings = Settings;

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvZnVsbHNjcmVlbi5qcyIsInNyYy9qcy9oaWdoc2NvcmUuanMiLCJzcmMvanMvanp0LXV4LmpzIiwic3JjL2pzL3NldHRpbmdzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyoqXG4gKiBKWlQgVXNlciBFeHBlcmllbmNlOiBGdWxsU2NyZWVuXG4gKiBDb3B5cmlnaHQgwqkgMjAxNCBNYXJrIE1jSW50eXJlXG4gKiBAYXV0aG9yIE1hcmsgTWNJbnR5cmVcbiAqL1xuXG4vKmpzbGludCBub2RlOiB0cnVlICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gaXNGdWxsc2NyZWVuU3VwcG9ydGVkKCkge1xuICAgIHJldHVybiBkb2N1bWVudC5mdWxsc2NyZWVuRW5hYmxlZCB8fCBkb2N1bWVudC53ZWJraXRGdWxsc2NyZWVuRW5hYmxlZCB8fCBkb2N1bWVudC5tb3pGdWxsU2NyZWVuRW5hYmxlZCB8fCBkb2N1bWVudC5tc0Z1bGxzY3JlZW5FbmFibGVkO1xufVxuXG5mdW5jdGlvbiBhdHRhY2hGdWxsc2NyZWVuSGFuZGxlcihidXR0b25FbGVtZW50LCBmdWxsc2NyZWVuRWxlbWVudCkge1xuXG4gICAgZnVuY3Rpb24gaXNGdWxsc2NyZWVuKCkge1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQuZnVsbHNjcmVlbiB8fCBkb2N1bWVudC5tb3pGdWxsU2NyZWVuIHx8IGRvY3VtZW50LndlYmtpdElzRnVsbFNjcmVlbiB8fCBkb2N1bWVudC5tc0Z1bGxzY3JlZW5FbGVtZW50O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uRnVsbHNjcmVlbkNoYW5nZSgpIHtcblxuICAgICAgICBpZiAoaXNGdWxsc2NyZWVuKCkpIHtcbiAgICAgICAgICAgIGZ1bGxzY3JlZW5FbGVtZW50LnN0eWxlLmhlaWdodCA9ICcxMDAlJztcbiAgICAgICAgICAgIGZ1bGxzY3JlZW5FbGVtZW50LnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZnVsbHNjcmVlbkVsZW1lbnQuc3R5bGUud2lkdGggPSAnODAwcHgnO1xuICAgICAgICAgICAgZnVsbHNjcmVlbkVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJzY0MHB4JztcbiAgICAgICAgfVxuXG4gICAgICAgIGJ1dHRvbkVsZW1lbnQuY2hlY2tlZCA9IGZhbHNlO1xuXG4gICAgfVxuXG4gICAgYnV0dG9uRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGZ1bGxzY3JlZW5FbGVtZW50LnJlcXVlc3RGdWxsc2NyZWVuKSB7XG4gICAgICAgICAgICBmdWxsc2NyZWVuRWxlbWVudC5yZXF1ZXN0RnVsbHNjcmVlbigpO1xuICAgICAgICB9IGVsc2UgaWYgKGZ1bGxzY3JlZW5FbGVtZW50LndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKSB7XG4gICAgICAgICAgICBmdWxsc2NyZWVuRWxlbWVudC53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbigpO1xuICAgICAgICB9IGVsc2UgaWYgKGZ1bGxzY3JlZW5FbGVtZW50Lm1velJlcXVlc3RGdWxsU2NyZWVuKSB7XG4gICAgICAgICAgICBmdWxsc2NyZWVuRWxlbWVudC5tb3pSZXF1ZXN0RnVsbFNjcmVlbigpO1xuICAgICAgICB9IGVsc2UgaWYgKGZ1bGxzY3JlZW5FbGVtZW50Lm1zUmVxdWVzdEZ1bGxzY3JlZW4pIHtcbiAgICAgICAgICAgIGZ1bGxzY3JlZW5FbGVtZW50Lm1zUmVxdWVzdEZ1bGxzY3JlZW4oKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKGRvY3VtZW50LmZ1bGxzY3JlZW5FbmFibGVkKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2Z1bGxzY3JlZW5jaGFuZ2UnLCBvbkZ1bGxzY3JlZW5DaGFuZ2UpO1xuICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQud2Via2l0RnVsbHNjcmVlbkVuYWJsZWQpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignd2Via2l0ZnVsbHNjcmVlbmNoYW5nZScsIG9uRnVsbHNjcmVlbkNoYW5nZSk7XG4gICAgfSBlbHNlIGlmIChkb2N1bWVudC5tb3pGdWxsc1NyZWVuRW5hYmxlZCkge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3pmdWxsc2NyZWVuY2hhbmdlJywgb25GdWxsc2NyZWVuQ2hhbmdlKTtcbiAgICB9IGVsc2UgaWYgKGRvY3VtZW50Lm1zRnVsbHNjcmVlbkVuYWJsZWQpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbXNmdWxsc2NyZWVuY2hhbmdlJywgb25GdWxsc2NyZWVuQ2hhbmdlKTtcbiAgICB9XG5cbn1cblxuZXhwb3J0cy5pc0Z1bGxzY3JlZW5TdXBwb3J0ZWQgPSBpc0Z1bGxzY3JlZW5TdXBwb3J0ZWQ7XG5leHBvcnRzLmF0dGFjaEZ1bGxzY3JlZW5IYW5kbGVyID0gYXR0YWNoRnVsbHNjcmVlbkhhbmRsZXI7XG4iLCIvKipcbiAqIEpaVCBVc2VyIEV4cGVyaWVuY2U6IEhpZ2ggU2NvcmUgTGlzdGVuZXJcbiAqIENvcHlyaWdodCDCqSAyMDE0IE1hcmsgTWNJbnR5cmVcbiAqIEBhdXRob3IgTWFyayBNY0ludHlyZVxuICovXG5cbi8qanNsaW50IG5vZGU6IHRydWUgKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEhpZ2hTY29yZUxpc3RlbmVyIGlzIGEgbm90aWZpY2F0aW9uIGxpc3RlbmVyIHRoYXQgc3BlY2lmaWNhbGx5IGV4cGVjdHMgdmljdG9yeSBhbmQgZ2FtZW92ZXJcbiAqIGV2ZW50cyBzbyB0aGF0IGl0IGNhbiBkaXNwbGF5IGEgaGlnaCBzY29yZSB0byB0aGUgcGxheWVyLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBhbGVydEVsZW1lbnQgLSBBIERPTSBlbGVtZW50IG9mIGFuIGFsZXJ0IHRvIGRpc3BsYXlcbiAqL1xuZnVuY3Rpb24gSGlnaFNjb3JlTGlzdGVuZXIoYWxlcnRFbGVtZW50KSB7XG5cbiAgICB2YXIgbWUgPSB0aGlzO1xuXG4gICAgdGhpcy5hbGVydEVsZW1lbnQgPSBhbGVydEVsZW1lbnQ7XG4gICAgdGhpcy50eXBlcyA9IFsndmljdG9yeScsICdnYW1lLW92ZXInLCAnZmlsZS1tYW5hZ2VtZW50J107XG5cbiAgICBhbGVydEVsZW1lbnQucXVlcnlTZWxlY3RvcignLmNsb3NlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIG1lLmFsZXJ0RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpbicpO1xuICAgIH0sIGZhbHNlKTtcblxufVxuXG4vKipcbiAqIEFuIGV2ZW50IHRvIGJlIHRyaWdnZXJlZCB3aGVuIHRoaXMgSGlnaFNjb3JlTGlzdGVuZXIgc2hvdWxkIGRpc3BsYXkgYSB2aWN0b3J5IG9yXG4gKiBnYW1lIG92ZXIgbm90aWZpY2F0aW9uLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gQSB0eXBlIG9mIG5vdGlmaWNhdGlvbiB0byBkaXNwbGF5XG4gKiBAcGFyYW0ge29iamVjdH0gbm90aWZpY2F0aW9uIC0gTm90aWZpY2F0aW9uIGRldGFpbHNcbiAqL1xuSGlnaFNjb3JlTGlzdGVuZXIucHJvdG90eXBlLmNhbGxiYWNrID0gZnVuY3Rpb24gKHR5cGUsIG5vdGlmaWNhdGlvbikge1xuXG4gICAgdmFyIGhvdXJzLFxuICAgICAgICBtaW51dGVzLFxuICAgICAgICBzZWNvbmRzLFxuICAgICAgICBmb3JtYXR0ZWRTY29yZSxcbiAgICAgICAgbWVzc2FnZUVsZW1lbnQgID0gdGhpcy5hbGVydEVsZW1lbnQucXVlcnlTZWxlY3RvcignLm1lc3NhZ2UnKSxcbiAgICAgICAgc2NvcmVFbGVtZW50ICAgID0gdGhpcy5hbGVydEVsZW1lbnQucXVlcnlTZWxlY3RvcignLnNjb3JlJyksXG4gICAgICAgIHBsYXl0aW1lRWxlbWVudCA9IHRoaXMuYWxlcnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wbGF5dGltZScpLFxuICAgICAgICBzY29yZVZhbHVlICAgICAgPSBzY29yZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLnZhbHVlJyksXG4gICAgICAgIHBsYXl0aW1lVmFsdWUgICA9IHBsYXl0aW1lRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcudmFsdWUnKSxcbiAgICAgICAgc2hhcmVCdXR0b24gICAgID0gdGhpcy5hbGVydEVsZW1lbnQucXVlcnlTZWxlY3RvcignLnNvY2lhbC1zaGFyZScpLFxuICAgICAgICBzaGFyZU1lc3NhZ2UgICAgPSB0aGlzLmFsZXJ0RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuY2xpcGJvYXJkJyksXG4gICAgICAgIGdhbWVUaXRsZSAgICAgICA9IHNoYXJlQnV0dG9uLmRhdGFzZXQuZ2FtZVRpdGxlLFxuICAgICAgICBtZSAgICAgICAgICAgICAgPSB0aGlzO1xuXG4gICAgZnVuY3Rpb24gdGVtcGxhdGUgKHNjb3JlLCBnYW1lLCB1cmwpIHtcbiAgICAgICAgcmV0dXJuIGBJIGp1c3Qgc2NvcmVkICR7c2NvcmV9IHBvaW50cyBwbGF5aW5nICR7Z2FtZX0hICR7dXJsfSAjSlpUYDtcbiAgICB9O1xuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgLy8gRGVwZW5kaW5nIG9uIG91ciB0eXBlIG9mIG5vdGlmaWNhdGlvbi4uLlxuICAgICAgICBpZiAodHlwZSA9PT0gJ3ZpY3RvcnknKSB7XG5cbiAgICAgICAgICAgIC8vIFRoZSBwbGF5ZXIgaGFzIHdvbiFcbiAgICAgICAgICAgIG1lc3NhZ2VFbGVtZW50LmlubmVySFRNTCA9ICdDb25ncmF0dWxhdGlvbnM7IHlvdeKAmXZlIHdvbiEnO1xuXG4gICAgICAgICAgICAvLyBDYWxjdWxhdGUgb3VyIHRvdGFsIHBsYXkgdGltZVxuICAgICAgICAgICAgaG91cnMgPSBNYXRoLmZsb29yKG5vdGlmaWNhdGlvbi50aW1lIC8gMzZlNSk7XG4gICAgICAgICAgICBtaW51dGVzID0gTWF0aC5mbG9vcigobm90aWZpY2F0aW9uLnRpbWUgJSAzNmU1KSAvIDZlNCk7XG4gICAgICAgICAgICBzZWNvbmRzID0gTWF0aC5mbG9vcigobm90aWZpY2F0aW9uLnRpbWUgJSA2ZTQpIC8gMTAwMCk7XG5cbiAgICAgICAgICAgIHNlY29uZHMgPSBzZWNvbmRzIDwgOSA/ICcwJyArIHNlY29uZHMgOiBzZWNvbmRzO1xuICAgICAgICAgICAgbWludXRlcyA9IG1pbnV0ZXMgPCA5ID8gJzAnICsgbWludXRlcyA6IG1pbnV0ZXM7XG4gICAgICAgICAgICBob3VycyA9IGhvdXJzIDwgOSA/ICcwJyArIGhvdXJzIDogaG91cnM7XG5cbiAgICAgICAgICAgIHBsYXl0aW1lRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgIHBsYXl0aW1lVmFsdWUuaW5uZXJIVE1MID0gaG91cnMgKyAnOicgKyBtaW51dGVzICsgJzonICsgc2Vjb25kcztcblxuXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2dhbWUtb3ZlcicpIHtcblxuICAgICAgICAgICAgLy8gSXQncyBnYW1lIG92ZXJcbiAgICAgICAgICAgIG1lc3NhZ2VFbGVtZW50LmlubmVySFRNTCA9ICdCZXR0ZXIgbHVjayBuZXh0IHRpbWUhJztcblxuICAgICAgICAgICAgLy8gTm8gbmVlZCB0byBkaXNwbGF5IHRoZSBwbGF5dGltZVxuICAgICAgICAgICAgcGxheXRpbWVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgLy8gQW55dGhpbmcgZWxzZS4uLlxuICAgICAgICAgICAgbWUuYWxlcnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2luJyk7XG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNob3cgb3VyIHNjb3JlXG4gICAgICAgIGZvcm1hdHRlZFNjb3JlID0gbm90aWZpY2F0aW9uLnNjb3JlLnRvTG9jYWxlU3RyaW5nKCdlbicpO1xuICAgICAgICBzY29yZVZhbHVlLmlubmVySFRNTCA9IGZvcm1hdHRlZFNjb3JlO1xuXG4gICAgICAgIC8vIFNoYXJlIG9uIHNvY2lhbFxuICAgICAgICBzaGFyZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRlbXBsYXRlKGZvcm1hdHRlZFNjb3JlLCBnYW1lVGl0bGUsIHdpbmRvdy5sb2NhdGlvbikpO1xuICAgICAgICAgICAgc2hhcmVNZXNzYWdlLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2hhcmVNZXNzYWdlLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgfSwgNTAwMCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG1lLmFsZXJ0RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpbicpO1xuXG4gICAgfSwgdHlwZSA9PT0gJ3ZpY3RvcnknIHx8IHR5cGUgPT09ICdnYW1lLW92ZXInID8gMTAwMCA6IDApO1xuXG59O1xuXG5leHBvcnRzLkhpZ2hTY29yZUxpc3RlbmVyID0gSGlnaFNjb3JlTGlzdGVuZXI7XG4iLCJcbi8qKlxuICogSlpUIFVzZXIgRXhwZXJpZW5jZTogSGlnaCBTY29yZSBMaXN0ZW5lclxuICogQ29weXJpZ2h0IMKpIDIwMTQgTWFyayBNY0ludHlyZVxuICogQGF1dGhvciBNYXJrIE1jSW50eXJlXG4gKi9cblxuLypqc2xpbnQgbm9kZTogdHJ1ZSAqL1xuLypnbG9iYWwganp0ICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEhpZ2hTY29yZUxpc3RlbmVyID0gcmVxdWlyZSgnLi9oaWdoc2NvcmUnKS5IaWdoU2NvcmVMaXN0ZW5lcixcbiAgICBTZXR0aW5ncyA9IHJlcXVpcmUoJy4vc2V0dGluZ3MnKS5TZXR0aW5ncyxcbiAgICBpc0Z1bGxzY3JlZW5TdXBwb3J0ZWQgPSByZXF1aXJlKCcuL2Z1bGxzY3JlZW4nKS5pc0Z1bGxzY3JlZW5TdXBwb3J0ZWQsXG4gICAgYXR0YWNoRnVsbHNjcmVlbkhhbmRsZXIgPSByZXF1aXJlKCcuL2Z1bGxzY3JlZW4nKS5hdHRhY2hGdWxsc2NyZWVuSGFuZGxlcjtcblxuZnVuY3Rpb24gaW5pdGlhbGl6ZUp6dCgpIHtcblxuICAgIHZhciBzZXR0aW5nc0VsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2V0dGluZ3MtYmFyJyksXG4gICAgICAgIGZ1bGxzY3JlZW5FbGVtZW50ID0gc2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5mdWxsLXNjcmVlbicpLFxuICAgICAgICBnYW1lRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lLWFyZWEnKSxcbiAgICAgICAgY2FudmFzRWxlbWVudCA9IGdhbWVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpLFxuICAgICAgICBoaWdoU2NvcmVMaXN0ZW5lciA9IG5ldyBIaWdoU2NvcmVMaXN0ZW5lcihnYW1lRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYWxlcnQnKSksXG4gICAgICAgIGp6dFdvcmxkID0gZ2FtZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWp6dC13b3JsZCcpLFxuICAgICAgICBnYW1lO1xuXG4gICAgZ2FtZSA9IG5ldyBqenQuR2FtZSh7XG4gICAgICAgIGNhbnZhc0VsZW1lbnQ6IGNhbnZhc0VsZW1lbnQsXG4gICAgICAgIG5vdGlmaWNhdGlvbkxpc3RlbmVyczogW2hpZ2hTY29yZUxpc3RlbmVyXSxcbiAgICAgICAgb25Mb2FkQ2FsbGJhY2s6IGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgICAgICAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIGdhbWUucnVuKCcvYXNzZXRzL2RhdGEvanp0LycgKyBqenRXb3JsZCArICcuanNvbicpO1xuICAgICAgICAgICAgICAgIGdhbWUub2JzZXJ2ZVNldHRpbmdzKG5ldyBTZXR0aW5ncyhzZXR0aW5nc0VsZW1lbnQpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Vuc3VwcG9ydGVkLWJyb3dzZXInKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICBjYW52YXNFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoY2FudmFzRWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHNldHRpbmdzRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpbmFjdGl2ZScpO1xuXG4gICAgaWYgKGlzRnVsbHNjcmVlblN1cHBvcnRlZCgpKSB7XG4gICAgICAgIGF0dGFjaEZ1bGxzY3JlZW5IYW5kbGVyKGZ1bGxzY3JlZW5FbGVtZW50LCBnYW1lRWxlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZnVsbHNjcmVlbkVsZW1lbnQgPSBmdWxsc2NyZWVuRWxlbWVudC5wYXJlbnROb2RlO1xuICAgICAgICBmdWxsc2NyZWVuRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGZ1bGxzY3JlZW5FbGVtZW50KTtcbiAgICB9XG5cbn1cblxuKGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBnYW1lRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lLWFyZWEnKSxcbiAgICAgICAgc3RhcnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnN0YXJ0JyksXG4gICAgICAgIGtleWJvYXJkRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5rZXlib2FyZC1yZXF1aXJlZCcpO1xuXG4gICAgaWYgKFwib250b3VjaHN0YXJ0XCIgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSB7XG4gICAgICAgIGtleWJvYXJkRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICB9XG5cbiAgICBzdGFydEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGdhbWVFbGVtZW50LnJlbW92ZUNoaWxkKHN0YXJ0RWxlbWVudCk7XG4gICAgICAgIGluaXRpYWxpemVKenQoKTtcbiAgICB9KTtcblxufSgpKTtcbiIsIi8qKlxuICogSlpUIFVzZXIgRXhwZXJpZW5jZTogU2V0dGluZ3MgVVhcbiAqIENvcHlyaWdodCDCqSAyMDE0IE1hcmsgTWNJbnR5cmVcbiAqIEBhdXRob3IgTWFyayBNY0ludHlyZVxuICovXG5cbi8qanNsaW50IG5vZGU6dHJ1ZSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU2V0dGluZ3MgaXMgYSB1c2VyIGV4cGVyaWVuY2UgY29udHJvbGxlciB0aGF0IG5vdGlmaWVzIGludGVyZXN0ZWQgbGlzdGVuZXJzXG4gKiBpbiB1c2VyLWluaXRpYXRlZCBjaGFuZ2VzIGluIHNldHRpbmdzIHRvIHZvbHVtZSwgbXV0ZSBjYXBhYmlsaXRpZXMsIGFuZCBsYW5ndWFnZS5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gc2V0dGluZ3NFbGVtZW50IC0gQSBET00gZWxlbWVudCBjb250YWluaW5nIHRoZSBVWCBlbGVtZW50c1xuICovXG5mdW5jdGlvbiBTZXR0aW5ncyhzZXR0aW5nc0VsZW1lbnQpIHtcblxuICAgIHZhciBtZSA9IHRoaXM7XG5cbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgU2V0dGluZ3MpKSB7XG4gICAgICAgIHRocm93ICdTZXR0aW5ncyBtdXN0IGJlIGNvbnN0cnVjdGVkIHdpdGggbmV3JztcbiAgICB9XG5cbiAgICB0aGlzLmxpc3RlbmVyQ2FsbGJhY2tzID0gW107XG4gICAgdGhpcy5hdWRpb011dGVFbGVtZW50ID0gc2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tdXRlJyk7XG4gICAgdGhpcy5hdWRpb1ZvbHVtZUVsZW1lbnQgPSBzZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cXCdhdWRpby12b2x1bWVcXCddJyk7XG4gICAgdGhpcy5sYW5ndWFnZUVsZW1lbnQgPSBzZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9XFwnbGFuZ3VhZ2VcXCddJyk7XG5cbiAgICBpZiAodGhpcy5hdWRpb011dGVFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuYXVkaW9NdXRlRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgdmFyIGJ1dHRvbiA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCcuYnV0dG9uJyk7XG4gICAgICAgICAgICBidXR0b24uY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJyk7XG4gICAgICAgICAgICBtZS5ub3RpZnkoe2F1ZGlvTXV0ZTogYnV0dG9uLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJyl9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYXVkaW9Wb2x1bWVFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuYXVkaW9Wb2x1bWVFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgbWUubm90aWZ5KHthdWRpb1ZvbHVtZTogcGFyc2VGbG9hdChldmVudC50YXJnZXQudmFsdWUpIC8gMTB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMubGFuZ3VhZ2VFbGVtZW50KSB7XG4gICAgICAgIHRoaXMubGFuZ3VhZ2VFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgbWUubm90aWZ5KHtsYW5ndWFnZTogZXZlbnQudGFyZ2V0LnZhbHVlfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxufVxuXG4vKipcbiAqIEFkZHMgYSBwcm92aWRlZCBsaXN0ZW5lciBjYWxsYmFjayBmdW5jdGlvbiB0byB0aGlzIFNldHRpbmcncyBjb2xsZWN0aW9uIG9mXG4gKiBpbnRlcmVzdGVkIHBhcnRpZXMuXG4gKlxuICogQHBhcmFtIGxpc3RlbmVyQ2FsbGJhY2sgLSBBIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGluaXRpYXRlZCB3aGVuIHNldHRpbmdzIGNoYW5nZVxuICovXG5TZXR0aW5ncy5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbiAobGlzdGVuZXJDYWxsYmFjaykge1xuICAgIHRoaXMubGlzdGVuZXJDYWxsYmFja3MucHVzaChsaXN0ZW5lckNhbGxiYWNrKTtcbn07XG5cbi8qKlxuICogTm90aWZpZXMgYWxsIG9mIHRoaXMgU2V0dGluZydzIGxpc3RlbmVycyB0aGF0IG9uZSBvciBtb3JlIHNldHRpbmdzIGhhdmUgY2hhbmdlZC5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gc2V0dGluZ3M6IEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBzZXR0aW5nIG5hbWVzIGFuZCBuZXcgdmFsdWVzLlxuICovXG5TZXR0aW5ncy5wcm90b3R5cGUubm90aWZ5ID0gZnVuY3Rpb24gKHNldHRpbmdzKSB7XG4gICAgdmFyIGluZGV4O1xuXG4gICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5saXN0ZW5lckNhbGxiYWNrcy5sZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lckNhbGxiYWNrc1tpbmRleF0oc2V0dGluZ3MpO1xuICAgIH1cbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZXMgdGhpcyBTZXR0aW5ncyBpbnN0YW5jZSB3aXRoIHNvbWUgaW5pdGlhbCB2YWx1ZXMgdG8gdXNlIGZvciBpdHNcbiAqIHVzZXIgaW50ZXJmYWNlLlxuICpcbiAqIEBwYXJhbSBpbml0aWFsU2V0dGluZ3MgLSBBbiBvYmplY3QgY29udGFpbmluZyBpbml0aWFsIHNldHRpbmdzXG4gKi9cblNldHRpbmdzLnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24gKGluaXRpYWxTZXR0aW5ncykge1xuXG4gICAgaWYgKGluaXRpYWxTZXR0aW5ncy5hdWRpb0FjdGl2ZSkge1xuICAgICAgICBpZiAodGhpcy5hdWRpb011dGVFbGVtZW50KSB7XG4gICAgICAgICAgICBpZihpbml0aWFsU2V0dGluZ3MuYXVkaW9NdXRlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpb011dGVFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvTXV0ZUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYXVkaW9Wb2x1bWVFbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvVm9sdW1lRWxlbWVudC52YWx1ZSA9IGluaXRpYWxTZXR0aW5ncy5hdWRpb1ZvbHVtZSAqIDEwO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMuYXVkaW9NdXRlRWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5hdWRpb011dGVFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmF1ZGlvVm9sdW1lRWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5hdWRpb1ZvbHVtZUVsZW1lbnQuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMubGFuZ3VhZ2VFbGVtZW50KSB7XG4gICAgICAgIHRoaXMubGFuZ3VhZ2VFbGVtZW50LnZhbHVlID0gaW5pdGlhbFNldHRpbmdzLmxhbmd1YWdlO1xuICAgIH1cblxufTtcblxuZXhwb3J0cy5TZXR0aW5ncyA9IFNldHRpbmdzO1xuIl19
