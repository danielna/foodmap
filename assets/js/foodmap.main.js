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
        $(".meta").hide();
        var map = new foodmap.map();
        map.init();
    };

    $("#js-btn-menu").on("click", function() {
        $("body").toggleClass("menu-on");
    });

    $("#js-btn-welcome").on("click", function() {
        $("#welcome").fadeToggle();
    });

    $("#js-close-welcome").on("click", function() {
        $("#welcome").fadeOut();
    });


});