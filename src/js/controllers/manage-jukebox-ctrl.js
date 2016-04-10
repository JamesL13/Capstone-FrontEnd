/**
 * Manage Jukebox Controller
 */

angular.module('Songs').controller('ManageJukeboxCtrl', ['$scope', '$http', '$cookieStore', ManageJukeboxCtrl]);

function ManageJukeboxCtrl($scope, $http, $cookieStore) {
    var server = 'https://thomasscully.com';
    $http.defaults.headers.common = {
        'secret-token': 'aBcDeFgHiJkReturnOfTheSixToken666666',
        'Accept': "application/json, text/plain, */*"
    };

    $scope.cancel = function() {
        window.location = "#/host";
    }

    $scope.saveChanges = function() {

    }

    /*
     Arrays/variables used to store and create the final JSON Object of uploaded songs
     */
    var files = [];
    var song_titles = [];
    var song_artists = [];
    var song_albums = [];
    var song_lengths = [];
    var song_locations = [];
    var songs = [];
    var loadedFlags = [];

    /*
        Function to reset the arrays/variables used in the uploading process
     */
    var resetData = function() {
        song_titles = [];
        song_artists = [];
        song_albums = [];
        song_lengths = [];
        song_locations = [];
        songs = [];
    };

    /*
        Function trigger onclick which initiates the reading of the files and creation of JSON object
     */
    $scope.upload = function() {
        document.getElementById('upload').disabled = true;
        resetData();
        createAudio();
    };

    /*
        Functions that loads all files into audio elements and begins extracting data
        and ultimately turn that extracted data into the JSON object to be sent to the
        database
     */
    var createAudio = function() {
        for (i = 0; i < files.length; i++) {
            var audio = document.createElement('audio');
            audio.setAttribute('id', i);
            var location = URL.createObjectURL(files[i]);
            song_locations[i] = location;
            audio.setAttribute('src', location);
            audio.load();
            audio.oncanplaythrough = function() {
                song_lengths[this.id] = this.duration;
                createSongsMetadata(this.id, createJSON);
            }
        }
    };
    var createSongsMetadata = function(id, callback) {
        var file = files[id];
        new jsmediatags.Reader(file).setTagsToRead(["title", "album", "artist"]).read({
            onSuccess: function(tag) {
                song_titles[id] = tag.tags.title;
                song_artists[id] = tag.tags.artist;
                song_albums[id] = tag.tags.album;
                callback(id);
            },
            onError: function(error) {
                console.log(error);
            }
        });
    };
    var createJSON = function(id) {
        songs.push({ "song_title": song_titles[id], "song_artist": song_artists[id], "song_album": song_albums[id], "song_length": song_lengths[id], "location_in_filesystem": song_locations[id] });
        loadedFlags[id] = true;
        checkFlags();
        if (checkFlags()) {
            pushSongs();
        }
    };

    /*
        function that pushes the final JSON object to the database
     */
    var pushSongs = function() {
        var uploadObject = { "user_account_id": 2, "number_of_songs": songs.length, "songs": songs };
        $http.post(server + '/songs', uploadObject).then(successCallback, errorCallback);
        document.getElementById('fileinput').value = "";
        files = [];
    };

    /*
        Function that checks the flags of the songs to determine when all songs have been successfully uploaded
     */
    var checkFlags = function() {
        for (i = 0; i < loadedFlags.length; i++) {
            if (!loadedFlags[i]) {
                return false;
            }
        }
        return true;
    };

    /*
        Callback functions for a success or error from a post to the songs database
     */
    successCallback = function(response) {
    }
    errorCallback = function(error) {
        console.dir(error);
    }

    /*
        Triggers whenever new files are selected with the input type file
     */
    var inputTypeFile = document.getElementById('fileinput');
    inputTypeFile.addEventListener("change", function(event) {
        files = [];
        loadedFlags = [];
        for (i = 0; i < event.target.files.length; i++) {
            var file = event.target.files[i];
            files.push(file);
            loadedFlags[i] = false;
        }
        document.getElementById('upload').disabled = false;
    }, false);
}
