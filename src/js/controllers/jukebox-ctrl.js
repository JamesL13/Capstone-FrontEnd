/**
 * Jukebox Controller
 */

angular.module('Songs').controller('JukeboxCtrl', ['$scope', '$http', '$cookieStore', JukeboxCtrl]);

function JukeboxCtrl($scope, $http, $cookieStore) {
    var server = 'https://thomasscully.com';
    $http.defaults.headers.common = {
        'secret-token': 'aBcDeFgHiJkReturnOfTheSixToken666666',
        'Accept': "application/json, text/plain, */*"
    };
    var hostId = $cookieStore.get('hostid')
    //var jukeboxId = $cookieStore.get('jukeBoxid')
    $scope.businessName;
    $scope.playlistName;


    var init = function() {
        //console.log("hostId: " + hostId);
        //console.log("jukeboxId: " + jukeboxId);
        if ($cookieStore.get('isConnectedToPlaylist') == undefined || !$cookieStore.get('isConnectedToPlaylist')) {
            window.location = "#/findhost"
        }
        //console.log(hostId);
        $http.get(server + '/accounts?' + "account__id=" + hostId).success(function(name) {
            console.log(name);
            $scope.businessName = name[0];
            //console.log($scope.businessName[0].business);
        }).then(successCallback, errorCallback);
        $http.get(server + '/playlists?'+ "account__id=" + hostId).success(function(name) {
            $scope.playlistName = name[0];
        }).then(successCallback, errorCallback);
    }

    var errorCallback = function (response) {
        //console.log("failure");
        //console.log(response);
    }

    var successCallback = function (response) {
        //console.log("success");
        //console.log(response);
    }

    init();
}
