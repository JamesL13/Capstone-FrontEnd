/**
 * Created by jtumi on 4/19/2016.
 */
angular.module('Songs').service('searchApp',['$rootScope','$location', '$http', searchApp]);


function searchApp ($rootScope, $location, $http) {
    var server = 'https://thomasscully.com';
    $http.defaults.headers.common = {
        'secret-token': 'aBcDeFgHiJkReturnOfTheSixToken666666',
        'Accept': "application/json, text/plain, */*"
    };
    var songs = [];
    var hosts = [];

    var getSongsCallbackSuccess = function (response) {
        if (response.data.songs.length > 0) {
            songs = [];
            response.data.songs.forEach(function (index){
                if(index.song_title.search($rootScope.searchFor) > -1) {
                        songs.push(index);
                } else {
                    console.log("Song is not going to be returned");
                }
            });
        } else {
            //DO NOTHING
        }
        $rootScope.$broadcast("searchAttempted", { myParam: $rootScope.songs});
    };

        var errorCallback = function(response) {
            console.log("Error:");
            console.log(response);
        };

        var getPlaylistSuccessCallback = function (response) {
            console.log(response);
            if (response.data.length > 0) {
                hosts = [];
                response.data.forEach(function (index) {
                    if(index.playlist_name.search($rootScope.searchFor) > -1) {
                        hosts.push(index);
                    } else {
                        console.log("Host is not going to be returned");
                    }
                });
            } else {
                //Do Nothing
            }
            $rootScope.$broadcast("hostSearchAttempted", { myParam: $rootScope.songs});
        };

    return {
        findWhatToSearch: function (id, searchee) {
            $rootScope.searchFor = searchee;
            var url = $location.absUrl();
            //console.log(url.search("library"));
            if (url.search("library") > -1 || url.search("jukebox") > -1) {
                $http.get(server + '/songs?user_account_id=' + id).then(getSongsCallbackSuccess, errorCallback);
            }
            else if (url.search("findhost")) {
                /*$http.get(server + '/playlists').success(function(jukebox) {
                    $scope.jukeboxes = jukebox;
                    $(".spinner").addClass('hide');
                }).then(getPlaylistSuccessCallback, errorCallback);
            };*/
                $http.get(server + '/playlists').then(getPlaylistSuccessCallback, errorCallback);
            }
            else {
                alert("Hi");
            }
        },

        getAllSongs: function () {
            return songs;
        },

        getAllJukeboxes: function () {
            return hosts;
        }
    }
};