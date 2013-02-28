// The Map Object

(function() {
    
foodmap.map = function() {

    var 
        markers = {},
        markerBounds = null,
        map = null,
        infoWindow = null,
        zoom = 18;

    /**
    * Run the show
    *
    * @param int setZoom - set a specific initial zoom level for google maps
    */
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

        // Get the eatery data from the JSON file
        var path = 'assets/resources/eateries.json';

        $.getJSON(path, function(data) {
            createMarkers(data);
            createMarkerDomListeners();
            setOriginalZoom();
        });

        $("#js-btn-reset").on("click", function(){
            setOriginalZoom();
        });
    };

    /**
    * Create the Google Maps Marker objects.
    * Creat the associated click listener for each marker.
    * return markers as js object with title as key
    *
    * @param json data - The json representation of the marker data
    */
    var createMarkers = function(markerData) {

        function addClickListener(marker) {
            google.maps.event.addListener(marker, 'click', function() {
                $("#welcome-container").fadeOut();

                marker_util.highlightListing(marker.title);
                marker_util.zoomMarker(marker.title);
                marker_util.showInfoWindow(marker.title);
            });
        }

        var createMarkerListing = function(marker) {
            var $listing_container = $(".js-listing-container"),
                $listing = $("#js-template-listing").clone(),
                price_map = foodmap.globals.price_map[marker.price];

            $listing.find(".listing").attr("data-id", marker.title);
            $listing.find(".title").text(marker.title);
            $listing.find(".price").html(price_map).attr("data-price", marker.price);

            $listing_container.append($listing.html());
        };

        if (markerData) {
            $.each(markerData.Eateries, function(key, val) {                    
                var _this = this;

                // set latlng and markerBounds
                var latLng = new google.maps.LatLng( parseFloat(_this.coordinates.lat, 10), parseFloat(_this.coordinates.lng, 10) );
                markerBounds.extend(latLng);

                // create map markers
                var marker = new google.maps.Marker({
                    position: latLng,
                    animation: google.maps.Animation.DROP,
                    map: map,
                    icon: foodmap.globals.map_icons[_this.price],
                    title: _this.name
                });

                marker.description = _this.description;
                marker.price = _this.price;
                marker.tags = _this.tags;

                markers[_this.name] = marker;

                addClickListener(marker);
                createMarkerListing(marker);
            });

        } else {
            console.error("markerData is null in createMarkers");
            return null;
        }        

        return markers;
    };


    /**
    * Create the DOM listing representing each Google Maps marker.
    * Add the DOMListener for clicking on each listing, which engages the map via the marker.
    */
    var createMarkerDomListeners = function(){
        var $listing_container = $(".js-listing-container"),
            $listings = $listing_container.find(".listing");

        $listings.each(function(index) {
            var $self = $(this);

            $self.on("click", function() {
                $listings.removeClass("active");
                $self.addClass("active");
            });

            google.maps.event.addDomListener($self[0], "click", function(ev) {
                $("#welcome-container").fadeOut();
                
                var id = $self.attr("data-id");
                marker_util.zoomMarker(id);
                marker_util.showInfoWindow(id);
            });
        });
    };


    /**
    * Create the DOM listing representing each Google Maps marker.
    * Add the DOMListener for clicking on each listing, which engages the map via the marker.
    */
    var setOriginalZoom = function(){
        if (infoWindow) {
            infoWindow.close();
        }
        map.fitBounds(markerBounds);
    };  


    /**
    * A collection of functions that manipulate the map based on a marker id
    */
    var marker_util = {
        
        // "Activate" a marker listing by highlighting and scrolling to it.
        highlightListing: function(id) {
            var 
                $body = $("body"),
                $js_listing_container = $(".js-listing-container"),
                $active_listing = $js_listing_container.find("[data-id=\"" + id + "\"]");

            if (!$body.hasClass("menu-on")) {
                $body.addClass("menu-on");
            }

            $js_listing_container.find(".listing").removeClass("active");
            $active_listing.addClass("active");

            console.log("offsetLeft:",$active_listing[0].offsetLeft);
            $("#bottom-container .listing-scroll").scrollLeft($active_listing[0].offsetLeft);
        },

        // Zoom to a marker on the map
        zoomMarker: function(id) {
            map.setCenter(markers[id].getPosition());
            map.setZoom(16);
        },

        // Pop an info window for the given marker id
        showInfoWindow: function(id) {
            var marker = markers[id];
            if (infoWindow) {
                infoWindow.close();
            }
            infoWindow = new google.maps.InfoWindow({
                content: marker.description
            });

            infoWindow.open(map, marker);
        }

    };

    return {
        init: init
    };

};

})();