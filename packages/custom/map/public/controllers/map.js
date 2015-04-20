'use strict';

/* jshint -W098 */
angular.module('mean.map').controller('MapController', ['$scope', '$http', 'leafletData', 'leafletBoundsHelpers', 'Global', 'Map',
  function($scope, $http, leafletData, leafletBoundsHelpers, Global, Map) {
    
    var markers = {};

    $scope.global = Global;
    $scope.package = {
      name: 'map'
    };

    $scope.tiles = {
      name: 'MyMapboxTiles',
      url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
      type: 'xyz',
      options: {
          apikey: 'pk.eyJ1IjoiaG5yY2hyZGwiLCJhIjoiTnBfaExPTSJ9.tey74sfeV-vLUx9r6dMeLg',
          mapid: 'hnrchrdl.j48ecopb'
      }
    };

    $scope.center = [];

    $scope.showFilterOverlay = false;

    $scope.filterProperties = [
      {
        reference: 'Leistungsname',
        label: 'Leistungen',
        values: [],
        filtered: []
      },
      {
        reference: 'Bezirk',
        label: 'Bezirke',
        values: [],
        filtered: []
      },
      {
        reference: 'Stadtteil',
        label: 'Stadtteile',
        values: [],
        filtered: []
      },
      {
        reference: 'Spitzenverband',
        label: 'Spitzenverbände',
        values: [],
        filtered: []
      }
    ];

    $scope.filter = {
      toggle: function(ref, val) {
        _.map($scope.filterProperties, function(filtProp) {
          if(filtProp.reference === ref) {
            if(_.includes(filtProp.filtered, val)) {
              filtProp.filtered = _.without(filtProp.filtered, val);
            } else {
              filtProp.filtered.push(val);
            }
          }
        });
        applyFilter();
      },
      isActive: function(ref, val) {
        return _.includes(_.find($scope.filterProperties, {reference: ref}).filtered, val);
      }
    };

    var applyFilter = function() {
      $scope.markers = {};
      $scope.markers = _.filter(markers, function(marker) {
        var showMarker = true;
        _.each($scope.filterProperties, function(filtProp) {
          if(filtProp.filtered.length > 0 && _.intersection(marker.properties[filtProp.reference], filtProp.filtered).length === 0) {
            showMarker = false;
          }
        });
        return showMarker;
      });
    };

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

            // create new marker and add to markers obj
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
            _.each($scope.filterProperties, function(filterProperty) {
              var propertyVal = features[i].properties[filterProperty.reference];
              if( propertyVal && _.isArray(propertyVal)) {
                filterProperty.values.push(propertyVal);
              }
            });
          } // --if

        } // --for

        //consolidate filterProperty values
        _.map($scope.filterProperties, function(filterProperty) {
          filterProperty.values = _.uniq(_.flatten(filterProperty.values).sort(), true);
        });

        console.log($scope.filterProperties);

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
