/**
 * Created by jtumi on 1/28/2016.
 */

//ADDS JQUERY TO FILE
var script = document.createElement('script');
script.src = 'http://code.jquery.com/jquery-1.11.0.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);

//adds event listeners to page
function addListener(event, obj, fn) {
    if (obj.addEventListener) {
        obj.addEventListener(event, fn, false);   // modern browsers
    } else {
        obj.attachEvent("on"+event, fn);          // older versions of IE
    }
}

var element = document.getElementById('hamburger');

addListener('click', element, function () {
    //adjusts css of existing elements
    $(element).toggleClass("extended");
    $(".content").toggleClass("shrink");
    $(".topBar").toggleClass("shrink");
    $(".barItem").toggleClass("newBarItem");
    //adds text next to buttons
    $(".fa-music").text(function(i, text){
        return text === " CURRENT PLAYLIST" ? "" : " CURRENT PLAYLIST"
    });
    $(".fa-search").text(function(i, text){
        return text === " SEARCH MUSIC" ? "" : " SEARCH MUSIC"
    });
    $(".fa-list-alt").text(function(i, text){
        return text === " SEARCH PLAYLIST" ? "" : " SEARCH PLAYLIST"
    });
    $(".fa-globe").text(function(i, text){
        return text === " ACTIVITY" ? "" : " ACTIVITY"
    });
    $(".fa-user").text(function(i, text){
        return text === " ACCOUNT" ? "" : " ACCOUNT"
    });
});