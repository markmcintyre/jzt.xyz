(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * JZT User Experience: FullScreen
 * Copyright © 2014 Mark McIntyre
 * @author Mark McIntyre
 */

/*jslint node: true */

'use strict';

function isFullscreenSupported() {
    return document.fullscreenEnabled || document.webkitFullscreenEnabled;
}

function attachFullscreenHandler(buttonElement, fullscreenElement) {

    function onFullscreenChange() {
        buttonElement.checked = false;
    }

    buttonElement.addEventListener('click', function () {
        if (fullscreenElement.requestFullscreen) {
            fullscreenElement.requestFullscreen();
        } else if (fullscreenElement.webkitRequestFullscreen) {
            fullscreenElement.webkitRequestFullscreen();
        }
    });

    if (document.fullscreenElement || document.webkitFullscreenElement) {
        document.addEventListener('fullscreenchange', onFullscreenChange);
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

    canvasElement.classList.add('active');

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
        fullscreenElement.parentNode.removeChild(fullscreenElement);
    }

}

(function () {

    var gameElement = document.getElementById('game-area'),
        startElement = gameElement.querySelector('.start'),
        keyboardElement = gameElement.querySelector('.keyboard-required');

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvZnVsbHNjcmVlbi5qcyIsInNyYy9qcy9oaWdoc2NvcmUuanMiLCJzcmMvanMvanp0LXV4LmpzIiwic3JjL2pzL3NldHRpbmdzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKipcbiAqIEpaVCBVc2VyIEV4cGVyaWVuY2U6IEZ1bGxTY3JlZW5cbiAqIENvcHlyaWdodCDCqSAyMDE0IE1hcmsgTWNJbnR5cmVcbiAqIEBhdXRob3IgTWFyayBNY0ludHlyZVxuICovXG5cbi8qanNsaW50IG5vZGU6IHRydWUgKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBpc0Z1bGxzY3JlZW5TdXBwb3J0ZWQoKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmZ1bGxzY3JlZW5FbmFibGVkIHx8IGRvY3VtZW50LndlYmtpdEZ1bGxzY3JlZW5FbmFibGVkO1xufVxuXG5mdW5jdGlvbiBhdHRhY2hGdWxsc2NyZWVuSGFuZGxlcihidXR0b25FbGVtZW50LCBmdWxsc2NyZWVuRWxlbWVudCkge1xuXG4gICAgZnVuY3Rpb24gb25GdWxsc2NyZWVuQ2hhbmdlKCkge1xuICAgICAgICBidXR0b25FbGVtZW50LmNoZWNrZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBidXR0b25FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoZnVsbHNjcmVlbkVsZW1lbnQucmVxdWVzdEZ1bGxzY3JlZW4pIHtcbiAgICAgICAgICAgIGZ1bGxzY3JlZW5FbGVtZW50LnJlcXVlc3RGdWxsc2NyZWVuKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZnVsbHNjcmVlbkVsZW1lbnQud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4pIHtcbiAgICAgICAgICAgIGZ1bGxzY3JlZW5FbGVtZW50LndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChkb2N1bWVudC5mdWxsc2NyZWVuRWxlbWVudCB8fCBkb2N1bWVudC53ZWJraXRGdWxsc2NyZWVuRWxlbWVudCkge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdmdWxsc2NyZWVuY2hhbmdlJywgb25GdWxsc2NyZWVuQ2hhbmdlKTtcbiAgICB9XG5cbn1cblxuZXhwb3J0cy5pc0Z1bGxzY3JlZW5TdXBwb3J0ZWQgPSBpc0Z1bGxzY3JlZW5TdXBwb3J0ZWQ7XG5leHBvcnRzLmF0dGFjaEZ1bGxzY3JlZW5IYW5kbGVyID0gYXR0YWNoRnVsbHNjcmVlbkhhbmRsZXI7XG4iLCIvKipcbiAqIEpaVCBVc2VyIEV4cGVyaWVuY2U6IEhpZ2ggU2NvcmUgTGlzdGVuZXJcbiAqIENvcHlyaWdodCDCqSAyMDE0IE1hcmsgTWNJbnR5cmVcbiAqIEBhdXRob3IgTWFyayBNY0ludHlyZVxuICovXG5cbi8qanNsaW50IG5vZGU6IHRydWUgKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEhpZ2hTY29yZUxpc3RlbmVyIGlzIGEgbm90aWZpY2F0aW9uIGxpc3RlbmVyIHRoYXQgc3BlY2lmaWNhbGx5IGV4cGVjdHMgdmljdG9yeSBhbmQgZ2FtZW92ZXJcbiAqIGV2ZW50cyBzbyB0aGF0IGl0IGNhbiBkaXNwbGF5IGEgaGlnaCBzY29yZSB0byB0aGUgcGxheWVyLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBhbGVydEVsZW1lbnQgLSBBIERPTSBlbGVtZW50IG9mIGFuIGFsZXJ0IHRvIGRpc3BsYXlcbiAqL1xuZnVuY3Rpb24gSGlnaFNjb3JlTGlzdGVuZXIoYWxlcnRFbGVtZW50KSB7XG5cbiAgICB2YXIgbWUgPSB0aGlzO1xuXG4gICAgdGhpcy5hbGVydEVsZW1lbnQgPSBhbGVydEVsZW1lbnQ7XG4gICAgdGhpcy50eXBlcyA9IFsndmljdG9yeScsICdnYW1lLW92ZXInLCAnZmlsZS1tYW5hZ2VtZW50J107XG5cbiAgICBhbGVydEVsZW1lbnQucXVlcnlTZWxlY3RvcignLmNsb3NlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIG1lLmFsZXJ0RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpbicpO1xuICAgIH0sIGZhbHNlKTtcblxufVxuXG4vKipcbiAqIEFuIGV2ZW50IHRvIGJlIHRyaWdnZXJlZCB3aGVuIHRoaXMgSGlnaFNjb3JlTGlzdGVuZXIgc2hvdWxkIGRpc3BsYXkgYSB2aWN0b3J5IG9yXG4gKiBnYW1lIG92ZXIgbm90aWZpY2F0aW9uLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gQSB0eXBlIG9mIG5vdGlmaWNhdGlvbiB0byBkaXNwbGF5XG4gKiBAcGFyYW0ge29iamVjdH0gbm90aWZpY2F0aW9uIC0gTm90aWZpY2F0aW9uIGRldGFpbHNcbiAqL1xuSGlnaFNjb3JlTGlzdGVuZXIucHJvdG90eXBlLmNhbGxiYWNrID0gZnVuY3Rpb24gKHR5cGUsIG5vdGlmaWNhdGlvbikge1xuXG4gICAgdmFyIGhvdXJzLFxuICAgICAgICBtaW51dGVzLFxuICAgICAgICBzZWNvbmRzLFxuICAgICAgICBmb3JtYXR0ZWRTY29yZSxcbiAgICAgICAgbWVzc2FnZUVsZW1lbnQgID0gdGhpcy5hbGVydEVsZW1lbnQucXVlcnlTZWxlY3RvcignLm1lc3NhZ2UnKSxcbiAgICAgICAgc2NvcmVFbGVtZW50ICAgID0gdGhpcy5hbGVydEVsZW1lbnQucXVlcnlTZWxlY3RvcignLnNjb3JlJyksXG4gICAgICAgIHBsYXl0aW1lRWxlbWVudCA9IHRoaXMuYWxlcnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wbGF5dGltZScpLFxuICAgICAgICBzY29yZVZhbHVlICAgICAgPSBzY29yZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLnZhbHVlJyksXG4gICAgICAgIHBsYXl0aW1lVmFsdWUgICA9IHBsYXl0aW1lRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcudmFsdWUnKSxcbiAgICAgICAgc2hhcmVCdXR0b24gICAgID0gdGhpcy5hbGVydEVsZW1lbnQucXVlcnlTZWxlY3RvcignLnNvY2lhbC1zaGFyZScpLFxuICAgICAgICBzaGFyZU1lc3NhZ2UgICAgPSB0aGlzLmFsZXJ0RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuY2xpcGJvYXJkJyksXG4gICAgICAgIGdhbWVUaXRsZSAgICAgICA9IHNoYXJlQnV0dG9uLmRhdGFzZXQuZ2FtZVRpdGxlLFxuICAgICAgICBtZSAgICAgICAgICAgICAgPSB0aGlzO1xuXG4gICAgZnVuY3Rpb24gdGVtcGxhdGUgKHNjb3JlLCBnYW1lLCB1cmwpIHtcbiAgICAgICAgcmV0dXJuIGBJIGp1c3Qgc2NvcmVkICR7c2NvcmV9IHBvaW50cyBwbGF5aW5nICR7Z2FtZX0hICR7dXJsfSAjSlpUYDtcbiAgICB9O1xuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgLy8gRGVwZW5kaW5nIG9uIG91ciB0eXBlIG9mIG5vdGlmaWNhdGlvbi4uLlxuICAgICAgICBpZiAodHlwZSA9PT0gJ3ZpY3RvcnknKSB7XG5cbiAgICAgICAgICAgIC8vIFRoZSBwbGF5ZXIgaGFzIHdvbiFcbiAgICAgICAgICAgIG1lc3NhZ2VFbGVtZW50LmlubmVySFRNTCA9ICdDb25ncmF0dWxhdGlvbnM7IHlvdeKAmXZlIHdvbiEnO1xuXG4gICAgICAgICAgICAvLyBDYWxjdWxhdGUgb3VyIHRvdGFsIHBsYXkgdGltZVxuICAgICAgICAgICAgaG91cnMgPSBNYXRoLmZsb29yKG5vdGlmaWNhdGlvbi50aW1lIC8gMzZlNSk7XG4gICAgICAgICAgICBtaW51dGVzID0gTWF0aC5mbG9vcigobm90aWZpY2F0aW9uLnRpbWUgJSAzNmU1KSAvIDZlNCk7XG4gICAgICAgICAgICBzZWNvbmRzID0gTWF0aC5mbG9vcigobm90aWZpY2F0aW9uLnRpbWUgJSA2ZTQpIC8gMTAwMCk7XG5cbiAgICAgICAgICAgIHNlY29uZHMgPSBzZWNvbmRzIDwgOSA/ICcwJyArIHNlY29uZHMgOiBzZWNvbmRzO1xuICAgICAgICAgICAgbWludXRlcyA9IG1pbnV0ZXMgPCA5ID8gJzAnICsgbWludXRlcyA6IG1pbnV0ZXM7XG4gICAgICAgICAgICBob3VycyA9IGhvdXJzIDwgOSA/ICcwJyArIGhvdXJzIDogaG91cnM7XG5cbiAgICAgICAgICAgIHBsYXl0aW1lRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgIHBsYXl0aW1lVmFsdWUuaW5uZXJIVE1MID0gaG91cnMgKyAnOicgKyBtaW51dGVzICsgJzonICsgc2Vjb25kcztcblxuXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2dhbWUtb3ZlcicpIHtcblxuICAgICAgICAgICAgLy8gSXQncyBnYW1lIG92ZXJcbiAgICAgICAgICAgIG1lc3NhZ2VFbGVtZW50LmlubmVySFRNTCA9ICdCZXR0ZXIgbHVjayBuZXh0IHRpbWUhJztcblxuICAgICAgICAgICAgLy8gTm8gbmVlZCB0byBkaXNwbGF5IHRoZSBwbGF5dGltZVxuICAgICAgICAgICAgcGxheXRpbWVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgLy8gQW55dGhpbmcgZWxzZS4uLlxuICAgICAgICAgICAgbWUuYWxlcnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2luJyk7XG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNob3cgb3VyIHNjb3JlXG4gICAgICAgIGZvcm1hdHRlZFNjb3JlID0gbm90aWZpY2F0aW9uLnNjb3JlLnRvTG9jYWxlU3RyaW5nKCdlbicpO1xuICAgICAgICBzY29yZVZhbHVlLmlubmVySFRNTCA9IGZvcm1hdHRlZFNjb3JlO1xuXG4gICAgICAgIC8vIFNoYXJlIG9uIHNvY2lhbFxuICAgICAgICBzaGFyZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRlbXBsYXRlKGZvcm1hdHRlZFNjb3JlLCBnYW1lVGl0bGUsIHdpbmRvdy5sb2NhdGlvbikpO1xuICAgICAgICAgICAgc2hhcmVNZXNzYWdlLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2hhcmVNZXNzYWdlLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgfSwgNTAwMCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG1lLmFsZXJ0RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpbicpO1xuXG4gICAgfSwgdHlwZSA9PT0gJ3ZpY3RvcnknIHx8IHR5cGUgPT09ICdnYW1lLW92ZXInID8gMTAwMCA6IDApO1xuXG59O1xuXG5leHBvcnRzLkhpZ2hTY29yZUxpc3RlbmVyID0gSGlnaFNjb3JlTGlzdGVuZXI7XG4iLCJcbi8qKlxuICogSlpUIFVzZXIgRXhwZXJpZW5jZTogSGlnaCBTY29yZSBMaXN0ZW5lclxuICogQ29weXJpZ2h0IMKpIDIwMTQgTWFyayBNY0ludHlyZVxuICogQGF1dGhvciBNYXJrIE1jSW50eXJlXG4gKi9cblxuLypqc2xpbnQgbm9kZTogdHJ1ZSAqL1xuLypnbG9iYWwganp0ICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEhpZ2hTY29yZUxpc3RlbmVyID0gcmVxdWlyZSgnLi9oaWdoc2NvcmUnKS5IaWdoU2NvcmVMaXN0ZW5lcixcbiAgICBTZXR0aW5ncyA9IHJlcXVpcmUoJy4vc2V0dGluZ3MnKS5TZXR0aW5ncyxcbiAgICBpc0Z1bGxzY3JlZW5TdXBwb3J0ZWQgPSByZXF1aXJlKCcuL2Z1bGxzY3JlZW4nKS5pc0Z1bGxzY3JlZW5TdXBwb3J0ZWQsXG4gICAgYXR0YWNoRnVsbHNjcmVlbkhhbmRsZXIgPSByZXF1aXJlKCcuL2Z1bGxzY3JlZW4nKS5hdHRhY2hGdWxsc2NyZWVuSGFuZGxlcjtcblxuZnVuY3Rpb24gaW5pdGlhbGl6ZUp6dCgpIHtcblxuICAgIHZhciBzZXR0aW5nc0VsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2V0dGluZ3MtYmFyJyksXG4gICAgICAgIGZ1bGxzY3JlZW5FbGVtZW50ID0gc2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5mdWxsLXNjcmVlbicpLFxuICAgICAgICBnYW1lRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lLWFyZWEnKSxcbiAgICAgICAgY2FudmFzRWxlbWVudCA9IGdhbWVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpLFxuICAgICAgICBoaWdoU2NvcmVMaXN0ZW5lciA9IG5ldyBIaWdoU2NvcmVMaXN0ZW5lcihnYW1lRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYWxlcnQnKSksXG4gICAgICAgIGp6dFdvcmxkID0gZ2FtZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWp6dC13b3JsZCcpLFxuICAgICAgICBnYW1lO1xuXG4gICAgY2FudmFzRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcblxuICAgIGdhbWUgPSBuZXcganp0LkdhbWUoe1xuICAgICAgICBjYW52YXNFbGVtZW50OiBjYW52YXNFbGVtZW50LFxuICAgICAgICBub3RpZmljYXRpb25MaXN0ZW5lcnM6IFtoaWdoU2NvcmVMaXN0ZW5lcl0sXG4gICAgICAgIG9uTG9hZENhbGxiYWNrOiBmdW5jdGlvbiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICBnYW1lLnJ1bignL2Fzc2V0cy9kYXRhL2p6dC8nICsganp0V29ybGQgKyAnLmpzb24nKTtcbiAgICAgICAgICAgICAgICBnYW1lLm9ic2VydmVTZXR0aW5ncyhuZXcgU2V0dGluZ3Moc2V0dGluZ3NFbGVtZW50KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1bnN1cHBvcnRlZC1icm93c2VyJykuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgY2FudmFzRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGNhbnZhc0VsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBzZXR0aW5nc0VsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaW5hY3RpdmUnKTtcblxuICAgIGlmIChpc0Z1bGxzY3JlZW5TdXBwb3J0ZWQoKSkge1xuICAgICAgICBhdHRhY2hGdWxsc2NyZWVuSGFuZGxlcihmdWxsc2NyZWVuRWxlbWVudCwgZ2FtZUVsZW1lbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZ1bGxzY3JlZW5FbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZnVsbHNjcmVlbkVsZW1lbnQpO1xuICAgIH1cblxufVxuXG4oZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGdhbWVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWUtYXJlYScpLFxuICAgICAgICBzdGFydEVsZW1lbnQgPSBnYW1lRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc3RhcnQnKSxcbiAgICAgICAga2V5Ym9hcmRFbGVtZW50ID0gZ2FtZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmtleWJvYXJkLXJlcXVpcmVkJyk7XG5cbiAgICBpZiAoXCJvbnRvdWNoc3RhcnRcIiBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpIHtcbiAgICAgICAga2V5Ym9hcmRFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgIH1cblxuICAgIHN0YXJ0RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZ2FtZUVsZW1lbnQucmVtb3ZlQ2hpbGQoc3RhcnRFbGVtZW50KTtcbiAgICAgICAgaW5pdGlhbGl6ZUp6dCgpO1xuICAgIH0pO1xuXG59KCkpO1xuIiwiLyoqXG4gKiBKWlQgVXNlciBFeHBlcmllbmNlOiBTZXR0aW5ncyBVWFxuICogQ29weXJpZ2h0IMKpIDIwMTQgTWFyayBNY0ludHlyZVxuICogQGF1dGhvciBNYXJrIE1jSW50eXJlXG4gKi9cblxuLypqc2xpbnQgbm9kZTp0cnVlICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTZXR0aW5ncyBpcyBhIHVzZXIgZXhwZXJpZW5jZSBjb250cm9sbGVyIHRoYXQgbm90aWZpZXMgaW50ZXJlc3RlZCBsaXN0ZW5lcnNcbiAqIGluIHVzZXItaW5pdGlhdGVkIGNoYW5nZXMgaW4gc2V0dGluZ3MgdG8gdm9sdW1lLCBtdXRlIGNhcGFiaWxpdGllcywgYW5kIGxhbmd1YWdlLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBzZXR0aW5nc0VsZW1lbnQgLSBBIERPTSBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIFVYIGVsZW1lbnRzXG4gKi9cbmZ1bmN0aW9uIFNldHRpbmdzKHNldHRpbmdzRWxlbWVudCkge1xuXG4gICAgdmFyIG1lID0gdGhpcztcblxuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBTZXR0aW5ncykpIHtcbiAgICAgICAgdGhyb3cgJ1NldHRpbmdzIG11c3QgYmUgY29uc3RydWN0ZWQgd2l0aCBuZXcnO1xuICAgIH1cblxuICAgIHRoaXMubGlzdGVuZXJDYWxsYmFja3MgPSBbXTtcbiAgICB0aGlzLmF1ZGlvTXV0ZUVsZW1lbnQgPSBzZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignLm11dGUnKTtcbiAgICB0aGlzLmF1ZGlvVm9sdW1lRWxlbWVudCA9IHNldHRpbmdzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVxcJ2F1ZGlvLXZvbHVtZVxcJ10nKTtcbiAgICB0aGlzLmxhbmd1YWdlRWxlbWVudCA9IHNldHRpbmdzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT1cXCdsYW5ndWFnZVxcJ10nKTtcblxuICAgIGlmICh0aGlzLmF1ZGlvTXV0ZUVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5hdWRpb011dGVFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgYnV0dG9uID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy5idXR0b24nKTtcbiAgICAgICAgICAgIGJ1dHRvbi5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnKTtcbiAgICAgICAgICAgIG1lLm5vdGlmeSh7YXVkaW9NdXRlOiBidXR0b24uY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKX0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5hdWRpb1ZvbHVtZUVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5hdWRpb1ZvbHVtZUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBtZS5ub3RpZnkoe2F1ZGlvVm9sdW1lOiBwYXJzZUZsb2F0KGV2ZW50LnRhcmdldC52YWx1ZSkgLyAxMH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5sYW5ndWFnZUVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5sYW5ndWFnZUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBtZS5ub3RpZnkoe2xhbmd1YWdlOiBldmVudC50YXJnZXQudmFsdWV9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG59XG5cbi8qKlxuICogQWRkcyBhIHByb3ZpZGVkIGxpc3RlbmVyIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIHRoaXMgU2V0dGluZydzIGNvbGxlY3Rpb24gb2ZcbiAqIGludGVyZXN0ZWQgcGFydGllcy5cbiAqXG4gKiBAcGFyYW0gbGlzdGVuZXJDYWxsYmFjayAtIEEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgaW5pdGlhdGVkIHdoZW4gc2V0dGluZ3MgY2hhbmdlXG4gKi9cblNldHRpbmdzLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uIChsaXN0ZW5lckNhbGxiYWNrKSB7XG4gICAgdGhpcy5saXN0ZW5lckNhbGxiYWNrcy5wdXNoKGxpc3RlbmVyQ2FsbGJhY2spO1xufTtcblxuLyoqXG4gKiBOb3RpZmllcyBhbGwgb2YgdGhpcyBTZXR0aW5nJ3MgbGlzdGVuZXJzIHRoYXQgb25lIG9yIG1vcmUgc2V0dGluZ3MgaGF2ZSBjaGFuZ2VkLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBzZXR0aW5nczogQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHNldHRpbmcgbmFtZXMgYW5kIG5ldyB2YWx1ZXMuXG4gKi9cblNldHRpbmdzLnByb3RvdHlwZS5ub3RpZnkgPSBmdW5jdGlvbiAoc2V0dGluZ3MpIHtcbiAgICB2YXIgaW5kZXg7XG5cbiAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmxpc3RlbmVyQ2FsbGJhY2tzLmxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgICAgICB0aGlzLmxpc3RlbmVyQ2FsbGJhY2tzW2luZGV4XShzZXR0aW5ncyk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBJbml0aWFsaXplcyB0aGlzIFNldHRpbmdzIGluc3RhbmNlIHdpdGggc29tZSBpbml0aWFsIHZhbHVlcyB0byB1c2UgZm9yIGl0c1xuICogdXNlciBpbnRlcmZhY2UuXG4gKlxuICogQHBhcmFtIGluaXRpYWxTZXR0aW5ncyAtIEFuIG9iamVjdCBjb250YWluaW5nIGluaXRpYWwgc2V0dGluZ3NcbiAqL1xuU2V0dGluZ3MucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbiAoaW5pdGlhbFNldHRpbmdzKSB7XG5cbiAgICBpZiAoaW5pdGlhbFNldHRpbmdzLmF1ZGlvQWN0aXZlKSB7XG4gICAgICAgIGlmICh0aGlzLmF1ZGlvTXV0ZUVsZW1lbnQpIHtcbiAgICAgICAgICAgIGlmKGluaXRpYWxTZXR0aW5ncy5hdWRpb011dGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvTXV0ZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW9NdXRlRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5hdWRpb1ZvbHVtZUVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuYXVkaW9Wb2x1bWVFbGVtZW50LnZhbHVlID0gaW5pdGlhbFNldHRpbmdzLmF1ZGlvVm9sdW1lICogMTA7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5hdWRpb011dGVFbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvTXV0ZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYXVkaW9Wb2x1bWVFbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvVm9sdW1lRWxlbWVudC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5sYW5ndWFnZUVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5sYW5ndWFnZUVsZW1lbnQudmFsdWUgPSBpbml0aWFsU2V0dGluZ3MubGFuZ3VhZ2U7XG4gICAgfVxuXG59O1xuXG5leHBvcnRzLlNldHRpbmdzID0gU2V0dGluZ3M7XG4iXX0=
