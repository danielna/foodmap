// Run the show

$(document).ready(function() {

    function loadScript() {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "http://maps.googleapis.com/maps/api/js?key=" + foodmap.globals.API_KEY + "&sensor=false&callback=initialize";
        document.body.appendChild(script);
    }

    loadScript();

    window.initialize = function() { 
        var map = new foodmap.map();
        map.init();
    }

});