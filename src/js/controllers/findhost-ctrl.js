/**
 * Find Host Controller
 */

angular.module('Songs').controller('FindHostCtrl', ['$scope','$http', '$uibModal', '$cookieStore', FindHostCtrl]);

function FindHostCtrl($scope, $http, $uibModal) {
    var server = 'https://thomasscully.com';
    $scope.modalInstance = null;
    $scope.animationsEnabled = true;
    $scope.formErrors = false;
    $scope.formErrorMessage = "";
    $scope.currentId = null;

    $http.defaults.headers.common = {
        'secret-token': 'aBcDeFgHiJkReturnOfTheSixToken666666',
        'Accept': "application/json, text/plain, */*"
    };

    $scope.jukeboxes = [];

    var successCallback = function (response) {
        console.log(response);
            if ($scope.modalInstance != null) {
                if (response == true) {
                    isConnectedChecker = $cookieStore.get('isConnected')
                    if (isConnectedChecker = true){
                        $cookieStore.put('jukeBoxid', '');
                        $cookieStore.put('jukeBoxid', $scope.currentId);
                    }
                    $cookieStore.put('isConnected', true);
                    $cookieStore.put('jukeBoxid', $scope.currentId);
                    $scope.modalInstance.dismiss();
                    //window.location = "#/jukebox";
                } else {
                    $scope.formErrorMessage = "Invalid password.";
                    $scope.formErrors = true;
                }
            }
    }

    var errorCallback = function (response) {
        console.log(response);
    }

    var init = function() {
        $http.get(server + '/playlists').success(function(jukebox) {
            $scope.jukeboxes = jukebox;
        }).then(successCallback, errorCallback);
    }

    $scope.open = function (size, id) {
        $scope.currentId = id;
        $scope.modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'templates/modalContent.html',
            size: size,
            scope: $scope,
            id: id,
        });
    };

    $scope.submit = function(isValid, password ) {
        if (isValid) {
            $http.post(server + '/playlists/join', {"id": $scope.currentId, "password": password}).then(successCallback, errorCallback);
        } else {
            $scope.formErrors = true;
            $scope.formErrorMessage = "Enter Password";
        }
    };

    init();

}