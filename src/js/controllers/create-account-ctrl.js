/**
 * Create account Controller
 */

angular.module('Songs').controller('CreateAccountCtrl', ['$scope', '$http', '$cookieStore', CreateAccountCtrl]);

function CreateAccountCtrl($scope, $http, $cookieStore) {
    var server = 'http://thomasscully.com';
    $scope.formErrors = false;

    $scope.submit = function(isValid) {

        if (isValid) {
            $scope.formErrors = false;
            $http.post(server + '/accounts', $scope.accountInfo).then(successCallback, errorCallback);

        } else {
            $scope.formErrors = true;
        }
    }

    successCallback = function(response) {
        $cookieStore.put('isLoggedIn', true);
        window.location = "#/host";
    }
    errorCallback = function(response) {
        $scope.formErrors = true;
    }

    var init = function() {


    }
    init();
}
