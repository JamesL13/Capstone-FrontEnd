/**
 * Create account Controller
 */

angular.module('Songs').controller('CreateAccountCtrl', ['$scope', '$http', '$cookieStore', CreateAccountCtrl]);

function CreateAccountCtrl($scope, $http, $cookieStore) {
    var server = 'http://thomasscully.com';
    $scope.formErrors = false;
    $scope.formErrorMessage = "";

    $scope.submit = function(isValid) {

        if (isValid) {
            $scope.formErrors = false;
            $http.post(server + '/accounts', $scope.accountInfo).then(successCallback, errorCallback);

        } else {
            $scope.formErrors = true;
            $scope.formErrorMessage = "Invalid form input. Please try again."
        }
    }

    successCallback = function(response) {
        
        console.log(response);
        if (response.data == "Email already in use.  Cannot create account.") {
            $scope.formErrorMessage = response.data;
            $scope.formErrors = true;
        } else {
            $cookieStore.put('isLoggedIn', true);
            window.location = "#/host";
        }

    }
    errorCallback = function(response) {
        $scope.formErrors = true;
    }

    var init = function() {


    }
    init();
}
