/**
 * Jukebox Controller
 */
var app = angular.module( "Songs");
app.controller('JukeboxCtrl', ['$scope', '$http', '$cookieStore', '$timeout', JukeboxCtrl]);

function JukeboxCtrl($scope, $http, $cookieStore, $timeout) {
    var server = 'https://thomasscully.com';
    $http.defaults.headers.common = {
        'secret-token': 'aBcDeFgHiJkReturnOfTheSixToken666666',
        'Accept': "application/json, text/plain, */*"
    };
    var hostId = $cookieStore.get('hostid');
    $scope.businessName;
    $scope.playlistName;

    $scope.upvote = function (songId) {
        var songsArray = $cookieStore.get('haveVotedSongs');
        songsArray.push(songId);
        $cookieStore.put('haveVotedSongs', songsArray);
        disableVotedSongs();

        var data = {
            "action": "up",
            "id": songId
        };
        $http.put(server + '/toggle/song/vote', data).success(function(response) {
            var voteBlock = $('#songVoteCount_' + songId);
            var temp = voteBlock.html();
            temp++;
            voteBlock.html(temp);
        }).error(function (response) {
            console.log(response);
        });
    }

    $scope.downvote = function(songId) {
        var songsArray = $cookieStore.get('haveVotedSongs');
        songsArray.push(songId);
        $cookieStore.put('haveVotedSongs', songsArray);
        disableVotedSongs();

        var data = {
            "action": "down",
            "id": songId
        };
        $http.put(server + '/toggle/song/vote', data).success(function(response) {
            var voteBlock = $('#songVoteCount_' + songId);
            var temp = voteBlock.html();
            temp--;
            voteBlock.html(temp);
        }).error(function (response) {
            console.log(response);
        });
    }

    var disableVotedSongs = function () {
        var songsArray = $cookieStore.get('haveVotedSongs');
        for (var i = 0; i < songsArray.length; i++) {

            $('#hasNotVoted_' + songsArray[i]).addClass('hide');
            $('#hasVoted_' + songsArray[i]).removeClass('hide');
        }
        $(".spinner").hide();
        $("#songList").removeClass('hide');
    }

    var getSongsCallbackSuccess = function(response) {
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
        if ($cookieStore.get('isConnectedToPlaylist') == undefined || !$cookieStore.get('isConnectedToPlaylist')) {
            window.location = "#/findhost"
        }

        if ($cookieStore.get('haveVotedSongs') == undefined || !$cookieStore.get('haveVotedSongs')) {
            $scope.hasVoted = [];
            $cookieStore.put('haveVotedSongs', $scope.hasVoted);
        }

        $http.get(server + '/accounts?' + "account__id=" + hostId).success(function(name) {
            $scope.businessName = name[0];
        }).then(successCallback, errorCallback);
        $http.get(server + '/playlists?'+ "account__id=" + hostId).success(function(name) {
            $scope.playlistName = name[0];
        }).then(successCallback, errorCallback);
        $scope.getFreshSongs();
    }
    $scope.getFreshSongs = function () {
        $http.get(server + '/songs/active?user_account_id=' + $cookieStore.get('connectPlaylistUserId')).then(getSongsCallbackSuccess, errorCallback);
        $(".spinner").show();
        $("#songList").addClass('hide');
        setTimeout(disableVotedSongs, 1500);
    }
    var errorCallback = function (response) {
        console.log("failure");
        console.log(response);
    }

    var successCallback = function (response) {
    }

    init();
}