var app = angular.module('app', ['ui.router', 'ngMaterial', 'jsTag', 'siyfion.sfTypeahead']);


app.config(config);

config.$inject = [
  '$stateProvider',
  '$urlRouterProvider'
]

function config($stateProvider,$urlRouterProvider) {


 
  var homeState = {
    name: 'home',
    url: '/home/?query',
    params: {
      query: {
        dynamic: true
      },
    },
    templateUrl: 'app/shared/home/homeView.html',
    controller: 'homeController'
  }

  var callbackState = {
    name: 'callback',
    url: '/callback',
    templateUrl: 'app/shared/callback/callbackView.html',
  }

  var importState = {
    name: 'import',
    url: '/import',
    templateUrl: 'app/shared/import/importView.html',
    controller: 'importController'
  }

  var viewState = {
    name: 'view',
    url: '/view?runs&columns&viewVector&offsetVector&active&panelView&palette',
    params : {
      runs :{
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
      active: {
        dynamic: true
      },
      panelView: {
        dynamic: true
      } ,
      palette: {
        dynamic: true
      }
    },
    templateUrl: 'app/shared/view/viewView.html',
    controller: 'viewController',
  }

  $stateProvider.state(callbackState);
  $stateProvider.state(homeState);
  $stateProvider.state(importState);
  $stateProvider.state(viewState);
  
  $urlRouterProvider.otherwise('/home/');

}

app.run(run);

run.$inject = [
  '$rootScope','authenticationService'
]

function run($rootScope,authenticationService){
  $rootScope.url = 'https://timeseriesdatacapture-browse.herokuapp.com';
  //$rootScope.url = 'http://localhost:8000';
  $rootScope.isAuthenticated = authenticationService.isAuthenticated();
  console.log($rootScope.isAuthenticated);
}


