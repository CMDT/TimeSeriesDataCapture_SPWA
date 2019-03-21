angular.module('app').service('authenticationNotifyService',authenticationNotifyService);

authenticationNotifyService.$inject = [
];


function authenticationNotifyService() {
    var self = this;
  

    self.subscribeAuth0 = subscribeAuth0;
    self.publishAuth0 = publishAuth0;

    self.subscribeOneDrive = subscribeOneDrive;
    self.publishOneDrive = publishOneDrive;

    var auth0Subscribers = [];
    function subscribeAuth0(fn) {
        auth0Subscribers.push(fn);
    }

    function publishAuth0() {
        for (var i = 0, length = auth0Subscribers.length; i < length; i++) {
            auth0Subscribers[i]();
        }
    }

    var oneDriveSubscribers = [];
    function subscribeOneDrive(fn) {
        oneDriveSubscribers.push(fn);
    }

    function publishOneDrive() {
        for (var i = 0, length = oneDriveSubscribers.length; i < length; i++) {
            oneDriveSubscribers[i]();
        }
    }
}
