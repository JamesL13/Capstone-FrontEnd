/**
 * Find Host Controller
 */

 angular.module('Songs').controller('FindHostCtrl', ['$scope','$http', '$uibModal', '$cookieStore', FindHostCtrl]);

 function FindHostCtrl($scope, $http, $uibModal, $cookieStore) {
    var server = 'https://thomasscully.com';
    $scope.modalInstance = null;
    $scope.animationsEnabled = true;
    $scope.formErrors = false;
    $scope.formErrorMessage = "";
    $scope.currentId = null;
    $scope.hostId = null;

    $http.defaults.headers.common = {
        'secret-token': 'aBcDeFgHiJkReturnOfTheSixToken666666',
        'Accept': "application/json, text/plain, */*"
    };

    $scope.jukeboxes = [];

    var errorCallback = function (response) {
        console.log("failure");
        console.log(response);
    }

    var hostConnectSuccessCallback = function (response) {
        if ($scope.modalInstance != null) {
            // Bug in backend where response sends back false if bad password, just an OK for good password
            // This bypasses that issue, but if backend updates, having explicit checks for True or False 
            // Should be added, rather than an if false, else statement as implemented here.
            if (response.data == false) {
                $scope.formErrorMessage = "Invalid password.";
                $scope.formErrors = true;
            } 
            else {
                isConnectedChecker = $cookieStore.get('isConnectedToPlaylist');
                if (isConnectedChecker = true){
                    //$cookieStore.put('jukeBoxid', '');
                    $cookieStore.put('jukeBoxid', $scope.currentId);
                    $cookieStore.put('hostid', $scope.hostId);
                }
                socket.emit('room', $scope.playlistname);
                $cookieStore.put('isConnectedToPlaylist', true);
                $cookieStore.put('connectPlaylistUserId', response.data);
                $scope.modalInstance.dismiss();
                window.location = "#/jukebox";
            }
        }
    }

    var getPlaylistSuccessCallback = function (response) {
        // TO-DO
    };

    var init = function() {

        $http.get(server + '/playlists').success(function(jukebox) {
            $scope.jukeboxes = jukebox;
            $(".spinner").hide();
        }).then(getPlaylistSuccessCallback, errorCallback);
    };

    $scope.open = function (size, hostid, id) {
        $scope.hostId = hostid;
        $scope.currentId = id;
        $scope.modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'templates/modalContent.html',
            size: size,
            scope: $scope,
            id: id,
        });
    };

    $scope.submit = function(isValid, password, playlistname) {   
        if (isValid) {
            var id = $scope.currentId.toString();
            $scope.playlistname = playlistname;
            var data = {
                "id": id,
                "password": password.$modelValue
            };
            $http.post(server + '/playlists/join', data).then(hostConnectSuccessCallback, errorCallback);
        } else {
            $scope.formErrors = true;
            $scope.formErrorMessage = "Enter Password";
        }
    };

    init();

}