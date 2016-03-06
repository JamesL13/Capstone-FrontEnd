/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package songsapplet;

import javafx.application.Application;
import javafx.event.*;
import javafx.scene.*;
import javafx.stage.Stage;

import com.google.gson.*;
import com.mpatric.mp3agic.*;
import java.io.*;
import java.net.*;
import java.nio.charset.Charset;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import javafx.collections.*;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.scene.media.*;
import javafx.stage.FileChooser;
import javax.net.ssl.HttpsURLConnection;

/**
 *
 * @author garrettknox
 */
public class SongsApplet extends Application {
    
    @Override
    public void start(Stage primaryStage) throws Exception {

        List<File> uploadedFiles = new ArrayList<File>();
        JsonArray uploadedSongs = new JsonArray();
        Songs getSongs = new Songs(null);
        
        /* Creates the Elements of the Applet */
        BorderPane root = new BorderPane();  
        StackPane titleList = new StackPane();
        ToolBar tools = new ToolBar();
        ToolBar jukebox = new ToolBar();
        
        /* Buttons of Applet */
        Button upload = new Button("Upload Songs");
        Button play = new Button("Start");
        Button pause = new Button("Pause");
        Button stop = new Button("Stop");
        play.setDisable(true);

        
        /* File Chooser of Applet */
        FileChooser uploadSongs = new FileChooser();
        
        /* ListView of Applet */
        ListView<String> songTitles = null;
                       
        showAllSongs(songTitles, titleList);
        
        /* Event Handlers for Button Presses */
        /* Open File Chooser, create Json Array from files, POST Json Array to the Database */
        upload.setOnAction(new EventHandler<ActionEvent> () {
            @Override
            public void handle(ActionEvent event) {
                try {
                    upload(primaryStage, uploadSongs, uploadedFiles, uploadedSongs, songTitles, titleList);
                } catch (IOException ex) {
                    Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, ex);
                } catch (UnsupportedTagException ex) {
                    Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, ex);
                } catch (InvalidDataException ex) {
                    Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, ex);
                } catch (Exception ex) {
                    Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, ex);
                }
            }
        });
        
        play.setMinWidth(60);
        pause.setMinWidth(60);
        stop.setMinWidth(60);
        tools.getItems().addAll(upload);
        jukebox.getItems().addAll(play, pause, stop);
        root.setTop(tools);
        root.setBottom(jukebox);
        root.setCenter(titleList);
        Scene scene = new Scene(root, 700, 500);
        primaryStage.setTitle("Song[s]");
        primaryStage.setScene(scene);
        primaryStage.show();
    }

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        launch(args);
    }
    
    /* Function that creates a Media object from an absolute path */
    private static Media createMedia(String songLocation)
    {
        File file = new File(songLocation);
        Media media = new Media(file.toURI().toString());
        return media;
    }
    
    private static void checkSongList (Button button, ListView list) throws Exception
    {
        if(list.isVisible())
        {
            list.setVisible(false);
            button.setText("Show All Songs");
        }
        else
        {
            list.setVisible(true);
            button.setText("Hide Songs");
        }   
    }
    
    /* Function which sends a GET Request to the Database */
    /* Return: A Song Object Array of all songs currently in the database */
    private static Song[] getSongsFromDB(int user_account_id) throws MalformedURLException 
    {
        try {
            String server = "https://thomasscully.com/songs?user_account_id=" + user_account_id;
            URL url = new URL(server);
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            // optional default is GET
            con.setRequestMethod("GET");
            
            //add request header
            con.setRequestProperty("secret-token", "aBcDeFgHiJkReturnOfTheSixToken666666");
            con.setRequestProperty("Content-Type", "application/json");
            
            BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
            String inputLine;
            StringBuffer jsonString = new StringBuffer();
            
            while ((inputLine = in.readLine()) != null) {
                jsonString.append(inputLine);
            }
            in.close();
            
            //print result
            Gson gson = new Gson();
            Songs songs = gson.fromJson(jsonString.toString(), Songs.class);
            return songs.getSongs();
            
        } catch (IOException ex) {
            Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, ex);
            return null;
        }
    }
    
    /* Function that creates a ListView of song titles */
    /* Return: A ListView of all Song Titles currently in the Database */
    private static ListView createListView(int user_account_id) throws Exception
    {
        Song[] songs = getSongsFromDB(user_account_id); //Get the most up to date list of songs
        ListView<String> songTitles = new ListView<>();
                
        ObservableList<String> items = FXCollections.observableArrayList();
        for(Song song : songs)
        {
            items.add(song.getTitle());
        }
    
        songTitles.setItems(items);
        return songTitles;
    }
    
    /* Function which sends a POST Request with a JSON Post Body to the Database */
    /* Return: None */
    private static void postSongsToDB(JsonArray array) throws IOException
    {
        /* Create the POST Body for the POST Request */
        JsonObject postBody = new JsonObject();
        postBody.addProperty("user_account_id",32);
        postBody.addProperty("number_of_songs",array.size());
        postBody.add("songs", array);
        
        /* Write the POST Body to the POST Request */
        InputStream inputStream = new ByteArrayInputStream(postBody.toString().getBytes());
        InputStreamReader inputStreamReader = new InputStreamReader(inputStream);
	BufferedReader br = new BufferedReader(inputStreamReader);
	String jsonLine;
        String json = "";
	while ((jsonLine = br.readLine()) != null) {
            json += jsonLine + "\n";
	}
        System.out.println("JSON read from file:");
        System.out.println(json);  // print the json to output to see it was read correctly
        
        /* Make Connection with server and send POST Request to the database */
        URL url;
        try {
            url = new URL("https://thomasscully.com/songs");
        } catch (MalformedURLException mex) {
            System.out.println("The URL is malformed: " + mex.getMessage());
            return;
        }
        
        try {
            URLConnection conn = url.openConnection();
            conn.setDoOutput(true);
            conn.setRequestProperty("secret-token", "aBcDeFgHiJkReturnOfTheSixToken666666");
            conn.setRequestProperty("Content-Type", "application/json");
            OutputStreamWriter writer = new OutputStreamWriter(conn.getOutputStream());

            writer.write(json);
            writer.flush();
            
            System.out.println("JSON returned from server after request:");
            
            String line;
            BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
            writer.close();
            reader.close();
        } catch (IOException ex) {
            System.out.println("IO error: " + ex.getMessage());
        }
    }
    
    /* Function which creates a JSON Object Array from a list of Files */
    /* Specifically each JSON Object holds metadata of selected songs */ 
    private static void createJsonObject (List<File> files, JsonArray array) throws IOException, UnsupportedTagException, InvalidDataException
    {
        for(File file : files)
        {
            Mp3File mp3File = new Mp3File(file.getAbsolutePath());
            JsonObject object = new JsonObject();
            if(mp3File.hasId3v1Tag() == true)
            {
                object.addProperty("song_title", mp3File.getId3v1Tag().getTitle());
                object.addProperty("song_artist", mp3File.getId3v1Tag().getArtist());
                object.addProperty("song_length", mp3File.getLengthInSeconds());
                object.addProperty("song_album", mp3File.getId3v1Tag().getAlbum());
                object.addProperty("location_in_filesystem", file.getAbsolutePath());
            }
            else
            {
                object.addProperty("song_title", mp3File.getId3v2Tag().getTitle());
                object.addProperty("song_artist", mp3File.getId3v2Tag().getArtist());
                object.addProperty("song_length", mp3File.getLengthInSeconds());
                object.addProperty("song_album", mp3File.getId3v2Tag().getAlbum());
                object.addProperty("location_in_filesystem", file.getAbsolutePath());
            }
            array.add(object);
        }
        postSongsToDB(array);
    }
    
    /* Function called when the Show All Songs Button is clicked */
    private static void showAllSongs(ListView<String> songTitles, StackPane titleList) throws Exception
    {
        songTitles = createListView(32);
        titleList.getChildren().add(songTitles);
    }
    
    /* Function called when the Upload Button is clicked */
    private static void upload(Stage stage, FileChooser uploadSongs, List<File> uploadedFiles, JsonArray uploadedSongs, ListView<String> songTitles, StackPane titleList) throws IOException, UnsupportedTagException, InvalidDataException, Exception
    {
        /* Clear All to avoid duplicate Uploads */
        uploadedFiles = new ArrayList<File>();
        uploadedSongs = new JsonArray();
        
        /* Open File Chooser, POST the files that are selected, Display an updated list of Song Titles */
        uploadedFiles = uploadSongs.showOpenMultipleDialog(stage);
        createJsonObject(uploadedFiles, uploadedSongs);
        showAllSongs(songTitles, titleList);
    }
}

