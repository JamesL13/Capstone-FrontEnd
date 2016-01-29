/**
 * Created by jtumi on 1/28/2016.
 */
//RENAME LATER TO SOMETHING ELSE
//ADDS JQUERY TO FILE
var script = document.createElement('script');
script.src = 'http://code.jquery.com/jquery-1.11.0.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);

function addListener(event, obj, fn) {
    if (obj.addEventListener) {
        obj.addEventListener(event, fn, false);   // modern browsers
    } else {
        obj.attachEvent("on"+event, fn);          // older versions of IE
    }
}

var element = document.getElementById('hamburger');

addListener('click', element, function () {
    $(element).toggleClass("extended");
    $("content").toggleClass("shrink");
});