/**
 * Find Host Controller
 */

angular.module('Songs').controller('FindHostCtrl', ['$scope','$http', '$cookieStore', FindHostCtrl]);

function FindHostCtrl($scope, $http) {
    var server = 'https://thomasscully.com';

    $http.defaults.headers.common = {'secret-token': 'aBcDeFgHiJkReturnOfTheSixToken666666',
        'Accept': "application/json, text/plain, */*"
    };

    /*var config = {headers:  {
        "secret-token" : "aBcDeFgHiJkReturnOfTheSixToken666666"
    }
    };*/

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