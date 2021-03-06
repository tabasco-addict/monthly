//todo: refactor structure:
//separate map and options menu and/or
//event functions and initmap

let map;

// initialize a blank array to fill in with markers:
let markers = [];

//ready the map styles in json file:
//let json = require('mapstyle.json')
//let styles = json
// currently unable to test due to limited API key, but either inline or using require.js appear to work:
let styles = [
  {
    "featureType": "administrative.country",
    "elementType": "labels",
    "stylers": [
      {
          "weight": "4.55"
      }
    ]
  },
  {
    "featureType": "administrative.province",
    "elementType": "labels.text",
    "stylers": [
        {
            "invert_lightness": true
        },
        {
            "saturation": "-47"
        },
        {
            "weight": "2.04"
        },
        {
            "lightness": "-3"
        }
      ]
  },
  {
      "featureType": "administrative.province",
      "elementType": "labels.text.fill",
      "stylers": [
          {
              "lightness": "51"
          }
      ]
  },
  {
      "featureType": "administrative.locality",
      "elementType": "labels.text.fill",
      "stylers": [
          {
              "lightness": "-34"
          }
      ]
  },
  {
      "featureType": "administrative.neighborhood",
      "elementType": "labels.text.fill",
      "stylers": [
          {
              "saturation": "56"
          }
      ]
  },
  {
      "featureType": "administrative.land_parcel",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "landscape",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "color": "#aacf8b"
          }
      ]
  },
  {
      "featureType": "landscape.man_made",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "color": "#e2d29a"
          }
      ]
  },
  {
      "featureType": "landscape.natural.landcover",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "saturation": "0"
          }
      ]
  },
  {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
          {
              "lightness": "-78"
          }
      ]
  },
  {
      "featureType": "poi",
      "elementType": "labels.icon",
      "stylers": [
          {
              "invert_lightness": true
          },
          {
              "saturation": "-35"
          }
      ]
  },
  {
      "featureType": "poi.park",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "color": "#41aa69"
          }
      ]
  },
  {
      "featureType": "poi.place_of_worship",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "poi.school",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "simplified"
          }
      ]
  },
  {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [
          {
              "lightness": "-62"
          }
      ]
  },
  {
      "featureType": "road.highway",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "color": "#fdff9e"
          }
      ]
  },
  {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "color": "#63403a"
          }
      ]
  },
  {
      "featureType": "road.arterial",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "color": "#684f42"
          }
      ]
  },
  {
      "featureType": "road.local",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "color": "#9b4646"
          }
      ]
  },
  {
      "featureType": "transit.line",
      "elementType": "geometry",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "transit.line",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "visibility": "on"
          },
          {
              "color": "#ff6363"
          }
      ]
  },
  {
      "featureType": "transit.line",
      "elementType": "labels.icon",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "transit.station",
      "elementType": "labels.text.fill",
      "stylers": [
          {
              "color": "#4200a3"
          }
      ]
  },
  {
      "featureType": "transit.station",
      "elementType": "labels.icon",
      "stylers": [
          {
              "invert_lightness": true
          }
      ]
  },
  {
      "featureType": "transit.station.airport",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "lightness": "-25"
          }
      ]
  },
  {
      "featureType": "water",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "color": "#73cecf"
          }
      ]
  },
  {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
          {
              "color": "#050312"
          }
      ]
  }
];

// This global polygon variable is to ensure only ONE polygon is rendered.
let polygon = null;

// Create placemarkers array to use in multiple functions to have control
// over the number of places that show.
let placeMarkers = [];

function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 35.6762, lng: 139.69},
        zoom: 13,
        //allow user to change map type:
        mapTypeControl: true,
        //add styles to highlight certain map features (transit, parks, etc)
        styles: styles
    });

    // This autocomplete is for use in the search within time entry box.
    let timeAutocomplete = new google.maps.places.Autocomplete(
        document.getElementById('search-within-time-input'));
    // This autocomplete is for use in the geocoder entry box.
    let zoomAutocomplete = new google.maps.places.Autocomplete(
        document.getElementById('zoom-to-area-input'));
    //Bias the boundaries within the map for the zoom to area text.
    zoomAutocomplete.bindTo('bounds', map);

    // Create a searchbox in order to execute a places search
    let searchBox = new google.maps.places.SearchBox(
        document.getElementById('places-search-button'));
    // Bias the searchbox to within the bounds of the map.
    searchBox.setBounds(map.getBounds());

    //for now, an array of locations for the markers:
    let locations = [
        {title: 'Hibiya Park', location: {lat: 35.674334, lng: 139.755883}},
        {title: 'Shibuya', location: {lat: 35.66, lng: 139.7}},
        {title: 'Riverside Park', location: {lat: 35.674796, lng: 139.786117}}
    ];

    // set info window:
    let largeInfowindow = new google.maps.InfoWindow();

    // Style the markers a bit. This will be our listing marker icon.
    let defaultIcon = makeMarkerIcon('0091ff');
    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    let highlightedIcon = makeMarkerIcon('FFFF24');

    // Initialize the drawing manager.
    let drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT,
            drawingModes: [
                google.maps.drawing.OverlayType.POLYGON
            ]
        }
    });

    // loop through the array to create the markers:
    for (let i = 0; i < locations.length; i++) {
        // Get the position from the location array.
        let position = locations[i].location;
        let title = locations[i].title;
        // Create a marker per location, and put into markers array.
        let marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i,
            icon: defaultIcon
        });
        // Push the marker to our array of markers.
        markers.push(marker);

        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function () {
            populateInfoWindow(this, largeInfowindow);
        });
        //Two event listeners - one for mouseover, one for mouseout,
        //to change the colors back and forth.
        marker.addListener('mouseover', function () {
            this.setIcon(highlightedIcon);
        });
        marker.addListener('mouseout', function () {
            this.setIcon(defaultIcon);
        });
    }

    // event listeners to show and hide listings functionality, toggle drawing mode button, zoom to area, etc
    // corresponding to Drawing, Geo, Distance Matrix, etc APIs
    document.getElementById('show-listings-button').addListener('click', showListings);
    document.getElementById('hide-listings-button').addListener('click', function () {hideListings(markers)});
    document.getElementById('toggle-drawing-button').addListener('click', function() {
        toggleDrawing(drawingManager);
    });
    document.getElementById('zoom-to-area-button').addListener('click', function() {
        zoomToArea();
    });
    document.getElementById('search-within-time-button').addListener('click', function() {
        searchWithinTime();
    });

    // Listen for the event fired when the user selects a prediction from the
    // picklist and retrieve more details for that place.
    searchBox.addListener('places_changed', function() {
        searchBoxPlaces(this);
    });

    // Listen for the event fired when the user selects a prediction and clicks
    // "go" more details for that place.
    document.getElementById('places-search-button').addListener('click', textSearchPlaces);

    // Add an event listener so that the polygon is captured,  call the
    // searchWithinPolygon function. This will show the markers in the polygon,
    // and hide any outside of it.
    drawingManager.addListener('overlaycomplete', function (event) {
    // First, check if there is an existing polygon.
    // If there is, get rid of it and remove the markers
    if (polygon) {
        polygon.setMap(null);
        hideListings(markers);
    }
    // Switching the drawing mode to the HAND (i.e., no longer drawing).
    drawingManager.setDrawingMode(null);
    // Creating a new editable polygon from the overlay.
    polygon = event.overlay;
    polygon.setEditable(true);
    // Searching within the polygon.
    searchWithinPolygon();
    // Make sure the search is re-done if the poly is changed.
    polygon.getPath().addListener('set_at', searchWithinPolygon);
    polygon.getPath().addListener('insert_at', searchWithinPolygon);
    });
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker !== marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + '</div>');
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick',function(){
      infowindow.setMarker = null;
    });
    //create a street view preview image:
    let streetViewService = new google.maps.StreetViewService();
    let radius = 50;
    // In case the status is OK, which means the pano was found, compute the
    // position of the streetview image, then calculate the heading, then get a
    // panorama from that and set the options
    function getStreetView(data, status) {
      if (status === google.maps.StreetViewStatus.OK) {
        let nearStreetViewLocation = data.location.latLng;
        let heading = google.maps.geometry.spherical.computeHeading(
          nearStreetViewLocation, marker.position);
          infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
          let panoramaOptions = {
            position: nearStreetViewLocation,
            pov: {
              heading: heading,
              pitch: 30
            }
          };
        let panorama = new google.maps.StreetViewPanorama(
          document.getElementById('pano'), panoramaOptions);
      } else {
        infowindow.setContent('<div>' + marker.title + '</div>' +
          '<div>No Street View Found</div>');
      }
    }
    // Use streetview service to get the closest streetview image within
    // 50 meters of the markers position
    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
    // Open the infowindow on the correct marker.
    infowindow.open(map, marker);
  }
}

// This function will loop through the markers array and display them all.
function showListings() {
  //set latlng bounds to resize map to fit all markers:
  let bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

// This function will loop through the listings and hide them all. todo: change name to hideMarkers if sensible
function hideListings(markers) {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
    return new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21, 34));
}

// This function hides all markers outside the polygon,
// and shows only the ones within it. This is so that the
// user can specify an exact area of search.
function searchWithinPolygon() {
    for (let i = 0; i < markers.length; i++) {
        if (google.maps.geometry.poly.containsLocation(markers[i].position, polygon)) {
            markers[i].setMap(map);
        } else {
            markers[i].setMap(null);
        }
    }
}

// This shows and hides (respectively) the drawing options.
function toggleDrawing(drawingManager) {
    if (drawingManager.map) {
        drawingManager.setMap(null);
        // In case the user drew anything, get rid of the polygon
        if (polygon !== null) {
            polygon.setMap(null);
        }
    } else {
        drawingManager.setMap(map);
    }
}

// This function takes the input value in the find nearby area text input
// locates it, and then zooms into that area. This is so that the user can
// show all listings, then decide to focus on one area of the map.
function zoomToArea() {
    // Initialize the geocoder.
    let geocoder = new google.maps.Geocoder();
    // Get the address or place that the user entered.
    let address = document.getElementById('zoom-to-area-input').value;
    // Make sure the address isn't blank.
    if (address === '') {
        window.alert('You must enter an area, or address.');
    } else {
        // Geocode the address/area entered to get the center. Then, center the map
        // on it and zoom in
        geocoder.geocode(
            {
                address: address,
                componentRestrictions: {locality: 'New York'}
            }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    map.setCenter(results[0].geometry.location);
                    map.setZoom(15);
                } else {
                    window.alert('We could not find that location - try entering a more' +
                        ' specific place.');
                }
            }
        );
    }
}

// This function allows the user to input a desired travel time, in
// minutes, and a travel mode, and a location - and only show the listings
// that are within that travel time (via that travel mode) of the location
function searchWithinTime() {
    // Initialize the distance matrix service.
    let distanceMatrixService = new google.maps.DistanceMatrixService;
    let address = document.getElementById('search-within-time-input').value;
    // Check to make sure the place entered isn't blank.
    if (address === '') {
        window.alert('You must enter an address.');
    } else {
        hideListings(markers);
        // Use the distance matrix service to calculate the duration of the
        // routes between all our markers, and the destination address entered
        // by the user. Then put all the origins into an origin matrix.
        // todo: can likely make the following more efficient,
        //  by iterating / getting markers.position where needed rather than copying it here, and using address instead of copying it (unless mutating the copy)
        let origins = [];
        for (let i = 0; i < markers.length; i++) {
            origins[i] = markers[i].position;
        }
        let destination = address;
        let mode = document.getElementById('mode').value;
        // Now that both the origins and destination are defined, get all the
        // info for the distances between them.
        distanceMatrixService.getDistanceMatrix({
            origins: origins,
            destinations: [destination],
            travelMode: google.maps.TravelMode[mode],
            unitSystem: google.maps.UnitSystem.METRIC, //todo: check for other lines of code to change imperial > metric
        }, function(response, status) {
            if (status !== google.maps.DistanceMatrixStatus.OK) {
                window.alert('Error was: ' + status);
            } else {
                displayMarkersWithinTime(response);
            }
        });
    }
}

// This function will go through each of the results, and,
// if the distance is LESS than the value in the picker, show it on the map.
function displayMarkersWithinTime(response) {
    let maxDuration = document.getElementById('max-duration').value;
    let origins = response.originAddresses;
    let destinations = response.destinationAddresses;
    // Parse through the results, and get the distance and duration of each.
    // Because there might be  multiple origins and destinations we have a nested loop
    // Then, make sure at least 1 result was found.
    let atLeastOne = false;
    for (let i = 0; i < origins.length; i++) {
        let results = response.rows[i].elements;
        for (let j = 0; j < results.length; j++) {
            let element = results[j];
            if (element.status === "OK") {
                // The distance is returned in feet, but the TEXT is in miles. If we wanted to switch
                // the function to show markers within a user-entered DISTANCE, we would need the
                // value for distance, but for now we only need the text. todo: check change to metric is complete for data and UI
                let distanceText = element.distance.text;
                // Duration value is given in seconds so we make it MINUTES. We need both the value
                // and the text.
                let duration = element.duration.value / 60;
                let durationText = element.duration.text;
                if (duration <= maxDuration) {
                    //the origin [i] should = the markers[i]
                    markers[i].setMap(map);
                    atLeastOne = true;
                    // Create a mini infowindow to open immediately and contain the
                    // distance and duration
                    let infowindow = new google.maps.InfoWindow({
                        content: durationText + ' away, ' + distanceText +
                            '<div><input type=\"button\" value=\"View Route\" onclick =' +
                            '\"displayDirections(&quot;' + origins[i] + '&quot;)\"/></div>'
                    });
                    infowindow.open(map, markers[i]);
                    // Put this in so that this small window closes if the user clicks
                    // the marker, when the big infowindow opens
                    markers[i].infowindow = infowindow;
                    google.maps.event.addListener(markers[i], 'click', function() {
                        this.infowindow.close();
                    });
                }
            }
        }
    }
    if (!atLeastOne) {
        window.alert('We could not find any locations within that distance!');
    }
}

// This function is in response to the user selecting "show route" on one
// of the markers within the calculated distance. This will display the route
// on the map.
function displayDirections(origin) {
    hideListings(markers);
    let directionsService = new google.maps.DirectionsService;
    // Get the destination address from the user entered value.
    let destinationAddress =
        document.getElementById('search-within-time-input').value;
    // Get mode again from the user entered value.
    let mode = document.getElementById('mode').value;
    directionsService.route({
        // The origin is the passed in marker's position.
        origin: origin,
        // The destination is user entered address.
        destination: destinationAddress,
        travelMode: google.maps.TravelMode[mode]
    }, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            let directionsDisplay = new google.maps.DirectionsRenderer({
                map: map,
                directions: response,
                draggable: true,
                polylineOptions: {
                    strokeColor: 'green'
                }
            });
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

// This function fires when the user selects a searchbox picklist item.
// It will do a nearby search using the selected query string or place.
function searchBoxPlaces(searchBox) {
    hideListings(placeMarkers);
    let places = searchBox.getPlaces();
    // For each place, get the icon, name and location.
    createMarkersForPlaces(places);
    if (places.length === 0) {
        window.alert('We did not find any places matching that search!');
    }
}

// This function fires when the user selects "go" on the places search.
// It will do a nearby search using the entered query string or place.
function textSearchPlaces() {
    let bounds = map.getBounds();
    hideListings(placeMarkers);
    let placesService = new google.maps.places.PlacesService(map);
    placesService.textSearch({
        query: document.getElementById('places-search-input').value,
        bounds: bounds
    }, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            createMarkersForPlaces(results);
        }
    });
}

// This function creates markers for each place found in either places search. todo: check for redundancy or UI collisions with markers created in initmap
function createMarkersForPlaces(places) {
    let bounds = new google.maps.LatLngBounds();
    for (let i = 0; i < places.length; i++) {
        let place = places[i];
        let icon = {
            url: place.icon,
            size: new google.maps.Size(35, 35),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(15, 34),
            scaledSize: new google.maps.Size(25, 25)
        };
        // Create a marker for each place.
        let marker = new google.maps.Marker({
            map: map,
            icon: icon,
            title: place.name,
            position: place.geometry.location,
            id: place.place_id
        });
        // Create a single infowindow to be used with the place details information
        // so that only one is open at once.
        let placeInfoWindow = new google.maps.InfoWindow();
        // If a marker is clicked, do a place details search on it in the next function.
        marker.addListener('click', function() {
            if (placeInfoWindow.marker === this) {
                console.log("This infowindow already is on this marker!");
            } else {
                getPlacesDetails(this, placeInfoWindow);
            }
        });
        placeMarkers.push(marker);
        if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
        } else {
            bounds.extend(place.geometry.location);
        }
    }
    map.fitBounds(bounds);
}

// This is the PLACE DETAILS search - it's the most detailed so it's only
// executed when a marker is selected, indicating the user wants more
// details about that place.
function getPlacesDetails(marker, infowindow) {
    let service = new google.maps.places.PlacesService(map);
    service.getDetails({
        placeId: marker.id
    }, function(place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            // Set the marker property on this infowindow so it isn't created again.
            infowindow.marker = marker;
            var innerHTML = '<div>';
            if (place.name) {
                innerHTML += '<strong>' + place.name + '</strong>';
            }
            if (place.formatted_address) {
                innerHTML += '<br>' + place.formatted_address;
            }
            if (place.formatted_phone_number) {
                innerHTML += '<br>' + place.formatted_phone_number;
            }
            if (place.opening_hours) {
                innerHTML += '<br><br><strong>Hours:</strong><br>' +
                    place.opening_hours.weekday_text[0] + '<br>' +
                    place.opening_hours.weekday_text[1] + '<br>' +
                    place.opening_hours.weekday_text[2] + '<br>' +
                    place.opening_hours.weekday_text[3] + '<br>' +
                    place.opening_hours.weekday_text[4] + '<br>' +
                    place.opening_hours.weekday_text[5] + '<br>' +
                    place.opening_hours.weekday_text[6];
            }
            if (place.photos) {
                innerHTML += '<br><br><img src="' + place.photos[0].getUrl(
                    {maxHeight: 100, maxWidth: 200}) + '">';
            }
            innerHTML += '</div>';
            infowindow.setContent(innerHTML);
            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
        }
    });
}