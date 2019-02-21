angular.module('app').service('graphEventEmitterService', graphEventEmitterService);

graphEventEmitterService.$inject = [
];


function graphEventEmitterService() {
    var self = this;

    self.on = on;
    self.removeListener = removeListener;
    self.emit = emit;

    var events = {};



    function on(event, listener) {
        if (typeof events[event] !== 'object') {
            events[event] = [];
        }

        events[event].push(listener);
    }

    function removeListener(event, listener) {
        var idx;

        if (typeof events[event] === 'object') {
            idx = indexOf(events[event], listener);

            if (idx > -1) {
                events[event].splice(idx, 1);
            }
        }
    }

    function emit(event) {
        var i, listeners, length, args = [].slice.call(arguments, 1);

        if (typeof events[event] === 'object') {
            listeners = events[event].slice();
            length = listeners.length;

            for (i = 0; i < length; i++) {
                listeners[i].apply(this, args);
            }
        }
    }



    function indexOf(haystack, needle) {
        var i = 0, length = haystack.length, idx = -1, found = false;

        while (i < length && !found) {
            if (haystack[i] === needle) {
                idx = i;
                found = true;
            }

            i++;
        }

        return idx;
    };
}