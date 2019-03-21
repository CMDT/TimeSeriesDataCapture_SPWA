

angular.module('app').service('authenticationService', authenticationService);

authenticationService.$inject = [
    '$log',
    '$state',
    'authenticationNotifyService',
    'angularAuth0'
];

function authenticationService(
    $log,
    $state,
    authenticationNotifyService,
    angularAuth0
) {
    var self = this;

    self.setSession = setSession;

    self.isAuthenticated = isAuthenticated;

    self.handleAuthentication = handleAuthentication;
    self.renewTokens = renewTokens;

    self.login = login;
    self.logout = logout;

   

    function setSession(authResult) {
        var expiresAt = JSON.stringify(authResult.expiresIn * 1000 + new Date().getTime());
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('accessToken', authResult.idToken);
        localStorage.setItem('expiresAt', expiresAt)
        authenticationNotifyService.publishAuth0();
        $state.go('.', {
        }, {
                reload: true
            });
    }

    function isAuthenticated() {
        var expiresAt = JSON.parse(localStorage.getItem('expiresAt'));
        return new Date().getTime() < expiresAt;
    }

    function login() {
        //lock.show();
        angularAuth0.authorize();
    }


    function handleAuthentication() {
        console.log('go')
        angularAuth0.parseHash(function (err, authResult) {
            if (authResult && authResult.accessToken && authResult.idToken) {
                setSession(authResult);
            } else if (err) {
                console.log(err);
            }
            
            
        });
    }

    function logout() {
        localStorage.setItem('expiresAt', 0);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('accessToken');
    }


    function renewTokens() {
        angularAuth0.checkSession({},
            function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    setSession(result);
                }
            }
        );
    }





}

