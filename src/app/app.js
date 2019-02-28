var app = angular.module('app', ['ui.router', 'ngMaterial', 'jsTag', 'siyfion.sfTypeahead']);


app.config(config);

config.$inject = [
  '$stateProvider',
  '$urlRouterProvider'
]

function config($stateProvider, $urlRouterProvider) {



  var homeState = {
    name: 'home',
    url: '/home/?query',
    params: {
      query: {
        dynamic: false
      },
    },
    templateUrl: 'app/shared/home/homeView.html',
    controller: 'homeController'
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
          if(Object.keys(result[0].data).length > 0){
            deferred.resolve(result);
          }else{
            console.error('unauthenticated')
            $state.go('home');
            deferred.reject();
          }

         
        }).catch(function (error) {
          console.error(error);
          $state.go('home');
          deferred.reject();
        })

        return deferred.promise;
      }]
    }
  }

  $stateProvider.state(homeState);
  $stateProvider.state(viewState);

  $urlRouterProvider.otherwise('/home/');

}

app.run(run);

run.$inject = [
  '$rootScope', 'authenticationService', 'configDetails'
]

function run($rootScope, authenticationService, configDetails) {
  console.log('version 1.1');

  $rootScope.url = configDetails.BROWSEAPI_URI;
  //$rootScope.url = 'http://localhost:8000';
  $rootScope.isAuthenticated = authenticationService.isAuthenticated();
  $rootScope.query = '';
  console.log($rootScope.isAuthenticated);
}


