'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var MapModule = new Module('map');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
MapModule.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  MapModule.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  MapModule.menus.add({
    title: 'map example page',
    link: 'map example page',
    roles: ['anonymous'],
    menu: 'main'
  });
  
  MapModule.aggregateAsset('css', 'map.css');
  MapModule.aggregateAsset('css', '../lib/leaflet/dist/leaflet.css');
  MapModule.aggregateAsset('css', '../lib/leaflet.markercluster/dist/MarkerCluster.css');
  MapModule.aggregateAsset('css', '../lib/leaflet.markercluster/dist/MarkerCluster.Default.css');



  MapModule.aggregateAsset('js','../lib/leaflet/dist/leaflet-src.js');
  MapModule.aggregateAsset('js','../lib/angular-leaflet-directive/dist/angular-leaflet-directive.js');
  MapModule.aggregateAsset('js', '../lib/leaflet.markercluster/dist/leaflet.markercluster-src.js');


  // Adding the leaflet directive as angular dependency
  MapModule.angularDependencies(['leaflet-directive']);

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Map.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Map.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Map.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return MapModule;
});
