/**
 * Manage Account Controller
 */

angular.module('Songs').controller('ManageAccountCtrl', ['$scope', '$http', '$cookieStore', ManageAccountCtrl]);

function ManageAccountCtrl($scope, $http, $cookieStore) {
    var server = 'http://thomasscully.com';

    $scope.cancel = function() {
        window.location = "#/host";
    }

    $scope.saveChanges = function() {

    }
}