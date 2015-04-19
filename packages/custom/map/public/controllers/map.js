'use strict';

/* jshint -W098 */
angular.module('mean.map').controller('MapController', ['$scope', '$http', 'leafletData', 'leafletBoundsHelpers', 'Global', 'Map',
  function($scope, $http, leafletData, leafletBoundsHelpers, Global, Map) {
    
    var markers = {};

    $scope.global = Global;
    $scope.package = {
      name: 'map'
    };

    $scope.center = [];

    $scope.leistungen = [];
    $scope.stadtteile = [];
    $scope.bezirke = [];

    $scope.filter = {
      leistungen: [],
      stadtteile: [],
      bezirke: []
    };

    $scope.toggleFilter = function(type, val) {
      if($scope.filter[type].indexOf(val) != -1) {
        $scope.filter[type] = _.without($scope.filter[type], val); //remove from filterlist
      } else {
        $scope.filter[type].push(val); //add to filterlist
      }
    };

    $scope.filterIsActive = function(type, val) {
      return $scope.filter[type].indexOf(val) != -1;
    };

    $scope.filterKitas = function() {
      $scope.markers = null;
      if($scope.filter.leistungen.length > 0 || $scope.filter.stadtteile.length > 0 || $scope.filter.bezirke.length > 0) {
        angular.extend($scope, {
          markers: _.filter(markers, function(marker) {
            return _.isArray(marker.properties.Stadtteil) && $scope.filter.stadtteile.indexOf(marker.properties.Stadtteil[0]) != -1;
          })
        });
      } else {
        angular.extend($scope, {
          markers: markers
        });
      }
    };

    $scope.$watch('filter.stadtteile.length', function() {
      $scope.filterKitas();
    });

    $scope.init = function() {

      var maxlat, maxlng, minlat, minlng = null;
      
      $http.get('/map/assets/kitas.geojson').then(function(data) {
        var features = data.data.features;

        // for every feature 
        for(var i = 0; i < features.length; i = i + 1) {
          // group markercluster by Stadtteil
          var group = features[i].properties.Stadtteil ?
            features[i].properties.Stadtteil[0] :
            'unbekannt';

          // convert feature to marker
          if(features[i].geometry) {

            // create new marker and add to markers array
            markers[features[i].properties.gml_id] = {
              //group: group, // this adds the marker to a markercluster group
              //group: 'onegroup', // this adds the marker to a markercluster group
              lat: features[i].geometry.coordinates[1],
              lng: features[i].geometry.coordinates[0],
              properties: features[i].properties
            };

            // expand the bounds
            if(!maxlat || maxlat < features[i].geometry.coordinates[1]) {
              maxlat = features[i].geometry.coordinates[1];
            }
            if(!minlat || minlat > features[i].geometry.coordinates[1]) {
              minlat = features[i].geometry.coordinates[1];
            }
            if(!maxlng || maxlng < features[i].geometry.coordinates[0]) {
              maxlng = features[i].geometry.coordinates[0];
            }
            if(!minlng || minlng > features[i].geometry.coordinates[0]) {
              minlng = features[i].geometry.coordinates[0];
            }

            // ad stadteil to stadtteil filter
            if(_.isArray(features[i].properties.Stadtteil)) {
              $scope.stadtteile.push(features[i].properties.Stadtteil[0]);
            }
          } // --if

        } // --for

        $scope.stadtteile = _.uniq($scope.stadtteile.sort(), true);

        // angular-leaflet boundshelper
        var bounds = leafletBoundsHelpers.createBoundsFromArray([ [minlat, minlng], [maxlat, maxlng] ]);

        // extend the controller's scope with markers and bounds
        angular.extend($scope, {
          markers: markers,
          bounds: bounds,
          center: []
        });
      });
    };
  }
]);
