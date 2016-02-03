/**
 * Alerts Controller
 */

angular.module('Songs').controller('AlertsCtrl', ['$scope', AlertsCtrl]);

function AlertsCtrl($scope) {
    $scope.alerts = [{
        type: 'success',
        msg: 'Welcome to Song[s]!'
    }];

    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };
}