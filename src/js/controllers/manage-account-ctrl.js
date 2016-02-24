/**
 * Manage Account Controller
 */

angular.module('Songs').controller('ManageAccountCtrl', ['$scope', '$http', '$cookieStore', ManageAccountCtrl]);

function ManageAccountCtrl($scope, $http, $cookieStore) {

    var server = 'https://thomasscully.com';

    $scope.cancel = function() {
        window.location = "#/host";
    }

    $scope.saveChanges = function() {

    }
    var init = function() {
        if (!$cookieStore.get('isLoggedIn')) {
            window.location = "#/login";
        }
    }

    init();
}
