/**
 * Host Controller
 */

angular.module('Songs').controller('HostCtrl', ['$scope', '$http', '$cookieStore', HostCtrl]);

function HostCtrl($scope, $http, $cookieStore) {
   var server = 'https://thomasscully.com';
    $http.defaults.headers.common = {
        'secret-token': 'aBcDeFgHiJkReturnOfTheSixToken666666',
        'Accept': "application/json, text/plain, */*"
    };
    $scope.formErrors = false;
    $scope.formErrorMessage = "";
    $scope.userId = $cookieStore.get('userId');

    $scope.manageAccount = function() {
        window.location = "#/manageaccount";
    }

    $scope.manageJukebox = function() {
        window.location = "#/managejukebox";
    }
    $scope.deletePlaylist = function() {
        var r = confirm("Are you sure you'd like to delete this playlist?");
        if (r == true) {
            $http.delete(server + "/playlists?id=" + $scope.playlist_id).then(
                function(response) {
                    location.reload();
                },
                function(response) {
                    console.log("Server did not successfully complete request.");
                }
            );
        }
    }
    $scope.submit = function(isValid) {
        if (isValid) {
            var data = {
                "user__account": $scope.userId,
                "playlist_name": $scope.loginDetails.playlist_name,
                "description": $scope.loginDetails.description,
                "password": $scope.loginDetails.password
            };
            $http.post(server + '/playlists', data).then(
                function(response) {
                    location.reload();
                },
                function(response) {
                    console.log("Server did not successfully complete request.");
                }
            );
        } else {
            $scope.formErrors = true;
            $scope.formErrorMessage = "There was a problem with your input. Please try again.";
        }
    }

    // Playlist callback
    var playlistResponse = function(response) {
        if (response.data == '') {
            $scope.hasPlaylist = false;
        } else {
            $scope.hasPlaylist = true;
            $scope.playlist_id = response.data[0].id;
            $scope.playlist_name = response.data[0].playlist_name;
            $scope.description = response.data[0].description;
            $scope.password = response.data[0].password;
        }
    }
    var errorCallback = function(response) {}

    var init = function() {
        if (!$cookieStore.get('isLoggedIn')) {
            window.location = "#/login";
        }
        $http.get(server + '/playlists?account__id=' + $cookieStore.get('userId')).then(playlistResponse, errorCallback);
    }

    init();
}
