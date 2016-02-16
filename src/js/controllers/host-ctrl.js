/**
 * Host Controller
 */

angular.module('Songs').controller('HostCtrl', ['$scope', '$http', '$cookieStore', HostCtrl]);

function HostCtrl($scope, $http, $cookieStore) {
    var server = 'http://thomasscully.com';

    $scope.manageAccount = function() {
        window.location = "#/manageaccount";
    }

    $scope.manageJukebox = function() {
        window.location = "#/managejukebox";
    }


    var jsmediatags = window.jsmediatags; // From remote host
    var inputTypeFile = document.querySelector('input[type="file"]');

    inputTypeFile.addEventListener("change", function (event) {
        var file = event.target.files[0];
        jsmediatags.read(file, {
            onSuccess: function (tag) {
                console.log(tag);
            },
            onError: function (error) {
                console.log(error);
            }
        });
    }, false);


}
