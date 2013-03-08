// The Map Object

(function() {
    
foodmap.map = function() {

    var 
        markers = {},
        tags = [],
        markerBounds = null,
        map = null,
        infoBox = null,
        zoom = 10,
        listingWidth = 145,
        zoomedOnce = false;

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
                            mapTypeId: google.maps.MapTypeId.ROADMAP,
                            mapTypeControl: false
                        };
        
        markerBounds = new google.maps.LatLngBounds();

        map = new google.maps.Map(document.getElementById(foodmap.globals.container), myOptions);

        // Get the eatery data from the JSON file
        var path = 'assets/resources/eateries.json';

        $.getJSON(path, function(data) {
            parseMarkers(data);
            createMarkerDomListeners();
            setOriginalZoom();
        });

        $("#js-btn-reset").on("click", function(){
            setOriginalZoom();
            $(".js-listing-container .listing").show().removeClass("active");
            _.each(markers, function(marker){
                marker.setVisible(false);
            });
        });
    };

    /**
    * Parse the data returned via JSON.
    * Create the Google Maps Marker objects.
    * Create the associated click listener for each marker.
    * return markers as js object with title as key
    *
    * @param json data - The json representation of the marker data
    */
    var parseMarkers = function(markerData) {

        function addClickListener(marker) {
            google.maps.event.addListener(marker, 'click', function() {
                $("#welcome-container").fadeOut();

                marker_util.highlightListing(marker.title);
                marker_util.zoomMarker(marker.title);
                marker_util.showinfoBox(marker.title);
            });
        }

        var createMarkerListing = function(marker) {
            var $listing_container = $(".js-listing-container"),
                $listing = $("#js-template-listing").clone(),
                price_map = foodmap.globals.price_map[marker.price];

            $listing.find(".listing").attr("data-id", marker.title);
            $listing.find(".title").text(marker.title);
            $listing.find(".price").html(price_map).attr("data-price", marker.price);
            if (marker.tags && marker.tags.indexOf('BestOf') !== -1) {
                $listing.find(".best-of").attr("style", "");
            }

            $listing_container.append($listing.html());
        };

        // Create the array of tags for all markers
        var parseTags = function(tagsCSV) {
            var tagsArray = tagsCSV.split(',');
            for(var i = 0; i < tagsArray.length; i++){
                if (tags.indexOf(tagsArray[i].trim()) === -1) {
                    tags.push(tagsArray[i]);
                }    
            }
        };

        // Render the array of tags as filterable buttons in the left-container
        var renderTags = function() {
            var $container = $("#left-container .tags"),
                output = "";
            
            for(var i = 0; i < tags.length; i++){
                var tag = tags[i];
                output = "<button class='button tag' title='" + tag + "'data-id='" + tag + "'>" + tag + "</button>";
                $container.append(output);
            }
        };

        var tagClickEvents = function() {
            $(".tags .tag").on("click", function() {
                
                $("#welcome-container").fadeOut();

                var $_this = $(this),
                    tagName = $_this.attr("data-id"),
                    activeMarkers = [],
                    $listings = $(".js-listing-container .listing");

                $(".tags .tag").removeClass("active");
                $_this.addClass("active");

                var filteredMarkers = _.filter(markers, function(obj){
                    return (obj.tags && obj.tags.indexOf(tagName) > -1);
                });

                // markers
                _.each(markers, function(marker){
                    marker.setVisible(false);
                });
                _.each(filteredMarkers, function(marker){
                    marker.setVisible(true);
                    activeMarkers.push(marker.title);
                });

                // listings
                $listings.hide();
                _.each(activeMarkers, function(id){
                    $listings.filter('[data-id="' + id + '"]').show();
                });
                
                $listings.filter(":visible").first()[0].click();
            });
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
                marker.ethnicity = _this.ethnicity;
                marker.tags = _this.tags;

                markers[_this.name] = marker;

                if (marker.tags) { 
                    parseTags(marker.tags);
                }

                addClickListener(marker);
                createMarkerListing(marker);
            });
            
            // set the width of the scrolling listing container
            var pixelLength = listingWidth * _.keys(markers).length;
            $("#bottom-container").find(".listing-container").attr("style", "width:" + pixelLength + "px;");

            // todo: for the love of God clean this up.
            renderTags();
            tagClickEvents();

        } else {
            console.error("markerData is null in parseMarkers");
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
                marker_util.showinfoBox(id);

                console.log("self[0]:", $self[0]);
            });
        });
    };


    /**
    * Create the DOM listing representing each Google Maps marker.
    * Add the DOMListener for clicking on each listing, which engages the map via the marker.
    * Reset the zoomedOnce to false, since you're resetting the map.
    */
    var setOriginalZoom = function(){
        if (infoBox) {
            infoBox.close();
        }
        zoomedOnce = false;
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

            $("#bottom-container .listing-scroll").animate({scrollLeft: $active_listing[0].offsetLeft - ($(window).width()/2)}, 1200);
        },

        // Zoom to a marker on the map at 13, only if it's the first time you zoom.
        // Otherwise don't zoom.
        zoomMarker: function(id) {
            if (!zoomedOnce) {
                zoomedOnce = true;
                map.setCenter(markers[id].getPosition());
                map.setZoom(13);
            }
        },

        // Pop an infoBox for the given marker id
        showinfoBox: function(id) {
            var marker = markers[id],
                price_map = foodmap.globals.price_map[marker.price],
                content_tags = marker.tags ? ", " + marker.tags : "",
                content = 
                    '<span class="title">' + marker.title + '</span>' + 
                    '<span class="price" data-price="' + marker.price + '">' + price_map + '</span>' + 
                    '<span class="tags">' + marker.ethnicity + content_tags + '</span>' + marker.description;

            if (infoBox) {
                infoBox.close();
            }

            infoBox = new InfoBox({
                boxClass: "infobox-container",
                content: content,
                infoBoxClearance: new google.maps.Size(50,50),
                pixelOffset: new google.maps.Size(-200,5)
            });

            infoBox.open(map, marker);
        }

    };

    return {
        init: init
    };

};

})();