/**
 * Master Controller
 */

angular.module('Songs')
    .controller('MasterCtrl', ['$scope', '$cookieStore', 'searchApp', MasterCtrl]);

function MasterCtrl($scope, $cookieStore, searchApp) {
    var mobileView = 992;
    $scope.greeting = 'Hola!';
    $scope.getWidth = function() {
        return window.innerWidth;
    };
    $scope.$watch($scope.getWidth, function(newValue, oldValue) {
        if (newValue >= mobileView) {
            if (angular.isDefined($cookieStore.get('toggle'))) {
                $scope.toggle = !$cookieStore.get('toggle') ? false : true;
            } else {
                $scope.toggle = true;
            }
        } else {
            $scope.toggle = false;
        }

    });

    $scope.toggleSidebar = function() {
        $scope.toggle = !$scope.toggle;
        $cookieStore.put('toggle', $scope.toggle);
    };

    window.onresize = function() {
        $scope.$apply();
    };

    $scope.logout = function() {
        $cookieStore.put('isLoggedIn', false);
    }

    $scope.$on('$locationChangeStart', function(event) {
        $scope.isLoggedIn = $cookieStore.get('isLoggedIn');

        // Check playlist authentication
        if ($cookieStore.get('isConnectedToPlaylist') == undefined || !$cookieStore.get('isConnectedToPlaylist')) {
            $scope.isConnectedToPlaylist = false;
        } else {
            $scope.isConnectedToPlaylist = true;
        }
    });
    $('.nav a').on('click', function() {
        $('.navbar-toggle').click();
    });

    //Send Necessary info to Service
    $scope.search = function(searchee) {
        var id = $cookieStore.get('connectPlaylistUserId');
        searchApp.findWhatToSearch(id, searchee);
        //console.dir(searchApp.findWhatToSearch(id,searchee));
    }
}
