/**
 * Manage Jukebox Controller
 */

angular.module('Songs').controller('ManageJukeboxCtrl', ['$scope', '$http', '$cookieStore', ManageJukeboxCtrl]);

function ManageJukeboxCtrl($scope, $http, $cookieStore) {
    var server = 'http://thomasscully.com';

    $scope.cancel = function() {
        window.location = "#/host";
    }

    $scope.saveChanges = function() {

    }

    var inputTypeFile = document.getElementById('fileinput');

    inputTypeFile.addEventListener("change", function(event) {
        for(i = 0; i < event.target.files.length; i++) {
            var file = event.target.files[i];
            jsmediatags.read(file, {
                onSuccess: function(tag) {
                    var audio = document.getElementById('song');
                    var fileURL = URL.createObjectURL(file);
                    audio.src = fileURL;
                    audio.load();
                    audio.addEventListener('loadedmetadata', function(){
                        var song = {"title": tag.tags.title, "artist": tag.tags.artist, "album": tag.tags.album, "duration": audio.duration};
                        /*

                         code to add 'song' to a JSON file or the Database

                         */
                        console.log(song);
                        alert(song.title + "," + song.artist + "," + song.album + "," + (song.duration / 60) + ":" + (song.duration % 60));
                    });
                },
                onError: function(error) {
                    alert(error);
                    console.log(error);
                }
            });
        }
    }, false);
}