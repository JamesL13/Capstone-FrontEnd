/**
 * Library Controller
 */

angular.module('Songs').controller('LibraryCtrl', ['$scope', '$http', '$cookieStore', LibraryCtrl]);

function LibraryCtrl($scope, $http, $cookieStore) {
    var server = 'https://thomasscully.com';
    $http.defaults.headers.common = {
        'secret-token': 'aBcDeFgHiJkReturnOfTheSixToken666666',
        'Accept': "application/json, text/plain, */*"
    };

    var getSongsCallbackSuccess = function(response) {
        console.log(response);
        $scope.songs = response.data.songs;
    }
    var errorCallback = function(response) {

    }

    var init = function() {
        if ($cookieStore.get('isConnectedToPlaylist') == undefined || !$cookieStore.get('isConnectedToPlaylist')) {
            window.location = "#/findhost"
        } else {
            console.log("connectPlaylistUserId: " + $cookieStore.get('connectPlaylistUserId'));
            $http.get(server + '/songs?user_account_id=' + $cookieStore.get('connectPlaylistUserId')).then(getSongsCallbackSuccess, errorCallback);
        }
    }
    init();
}
