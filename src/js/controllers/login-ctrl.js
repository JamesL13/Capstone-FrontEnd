/**
 * Login Controller
 */

angular.module('Songs').controller('LoginCtrl', ['$scope', '$http', '$cookieStore', LoginCtrl]);

function LoginCtrl($scope, $http, $cookieStore) {
    var server = 'https://thomasscully.com';
    $http.defaults.headers.common = {
        'secret-token': 'aBcDeFgHiJkReturnOfTheSixToken666666',
        'Accept': "application/json, text/plain, */*"
    };
    $scope.formErrors = false;
    $scope.formErrorMessage = "";

    // Login function
    $scope.submit = function(isValid) {
        // Check if form is valid
        if (isValid) {
            $http.post(server + '/accounts/login', $scope.loginDetails).then(successCallback, errorCallback);
        } else {
            $scope.formErrors = true;
            $scope.formErrorMessage = "Invalid username / password.";
        }
    }

    // Successful server communication
    var successCallback = function(response) {
            // Succesful login
            if (response.data) {
                $cookieStore.put('isLoggedIn', true);
                $cookieStore.put('userId', response.data);
                window.location = "#/host";
            } else {
                $scope.formErrorMessage = "Invalid username / password combination.";
                $scope.formErrors = true;
            }
        }
        // Failed log in, server side
    var errorCallback = function(response) {
        $scope.formErrorMessage = "Server not responding. Please try again later.";
        $scope.formErrors = true;
    }

    // Get a specified parameter from the URL
    var getParameterByName = function(name, url) {
        if (!url) url = window.location.href;
        url = url.toLowerCase(); // This is just to avoid case sensitiveness  
        name = name.replace(/[\[\]]/g, "\\$&").toLowerCase(); // This is just to avoid case sensitiveness for query parameter name
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    var init = function() {
        if ($cookieStore.get('isLoggedIn')) {
            window.location = "#/host";
        }

        // Check if they are coming from the account creation page
        var checkAccountCreation = getParameterByName('account_creation');
        if (checkAccountCreation) {
            $scope.accountCreated = true;
        }
    }

    init();
}
