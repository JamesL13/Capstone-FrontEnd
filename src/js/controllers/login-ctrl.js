/**
 * Login Controller
 */

angular.module('Songs').controller('LoginCtrl', ['$scope', '$http', '$cookieStore', LoginCtrl]);

function LoginCtrl($scope, $http, $cookieStore) {
    var server = 'http://thomasscully.com';
    $scope.formErrors = false;

    $scope.submit = function(isValid) {
        if (isValid) {
            $http.post(server + '/accounts/login', $scope.loginForm).then(successCallback, errorCallback);
        } else {
            $scope.formErrors = true;
        }
    }

    var successCallback = function(response) {
        
        console.log(response);
        $cookieStore.put('isLoggedIn', true);
        window.location = "#/host";
        location.reload();
    }
    var errorCallback = function(response) {
        $scope.formErrorMessage = response.data;

    }
    var init = function() {



    }

    $scope.login = function() {

    }

    init();
}
