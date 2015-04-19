'use strict';

angular.module('mean.map').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('map example page', {
      url: '/',
      templateUrl: 'map/views/index.html'
    });
  }
]);
