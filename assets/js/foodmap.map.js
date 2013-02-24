// The Map Object

(function() {
    
    foodmap.map = function() {

        var 
            markers         = {},
            markerBounds    = null,
            map             = null,
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

            getMarkerData();
        };

        // Get the eatery data from the local JSON file
        var getMarkerData = function() {
            var path = 'assets/resources/eateries.json';

            $.getJSON(path, function(data) {
                var markers = createMarkers(data);
                createMarkerEvents(markers);

                setMarkerBounds(markerBounds);
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

        var createMarkerEvents = function(markers) {
            for (var i in markers) {
                addClickListener(markers[i]);
            }

            function addClickListener(marker) {
                google.maps.event.addListener(marker, 'click', function() {
                    $("#welcome").slideUp();
                    var meta = $(".meta");
                    meta.show();

                    var price_map = foodmap.globals.price_map[marker.price];
                    meta.find(".title").text(marker.title);
                    meta.find(".description").html(marker.description);
                    meta.find(".price").html(price_map).attr("data-price", marker.price);
                    meta.find(".tags").html(marker.tags);

                    zoomMarker(marker.title);
                });
            }

            $("#reset-map").on("click", function(){
                setOriginalZoom();
            });
        };

        var setMarkerBounds = function(inputBounds) {
            markerBounds = inputBounds;
        };

        var setOriginalZoom = function(){
            map.fitBounds(markerBounds);
        };

        var zoomMarker = function(title) {
            map.setCenter(markers[title].getPosition());
            map.setZoom(16);
        };

        return {
            init: init
        };

    };

})();