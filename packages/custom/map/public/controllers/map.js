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

    $scope.showFilterOverlay = false;

    $scope.leistungen = [];
    $scope.stadtteile = [];
    $scope.bezirke = [];
    $scope.spitzenverbaende = [];
    $scope.traeger = [];


    $scope.filter = {
      leistungen: [],
      stadtteile: [],
      bezirke: [],
      spitzenverbaende: [],
      toggle: function(type, val) {
        if($scope.filter[type].indexOf(val) !== -1) {
          $scope.filter[type] = _.without($scope.filter[type], val); //remove from filterlist
        } else {
          $scope.filter[type].push(val); //add to filterlist
        }
      },
      isActive: function(type, val) {
        return $scope.filter[type].indexOf(val) !== -1;
      },
      apply: function() {
        $scope.markers = null;
        angular.extend($scope, {
          markers: _.filter(markers, function(marker) {
            return ($scope.filter.leistungen.length === 0 || _.intersection(marker.properties.Leistungsname, $scope.filter.leistungen).length > 0) &&
              ($scope.filter.stadtteile.length === 0 || _.intersection(marker.properties.Stadtteil, $scope.filter.stadtteile).length > 0) &&
              ($scope.filter.bezirke.length === 0 || _.intersection(marker.properties.Bezirk, $scope.filter.bezirke).length > 0) &&
              ($scope.filter.spitzenverbaende.length === 0 || _.intersection(marker.properties.Spitzenverband, $scope.filter.spitzenverbaende).length > 0);
          })
        });
      }
    };

    $scope.$watchGroup([
        'filter.stadtteile.length',
        'filter.leistungen.length', 
        'filter.bezirke.length', 
        'filter.spitzenverbaende.length'
      ], function() {
        $scope.filter.apply();
    });

    $scope.init = function() {

      var maxlat, 
          maxlng, 
          minlat, 
          minlng;
      
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

            // expand the bounds of feature
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

            // add the properties of feature
            if(_.isArray(features[i].properties.Leistungsname)) {
              $scope.leistungen.push(features[i].properties.Leistungsname);
            }
            if(_.isArray(features[i].properties.Stadtteil)) {
              $scope.stadtteile.push(features[i].properties.Stadtteil);
            }
            if(_.isArray(features[i].properties.Bezirk)) {
              $scope.bezirke.push(features[i].properties.Bezirk);
            }
            if(_.isArray(features[i].properties.Spitzenverband)) {
              $scope.spitzenverbaende.push(features[i].properties.Spitzenverband);
            }
            if(_.isArray(features[i].properties.Traeger)) {
              $scope.traeger.push(features[i].properties.Traeger);
            }
          } // --if

        } // --for

        $scope.leistungen = _.uniq(_.flatten($scope.leistungen).sort(), true);
        $scope.bezirke = _.uniq(_.flatten($scope.bezirke).sort(), true);
        $scope.stadtteile = _.uniq(_.flatten($scope.stadtteile).sort(), true);
        $scope.spitzenverbaende = _.uniq(_.flatten($scope.spitzenverbaende).sort(), true);
        $scope.traeger = _.uniq(_.flatten($scope.traeger).sort(), true);

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

    $scope.toggleFilterOverlay = function() {
      $scope.showFilterOverlay = $scope.showFilterOverlay ?
        false :
        true;
    };
  }
]);
