/**
 * Manage Jukebox Controller
 */

angular.module('Songs').controller('ManageJukeboxCtrl', ['$scope', '$http', '$cookieStore', ManageJukeboxCtrl]);

function ManageJukeboxCtrl($scope, $http, $cookieStore) {
    var server = 'http://thomasscully.com';

    $scope.cancel = function() {
        window.location = "#/host";
    }

    $scope.saveChanges = function() {

    }
}