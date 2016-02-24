/**
 * Login Controller
 */

angular.module('Songs').controller('LoginCtrl', ['$scope', '$http', '$cookieStore', LoginCtrl]);

function LoginCtrl($scope, $http, $cookieStore) {
    var server = 'https://thomasscully.com';
    $scope.formErrors = false;
    $scope.formErrorMessage = "";

    $scope.submit = function(isValid) {
        if (isValid) {
            $http.post(server + '/accounts/login', $scope.loginDetails).then(successCallback, errorCallback);
        } else {
            $scope.formErrors = true;
            $scope.formErrorMessage = "Invalid username / password.";
        }
    }

    var successCallback = function(response) {
        if (response.data) {
            $cookieStore.put('isLoggedIn', true);
            $cookieStore.put('userId', response.data);
            window.location = "#/host";
        } else {
            $scope.formErrorMessage = "Invalid username / password combination.";
            $scope.formErrors = true;
        }
    }
    var errorCallback = function(response) {
        $scope.formErrorMessage = "Server not responding. Please try again later.";
        $scope.formErrors = true;

    }
}
