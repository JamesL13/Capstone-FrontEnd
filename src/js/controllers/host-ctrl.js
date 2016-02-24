/**
 * Host Controller
 */

angular.module('Songs').controller('HostCtrl', ['$scope', '$http', '$cookieStore', HostCtrl]);

function HostCtrl($scope, $http, $cookieStore) {
    var server = 'https://thomasscully.com';

    $scope.manageAccount = function() {
        window.location = "#/manageaccount";
    }

    $scope.manageJukebox = function() {
        window.location = "#/managejukebox";
    }

    var init = function() {
        if (!$cookieStore.get('isLoggedIn')) {
            window.location = "#/login";
        }
    }

    init();
}
