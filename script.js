// This isn't necessary but it keeps the editor from thinking L and carto are typos
/* global L, carto */

var map = L.map('map', {
  center: [40.695217, -73.977127],
  zoom: 12
});

// Add base layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png', {
  maxZoom: 18
}).addTo(map);

// Initialize Carto
var client = new carto.Client({
  apiKey: 'default_public',
  username: 'smanzar'
});

/*
 * Whenever you create a layer, you'll need three things:
 *  1. A source.
 *  2. A style.
 *  3. A layer.
 *
 * Here we create each of the above twice with different settings to add two layers to our map.
 */

/*
 * Begin layer one
 */

// Initialze source data
var restaurants = new carto.source.SQL('SELECT * FROM open_restaurants_inspections');

// Create style for the data
var restaurantsStyle = new carto.style.CartoCSS(`
#layer {
  marker-width: 5;
  marker-fill: #008B8B;
  marker-fill-opacity: 0.4;
  marker-allow-overlap: true;
  marker-line-width: 1;
  marker-line-color: #008B8B;
  marker-line-opacity: 1;
}

#layer [zoom >12] {
  marker-width: 11;
    marker-fill-opacity: 0.3;

}
`);

// Add style to the data
var restaurantLayer = new carto.layer.Layer(restaurants, restaurantsStyle);

/*
 * Begin layer two
 */

// Initialze source data
var pumaSource = new carto.source.SQL('SELECT * FROM public_use_microdata_areas_puma');

// Create style for the data
var pumaStyle = new carto.style.CartoCSS(`
#layer['mapnik::geometry_type'=1] {
  marker-width: 7;
  marker-fill: #EE4D5A;
  marker-fill-opacity: 0.3;
  marker-line-color: #FFFFFF;
  marker-line-width: 1;
  marker-line-opacity: 0.5;
  marker-type: ellipse;
  marker-allow-overlap: true;
}
#layer['mapnik::geometry_type'=2] {
  line-color: #4CC8A3;
  line-width: 1.5;
  line-opacity: 1;
}
#layer['mapnik::geometry_type'=3] {
  polygon-fill: #826DBA;
  polygon-opacity: 0.3;
  ::outline {
    line-color: #FFFFFF;
    line-width: 1;
    line-opacity: 1;
  }
}
`);

// Add style to the data
var pumaLayer = new carto.layer.Layer(pumaSource, pumaStyle);

// Add the data to the map as two layers. Order matters here--first one goes on the bottom
client.addLayers([pumaLayer, restaurantLayer]);
client.getLeafletLayer().addTo(map);


// Step 1: Find the button by its class. If you are using a different class, change this.
var kingsButton = document.querySelector('.btn-kings');

// Step 2: Add an event listener to the button. We will run some code whenever the button is clicked.
kingsButton.addEventListener('click', function (e) {
  restaurants.setQuery("SELECT * FROM open_restaurants_inspections WHERE borough = 'Brooklyn'");
   // Make SQL to get the summary data you want
  var countSql = "SELECT COUNT(restaurantname) FROM open_restaurants_inspections WHERE borough = 'Brooklyn'";
  
  // Request the data from Carto using fetch.
  // You will need to change 'brelsfoeagain' below to your username, otherwise this should work.
  fetch('https://smanzar.carto.com/api/v2/sql/?q=' + countSql)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // All of the data returned is in the response variable
      console.log(data);

      // The sum is in the first row's count variable
      var sumInjuries = data.rows[0].count;

      // Get the sidebar container element
      var sidebarContainer = document.querySelector('.sidebar-feature-content');

      // Add the text including the sum to the sidebar
      sidebarContainer.innerHTML = '<div>There are ' + sumInjuries + ' open restaurants in this area</div>';
    });
  
  
  // Sometimes it helps to log messages, here we log to let us know the button was clicked. You can see this if you open developer tools and look at the console.
  console.log('Brooklyn was clicked');
});

var queensButton = document.querySelector('.btn-queens');

queensButton.addEventListener('click', function (e) {
  restaurants.setQuery("SELECT * FROM open_restaurants_inspections WHERE borough = 'Queens'");
  var countSql = "SELECT COUNT(restaurantname) FROM open_restaurants_inspections WHERE borough = 'Queens'";
  
 
  fetch('https://smanzar.carto.com/api/v2/sql/?q=' + countSql)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);

      var sumInjuries = data.rows[0].count;

      var sidebarContainer = document.querySelector('.sidebar-feature-content');

      sidebarContainer.innerHTML = '<div>There are ' + sumInjuries + ' open restaurants in this area</div>';
    });
    console.log('Queen was clicked');
});

var resetButton = document.querySelector('.reset-btn');

resetButton.addEventListener('click', function (e) {
  restaurants.setQuery("SELECT * FROM open_restaurants_inspections");
      var sidebarContainer = document.querySelector('.sidebar-feature-content');

      sidebarContainer.innerHTML = '';
  
  console.log('Reset was clicked');
});


map.on('click', function (e) {
  console.log(e.latlng);
  // We want the SQL to look something like this (lat: 40.732, lng: -73.986)
  // SELECT * FROM open_restaurants_inspections WHERE ST_Within(ST_Transform(the_geom, 2263), ST_Buffer(ST_Transform(CDB_LatLng(40.732,-73.986), 2263),10000))
  
  // So place the lat and lng in the query at the appropriate points
  var sql = 'SELECT * FROM open_restaurants_inspections WHERE ST_Within(ST_Transform(the_geom, 2263), ST_Buffer(ST_Transform(CDB_LatLng(' + e.latlng.lat + ',' + e.latlng.lng + '), 2263),10000))';
  console.log(sql);
  
  restaurants.setQuery(sql);
  
  var countSql = 'SELECT COUNT(restaurantname) FROM open_restaurants_inspections WHERE ST_Within(ST_Transform(the_geom, 2263), ST_Buffer(ST_Transform(CDB_LatLng(' + e.latlng.lat + ',' + e.latlng.lng + '), 2263),10000))';
 
  fetch('https://smanzar.carto.com/api/v2/sql/?q=' + countSql)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);

      var sumInjuries = data.rows[0].count;

      var sidebarContainer = document.querySelector('.sidebar-feature-content');

      sidebarContainer.innerHTML = '<div>There are ' + sumInjuries + ' open restaurants in this area</div>';
    });
});