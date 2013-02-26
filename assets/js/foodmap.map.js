// The Map Object

(function() {
    
    foodmap.map = function() {

        var 
            markers         = {},
            markerBounds    = null,
            map             = null,
            infoWindow      = null,
            zoom            = 18;

        // Initialize the maps
        var init = function(setZoom) {        
            var 
                latlng = new google.maps.LatLng(38.907649,-77.239659), //arbitrary coordinates
                zoom = setZoom || zoom;
                myOptions = {
                                zoom: zoom,
                                center: latlng,
                                mapTypeId: google.maps.MapTypeId.ROADMAP
                            };
            
            markerBounds = new google.maps.LatLngBounds();

            map = new google.maps.Map(document.getElementById(foodmap.globals.container), myOptions);

            // get the eatery data from the JSON file
            var path = 'assets/resources/eateries.json';

            $.getJSON(path, function(data) {
                var markers = createMarkers(data);
                createMarkerEvents(markers);

                setMarkerBounds(markerBounds);
                setOriginalZoom();
                populateMarkersMenu(markers);
            });

            $("#js-btn-reset").on("click", function(){
                setOriginalZoom();
            });
        };

        // Turn the data into map markers
        var createMarkers = function(markerData) {
            if (markerData) {
                $.each(markerData.Eateries, function(key, val) {                    
                    var self = this;

                    // set latlng and markerBounds
                    var latLng = new google.maps.LatLng( parseFloat(self.coordinates.lat), parseFloat(self.coordinates.lng) );
                    markerBounds.extend(latLng);

                    // create map markers
                    var marker = new google.maps.Marker({
                        position: latLng,
                        animation: google.maps.Animation.DROP,
                        map: map,
                        icon: foodmap.globals.map_icons[self.price],
                        title: self.name
                    });
                    marker.description = self.description;
                    marker.price = self.price;
                    marker.tags = self.tags;

                    markers[self.name] = marker;             
                });

            } else {
                console.error("markerData is null in createMarkers");
                return null;
            }
            return markers;
        };

        // Create the marker related click events
        var createMarkerEvents = function(markers) {
            for (var i in markers) {
                addClickListener(markers[i]);
            }

            function addClickListener(marker) {
                google.maps.event.addListener(marker, 'click', function() {
                    highlightListing(marker.title);
                    zoomMarker(marker.title);
                    showInfoWindow(marker.title);
                });
            }
        };

        // Pop an info window for the given marker id
        var showInfoWindow = function(id) {
            var marker = markers[id];
            if (infoWindow) {
                infoWindow.close();
            }
            infoWindow = new google.maps.InfoWindow({
                content: marker.description
            });

            infoWindow.open(map, marker);
        };

        var setMarkerBounds = function(inputBounds) {
            markerBounds = inputBounds;
        };

        // Reset the map to the original zoom
        var setOriginalZoom = function(){
            if (infoWindow) {
                infoWindow.close();
            }
            map.fitBounds(markerBounds);
        };

        // Zoom to a marker id
        var zoomMarker = function(title) {
            map.setCenter(markers[title].getPosition());
            map.setZoom(16);
        };

        // Populate left-menu of eateries from the marker objects
        var populateMarkersMenu = function(markers){
            $listing_container = $(".js-listing-container");

            for (var i in markers) {
                var marker = markers[i],
                    price_map = foodmap.globals.price_map[marker.price],
                    $listing = $("#js-template-listing").clone();

                $listing.find(".listing").attr("data-id", marker.title);
                $listing.find(".title").text(marker.title);
                $listing.find(".price").html(price_map).attr("data-price", marker.price);

                $listing_container.append($listing.html());
            }


            var listings = $listing_container.find(".listing");
            listings.each(function(index) {
                var $self = $(this);
                
                $self.on("click", function() {
                    listings.removeClass("active");
                    $self.addClass("active");
                });

                google.maps.event.addDomListener($self[0], "click", function(ev) {
                    var id = $self.attr("data-id");
                    zoomMarker(id);
                    showInfoWindow(id);
                });
            });
        };

        // Highlight an eatery listing in the left menu, scroll to it.
        var highlightListing = function(id){
            var 
                $body                   = $("body"),
                $js_listing_container   = $(".js-listing-container"),
                $active_listing         = $js_listing_container.find("[data-id=\"" + id + "\"]");

            if (!$body.hasClass("menu-on")) {
                $body.addClass("menu-on");
            }

            $js_listing_container.find(".listing").removeClass("active");
            $active_listing.addClass("active");

            $("#left-menu").scrollTop($active_listing[0].offsetTop);
        };

        return {
            init: init
        };

    };

})();