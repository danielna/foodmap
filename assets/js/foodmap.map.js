// The Map Object

(function() {
    
    foodmap.map = function() {

        var 
            markers         = [],
            markerBounds    = null,
            map             = null;

        // Initialize the maps
        var init = function() {        
            var 
                latlng = new google.maps.LatLng(38.907649,-77.239659), //arbitrary coordinates
                myOptions = {
                                zoom: 18,
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
                createMarkers(data);
                map.fitBounds(markerBounds);
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
                        title: self.name
                    });
                    marker.description = self.description;
                    marker.price = self.price;
                    marker.tags = self.tags;

                    markers.push(marker);             
                });

            } else {
                console.error("markerData is null in createMarkers");
                return null;
            }
            createClickEvents(markers);
        };

        var createClickEvents = function(markers) {
            for (var i in markers) {
                addClickListener(markers[i]);
            }

            function addClickListener(marker) {
                google.maps.event.addListener(marker, 'click', function() {
                    var meta = $(".meta");
                    meta.find(".title").text(marker.title);
                    meta.find(".description").html(marker.description);
                });
            }
        }


        return {
            init: init
        };

    };

})();