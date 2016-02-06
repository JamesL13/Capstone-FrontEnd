/**
 * Login Controller
 */

angular.module('Songs').controller('LoginCtrl', ['$scope', '$http', '$cookieStore', LoginCtrl]);

function LoginCtrl($scope, $http, $cookieStore) {
    var server = 'http://thomasscully.com';
    $scope.formErrors = false;

    $scope.submit = function(isValid) {
        if (isValid) {
            $http.get(server + '/accounts').then(successCallback, errorCallback);
        } else {
            $scope.formErrors = true;
        }
    }

    var successCallback = function(response) {
        var matches = response.data.filter(function(val, index, array) {
            return val.user_email === 'devin@yeah.com';
        });
        console.log(util.inspect(response, false, null));
        $cookieStore.put('isLoggedIn', true);
        window.location = "#/host";
        location.reload();
    }
    var errorCallback = function(response) {

    }
    var init = function() {



    }

    $scope.login = function() {

    }

    init();
}
