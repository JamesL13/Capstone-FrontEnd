/**
 * Find Host Controller
 */

angular.module('Songs').controller('FindHostCtrl', ['$scope','http' ,FindHostCtrl]);

function FindHostCtrl($scope) {
    var server = 'http://thomasscully.com';
    $scope.jukeboxes = [];

    var successCallback = function(response) {
        console.log(response);
        //window.location = "#/host";
        //location.reload();
    }

    var errorCallback = function(response) {
        console.log(response);
    }

    var init = function() {
        console.log("submitting");
        $http.get(server + '/playlists').success(function(jukebox) {
            $scope.jukeboxes = jukebox;
        }).then(successCallback, errorCallback);
    }

    init();
  
}