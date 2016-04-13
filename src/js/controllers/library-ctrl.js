/**
 * Library Controller
 */

 angular.module('Songs').controller('LibraryCtrl', ['$scope', '$http', '$cookieStore', '$window', LibraryCtrl]);

 function LibraryCtrl($scope, $http, $cookieStore, $window) {
    var server = 'https://thomasscully.com';
    $http.defaults.headers.common = {
        'secret-token': 'aBcDeFgHiJkReturnOfTheSixToken666666',
        'Accept': "application/json, text/plain, */*"
    };

    $scope.addSongToJukebox = function(songId) {
        var buttonClicked = $("#increaseButtonInner_" + songId);
        buttonClicked.html('<img src="img/default.gif" height="9px" width="9px" />');
        buttonClicked.addClass('disabled');
        var data = {
            "action": "in",
            "id": songId
        };
        $http.put(server + '/toggle/song', data).success(function(response) {
            $("#increaseButton_" + songId).html('<br><button disabled type="button" id="increaseButton_{{song.id}}" class="btn btn-warning">+</button>');
        }).error(function (response) {
            console.log(response);
        });
    }

    var getSongsCallbackSuccess = function(response) {
        $(".spinner").hide();
        if (response.data.songs.length > 0) {
            $scope.songs = response.data.songs; 
        } else {
            $("#no-songs-message").removeClass('hide');
        }
        
    }

    var errorCallback = function(response) {
        console.log("Error:");
        console.log(response);
    }

    var init = function() {
        $(".spinner").removeClass('hide');
        if ($cookieStore.get('isConnectedToPlaylist') == undefined || !$cookieStore.get('isConnectedToPlaylist')) {
            window.location = "#/findhost"
        } else {
            $http.get(server + '/songs?user_account_id=' + $cookieStore.get('connectPlaylistUserId')).then(getSongsCallbackSuccess, errorCallback);
        }
    }
    init();
}
