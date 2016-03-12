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
            console.log("success and true");
            if ($scope.modalInstance != null) {
                $scope.modalInstance.$dismiss(connect);
                console.log("success true and modal not null");
            }
        } else {
            $scope.formErrorMessage = "Invalid password.";
            $scope.formErrors = true;
            console.log("success false");
        }
        /*if ($scope.modalInstance != null) {
            $scope.modalInstance.$dismiss(submit);
            console.log("Here5");
        }*/
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

    $scope.submit = function() {
        //console.log($scope.connectDetails);
        var isValid = true;
        if (isValid) {
            $http.post(server + '/playlists/join', {'id': $scope.currentId, 'password': "thomas"}/*,*$scope.connectDetails*/).then(successCallback, errorCallback);
            console.log("submit and isvalid");
        } else {
            $scope.formErrors = true;
            $scope.formErrorMessage = "Invalid password.";
            console.log("submit and invalid");
        }
    };

    init();

}