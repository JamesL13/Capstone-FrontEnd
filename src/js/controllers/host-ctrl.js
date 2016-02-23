/**
 * Host Controller
 */

angular.module('Songs').controller('HostCtrl', ['$scope', '$http', '$cookieStore', HostCtrl]);

function HostCtrl($scope, $http, $cookieStore) {
    var server = 'http://thomasscully.com';

    $scope.manageAccount = function() {
        window.location = "#/manageaccount";
    }

    $scope.manageJukebox = function() {
        window.location = "#/managejukebox";
    }
}
