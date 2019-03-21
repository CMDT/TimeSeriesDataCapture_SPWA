var app = angular.module('app', ['ui.router', 'ngMaterial', 'jsTag', 'siyfion.sfTypeahead', 'auth0.auth0']);


app.config(config);

config.$inject = [
  '$stateProvider',
  '$locationProvider',
  '$urlRouterProvider',
  'angularAuth0Provider'
]

function config(
  $stateProvider,
  $locationProvider,
  $urlRouterProvider,
  angularAuth0Provider) {

  // Initialization for the angular-auth0 library
  angularAuth0Provider.init({
    clientID: CONFIG.AUTH0_CLIENTID,
    domain: CONFIG.AUTH0_DOMAIN,
    responseType: 'token id_token',
    redirectUri: window.location.href,
  });


  var indexState = {
    name: 'index',
    url: '/index/?query',
    params: {
      query: {
        dynamic: false
      },
    },
    templateUrl: 'app/shared/index/indexView.html',
    controller: 'indexController'
  }

  var viewState = {
    name: 'view',
    url: '/view?runs&columns&viewVector&offsetVector&activeColumn&activeRun&panelView&palette',
    params: {
      runs: {
        dynamic: false
      },
      columns: {
        dynamic: true
      },
      viewVector: {
        dynamic: true
      },
      offsetVector: {
        dynamic: true
      },
      activeColumn: {
        dynamic: true
      },
      activeRun: {
        dynamic: true
      },
      panelView: {
        dynamic: true
      },
      palette: {
        dynamic: true
      },
    },
    templateUrl: 'app/shared/view/viewView.html',
    controller: 'viewController',
    resolve: {
      runData: ['$q', '$state', '$stateParams', 'runRequestService', function ($q, $state, $stateParams, runRequestService) {
        var deferred = $q.defer();

        var runs = $stateParams.runs.split('+');

        runRequestService.getRuns(runs).then(function (result) {

          //temp solution for unathenticated
          if (Object.keys(result[0].data).length > 0) {
            deferred.resolve(result);
          } else {
            console.error('unauthenticated')
            $state.go('index');
            deferred.reject();
          }


        }).catch(function (error) {
          console.error(error);
          $state.go('index');
          deferred.reject();
        })

        return deferred.promise;
      }]
    }
  }

  $stateProvider.state(indexState);
  $stateProvider.state(viewState);

  $urlRouterProvider.otherwise('/index/');

  $locationProvider.hashPrefix('');

    /// Comment out the line below to run the app
    // without HTML5 mode (will use hashes in routes)
    $locationProvider.html5Mode(true);

}

app.run(run);

run.$inject = [
  '$rootScope', '$log', 'authenticationService'
]

function run($rootScope, $log, authenticationService) {
  $log.info('version 1.1.0');
  $log.info(`This project was funded via the Marloes Peeters Research Group and mentored 
  by DigitalLabs@MMU as a DigitalLabs Summer Project. It is the work of Yusof Bandar.`);

  $rootScope.url = CONFIG.BROWSEAPI_URI;
  //$rootScope.url = 'http://localhost:8000';
  $rootScope.isAuthenticated = authenticationService.isAuthenticated();


  if (localStorage.getItem('isLoggedIn') === 'true') {
    authenticationService.renewTokens();
  } else {
    // Handle the authentication
    // result in the hash
    authenticationService.handleAuthentication();
  }


  $rootScope.query = '';

}


