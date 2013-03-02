// Run the show

$(document).ready(function() {

    $(".meta").hide();
    var map = new foodmap.map();
    map.init();


    var $welcome = $("#welcome-container");

    $("#js-btn-menu").on("click", function() {
        $welcome.fadeOut();
        $("body").toggleClass("menu-left");
    });

    $("#js-btn-welcome").on("click", function() {
        $welcome.fadeToggle();
    });

    $("#js-close-welcome").on("click", function() {
        $welcome.fadeOut();
    });

    $("#js-btn-reset").on("click", function() {
        $welcome.fadeOut();
    });



    $(".js-expand-container").on("click", function() {
        $("body").toggleClass("menu-bottom");
    });

});