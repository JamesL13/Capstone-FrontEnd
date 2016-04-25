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

    socket.on('message', function(data) {
        console.log('Incoming message:', data);
    });

    // Delete playlist function
    $scope.deletePlaylist = function() {
        var r = confirm("Are you sure you'd like to delete this playlist?");
        if (r == true) {
            $http.delete(server + "/playlists?id=" + $scope.playlist_id).then(
                function(response) {
                    $scope.hasPlaylist = false;
                    removeRoom($scope.playlist_id);
                },
                function(response) {
                    console.log("Server did not successfully complete request.");
                }
            );
        }
    }

    // Creates the playlist
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
                    console.log(response);
                    $scope.hasPlaylist = true;
                    $scope.playlist_name = data.playlist_name;
                    $scope.playlist_id = response.data;
                    createRoom(response.data);
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
    var createRoom = function(playlistId) {
        console.log("adding " + $cookieStore.get('userId'));
        socket.emit("createRoom", $cookieStore.get('userId'));
    }
    var removeRoom = function(playlistId) {
        console.log("removing " + $cookieStore.get('userId'));
        socket.emit("removeRoom", $cookieStore.get('userId'));
    }

    // Function to get user information from ID
    var getById = function(arr, id) {
        for (var d = 0, len = arr.length; d < len; d += 1) {
            if (arr[d].id === id) {
                return arr[d];
            }
        }
    }

    // Playlist get request callback
    var playlistResponse = function(response) {
        if (response.data == '') {
            $scope.hasPlaylist = false;
        } else {
            $scope.hasPlaylist = true;
            $scope.playlist_id = response.data.id;
            $scope.playlist_name = response.data.playlist_name;
            $scope.description = response.data.description;
            $scope.password = response.data.password;
        }
        $('.spinner').addClass('hide');
        $('.hostContainer').removeClass('hide');
    }

    // Account get request callback
    // Sets the account information in the session data
    var accountInfoResponse = function(response) {
        var userId = $cookieStore.get('userId');
        var single_object = getById(response.data, userId);
        $scope.businessName = single_object.business;
    }
    var errorCallback = function(response) {
        console.log("Something went wrong.");
    }
    var init = function() {
        if (!$cookieStore.get('isLoggedIn')) {
            window.location = "#/login";
        }
        $http.get(server + '/playlists?account__id=' + $cookieStore.get('userId')).then(playlistResponse, errorCallback);
        $http.get(server + '/accounts?account__id=' + $cookieStore.get('userId')).then(accountInfoResponse, errorCallback);
    }

    init();


}
