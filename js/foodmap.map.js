
// The Map Object
// Trying object.prototype

// ?? unsure if I need these
var foodmap = foodmap || {};
foodmap.map = foodmap.map || {};

foodmap.map = function(container, kmlAddress) {
    this.kmlAddress = kmlAddress;
    this.container = container;
};

foodmap.map.prototype.init = function() {
    var latlng = new google.maps.LatLng(38.893171,-76.992187);

    var myOptions = {
      zoom: 20,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
  
    var map = new google.maps.Map(document.getElementById(this.container),
        myOptions);

    var eatLayer = new google.maps.KmlLayer(this.kmlAddress);
    eatLayer.setMap(map);
};
