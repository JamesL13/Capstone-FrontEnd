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


    var init = function() {
        if ($cookieStore.get('isConnectedToPlaylist') == undefined || !$cookieStore.get('isConnectedToPlaylist')) {
            window.location = "#/findhost"
        }

    }
    init();
}
