var app = angular.module('app', ['ui.router', 'ngMaterial', 'jsTag', 'siyfion.sfTypeahead']);


app.config(config);

config.$inject = [
  '$stateProvider'
]

function config($stateProvider) {

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
    url: '/view',
    templateUrl: 'app/shared/view/viewView.html',
    controller: 'viewController'
  }

  $stateProvider.state(callbackState);
  $stateProvider.state(homeState);
  $stateProvider.state(importState);
  $stateProvider.state(viewState);
}

app.run(run);

run.$inject = [
  '$rootScope','$transitions'
]

function run($rootScope){
  $rootScope.url = 'http://192.168.2.1:8000';
}





