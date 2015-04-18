'use strict';

/* jshint -W098 */
angular.module('mean.map').controller('MapController', ['$scope', '$http', 'leafletData', 'leafletBoundsHelpers', 'Global', 'Map',
  function($scope, $http, leafletData, leafletBoundsHelpers, Global, Map) {
    $scope.global = Global;
    $scope.package = {
      name: 'map'
    };

    $scope.center = [];

    $scope.filterKitas = function() {

      var maxlat, maxlng, minlat, minlng = null;
      var markers = {};
      
      $http.get('/map/assets/kitas.geojson').then(function(data) {
        var features = data.data.features;
        console.log(features);

        // for every feature 
        for(var i = 0; i < features.length; i = i + 1) {
          // group markercluster by Stadtteil
          var group = features[i].properties.Stadtteil ?
            features[i].properties.Stadtteil[0] :
            'unbekannt';

          // convert feature to marker
          if(features[i].geometry) {
            markers[features[i].properties.gml_id] = {
              group: group, // this adds the marker to a markercluster group
              lat: features[i].geometry.coordinates[1],
              lng: features[i].geometry.coordinates[0]
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

          }
        }

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
