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

    /*
     Arrays/variables used to store and create the final JSON Object of uploaded songs
     */
    var files = [];
    var fileDurations = [];
    var fileTitles = [];
    var fileAlbums = [];
    var fileArtists = [];
    var songs = [];
    var loadedFlags = [];

    /*
        Function to reset the arrays/variables used in the uploading process
     */
    var resetData = function() {
        fileDurations = [];
        fileTitles = [];
        fileAlbums = [];
        fileArtists = [];
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
        for(i = 0; i < files.length; i++)
        {
            var audio = document.createElement('audio');
            audio.setAttribute('id', i);
            audio.setAttribute('src', URL.createObjectURL(files[i]));
            audio.load();
            audio.oncanplaythrough = function() {
                fileDurations[this.id] = this.duration;
                createSongsMetadata(this.id, createJSON);
            }
        }
    };
    var createSongsMetadata = function(id, callback) {
        var file = files[id];
        new jsmediatags.Reader(file).setTagsToRead(["title", "album", "artist"]).read({
            onSuccess: function(tag) {
                fileTitles[id] = tag.tags.title;
                fileAlbums[id] = tag.tags.album;
                fileArtists[id] = tag.tags.artist;
                callback(id);
            },
            onError: function(error) {
                console.log(error);
            }
        });
    };
    var createJSON = function(id) {
        /*
            Replace this with a push of JSON object to the database
         */
        songs[id] = {"title":fileTitles[id],"atrist":fileArtists[id],"album":fileAlbums[id],"duration":fileDurations[id]};
        loadedFlags[id] = true;
        checkFlags();
        if(checkFlags())
        {
            pushSongs();
        }
    };

    /*
        function that pushes the final JSON object to the database
     */
    var pushSongs = function() {
        /*
         Replace console.log with a push of songs object to the database
         */
        console.log(songs);
        document.getElementById('fileinput').value = "";
        files = [];
        document.getElementById('upload').disabled = false;
    };

    /*
        Function that checks the flags of the songs to determine when all songs have been successfully uploaded
     */
    var checkFlags = function () {
        for(i = 0; i < loadedFlags.length; i++)
        {
            if(!loadedFlags[i])
            {
                return false;
            }
        }
        return true;
    };

    /*
        Triggers whenever new files are selected with the input type file
     */
    var inputTypeFile = document.getElementById('fileinput');
    inputTypeFile.addEventListener("change", function(event) {
        files = [];
        loadedFlags = [];
        var fileURL;
        for(i = 0; i < event.target.files.length; i++)
        {
            var file = event.target.files[i];
            files.push(file);
            loadedFlags[i] = false;
        }
        document.getElementById('upload').disabled = false;
    }, false);
}