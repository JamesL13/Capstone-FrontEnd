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
        //console.log(response);
        if (response == true) {
            $cookieStore.put('isConnected', true);
            $cookieStore.put('jukeBoxid', $scope.currentId);
            if ($scope.modalInstance != null) {
                $scope.modalInstance.$dismiss(connect);
            }
        } else {
            $scope.formErrorMessage = "Invalid password.";
            $scope.formErrors = true;
        }
        if ($scope.modalInstance != null) {
            $scope.modalInstance.$dismiss(connect);
        }
    }

    var errorCallback = function (response) {
        console.log(response);
    }

    var init = function () {
        $http.get(server + '/playlists').success(function (jukebox) {
            $scope.jukeboxes = jukebox;
        }).then(successCallback, errorCallback);
    }

    $scope.open = function (size, id) {
        console.log(id);
        $scope.currentId = id;
        $scope.modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'templates/modalContent.html',
            size: size,
            scope: $scope,
        });
    };

    $scope.submit = function(isValid) {
        console.log($scope.password);
        if (isValid) {
            $http.post(server + '/playlists/join', {'id': $scope.currentId, 'password': "password"}/*,*$scope.connectDetails*/).then(successCallback, errorCallback);
        } else {
            $scope.formErrors = true;
            $scope.formErrorMessage = "Invalid password.";
        }
    };

    init();

}