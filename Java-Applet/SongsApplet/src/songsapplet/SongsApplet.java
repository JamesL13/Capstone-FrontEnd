/*
 * Project: Song[s] Desktop Application
 * Description: A Desktop Application to be used by Host Users for the Song[s] web app created for Capstone 1 & 2
 * at the University of Missouri during Fall of 2015 and Spring of 2016.
 * Created: March 2016
 * Author: Garrett Knox
 * Contributors: James Landy, Devin Clark, George Gilmartin, Thomas Scully, Travis Henrichs
 */
package songsapplet;

import javafx.application.Application;
import javafx.event.*;
import javafx.scene.*;
import javafx.stage.Stage;

import com.google.gson.*;
import com.mpatric.mp3agic.*;
import java.awt.Desktop;
import java.io.*;
import java.net.*;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import javafx.application.Platform;
import javafx.beans.value.*;
import javafx.collections.*;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.control.ButtonBar.ButtonData;
import javafx.scene.layout.*;
import javafx.scene.media.*;
import javafx.stage.FileChooser;
import javafx.util.Pair;
import javafx.scene.Scene;
import javafx.scene.control.Alert.AlertType;
import javafx.stage.WindowEvent;

public class SongsApplet extends Application {
    
    /* User Account ID of Applet */
    int user_account_id;
    
    /* Jukebox Object of Applet */
    Jukebox currentJukebox;
    
    /* Jukebox Active Flag of Applet */
    boolean jukeboxActive;
    
    /* Media Player of Applet */
    MediaPlayer jukebox;
    
    /* Current Song of Applet */
    Media currentSong;
    Song playingSong;
    
    /* ListView of Applet */
    ListView<String> songTitles = new ListView<>();
    
    /* File Chooser of Applet */
    FileChooser uploadSongs = new FileChooser();
    
    /* List of Files Uploaded */
    List<File> uploadedFiles = new ArrayList<File>();
    
    /* Json Array of Songs Uploaded */
    JsonArray uploadedSongs = new JsonArray();
    
    /* Songs of Applet */
    Songs getSongs = new Songs(null);
    
    /* List of Files Not Found */
    List<String> filesNotFound = new ArrayList<String>();
    
    /* Labels of Applet */
    Label nowPlaying = new Label("Now Playing: ");
    
    /* Buttons of Applet */
    Button upload = new Button("Upload Songs");
    Button stop = new Button("Start Jukebox");
    Button deleteSong = new Button ("Remove Song");
    Button play = new Button("Play");
    Button pause = new Button("Pause");
    Button hostManagement = new Button("Manage Account");
    
    @Override
    public void start(Stage primaryStage) throws Exception {
        
        /* Jukebox is in active upon start of Applet */
        jukeboxActive = false;
        play.setDisable(true);
        pause.setDisable(true);
        deleteSong.setDisable(true);
        
        /* Creates the Elements of the Applet */
        BorderPane root = new BorderPane();  
        StackPane titleList = new StackPane();
        ToolBar hostTools = new ToolBar();
        ToolBar jukeboxTools = new ToolBar();
                
        /* Login */
        /* Create the custom dialog. */
        Dialog<Pair<String, String>> dialog = new Dialog<>();
        dialog.setTitle("Song[s] Login");
        dialog.setHeaderText("Please Login to access your library");

        /* Set the button types. */
        ButtonType loginButtonType = new ButtonType("Login", ButtonData.OK_DONE);
        ButtonType cancelButtonType = new ButtonType("Cancel", ButtonData.CANCEL_CLOSE);
        dialog.getDialogPane().getButtonTypes().addAll(loginButtonType, cancelButtonType);

        /* Create the username and password labels and fields. */
        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);
        grid.setPadding(new Insets(20, 150, 10, 10));

        TextField userEmail = new TextField();
        userEmail.setPromptText("User Email");
        PasswordField password = new PasswordField();
        password.setPromptText("Password");

        grid.add(new Label("User Email:"), 0, 0);
        grid.add(userEmail, 1, 0);
        grid.add(new Label("Password:"), 0, 1);
        grid.add(password, 1, 1);

        /* Enable/Disable login button depending on whether a username was entered. */
        Node loginButton = dialog.getDialogPane().lookupButton(loginButtonType);
        loginButton.setDisable(true);

        /* Do some validation (using the Java 8 lambda syntax). */
        userEmail.textProperty().addListener((observable, oldValue, newValue) -> {
            loginButton.setDisable(newValue.trim().isEmpty());
        });

        dialog.getDialogPane().setContent(grid);

        /* Request focus on the username field by default. */
        Platform.runLater(() -> userEmail.requestFocus());

        /* Convert the result to a username-password-pair when the login button is clicked. */
        dialog.setResultConverter(dialogButton -> {
            if (dialogButton == loginButtonType) 
            {
                return new Pair<>(userEmail.getText(), password.getText());
            }
            return null;
        });

        Optional<Pair<String, String>> result = dialog.showAndWait();

        /* Gather the user_email and user_password */
        String user_email = null;
        String user_password = null;
        
        /* Catches a No Such Element Exception that is thrown on the Cancel Button being clicked */
        try {
            user_email = result.get().getKey();
            user_password = result.get().getValue();
        }
        catch (NoSuchElementException e)
        {   
            /* Terminates the Start method on the Cancel Button being clicked */
            return;
        }
        
        /* Authenticate the user login attempt */
        boolean loggedIn = authenticateLogin(user_email, user_password);
        while(loggedIn == false)
        {
            /* Creates an Alert upon a invalid Login attempt */
            dialog.setHeaderText("Invalid Login Credentials. Try Again.");
            Alert failedLogin = new Alert(AlertType.WARNING, "Click 'OK' to try again");
            failedLogin.setTitle("Invalid Login");
            failedLogin.setHeaderText("Invalid Login!");
            Optional<ButtonType> failedResults = failedLogin.showAndWait();
            if(failedResults.isPresent() && failedResults.get() == ButtonType.OK)
            {
                result = dialog.showAndWait();
                /* Catches a No Such Element Exception that is thrown on the Cancel Button being clicked */
                try {
                    user_email = result.get().getKey();
                    user_password = result.get().getValue();
                }
                catch (NoSuchElementException e)
                {   
                    /* Terminates the Start method on the Cancel Button being clicked */
                    return;
                }
                loggedIn = authenticateLogin(user_email, user_password);
            }
        }
        
        /* On Start Functions */        
        showAllSongs(titleList);
        songTitles.getSelectionModel().setSelectionMode(SelectionMode.MULTIPLE);
        getJukeboxFromDB();
        toggleJukeboxOnDB("stop");
                
        /* Event Handlers for Button Presses */
        /* Prompt an alert, on confirmation DELETE song from Database, update the ListView */           
        songTitles.getSelectionModel().selectedIndexProperty().addListener((ObservableValue<? extends Number> ov, Number old_val, Number new_val) -> {
            ObservableList<String> selectedSongs = songTitles.getSelectionModel().getSelectedItems();
            deleteSong.setDisable(false);
            deleteSong.setOnAction(new EventHandler<ActionEvent>() {
                @Override
                public void handle(ActionEvent event)
                {
                    if(selectedSongs.size() == 1)
                    {
                        Alert alert = new Alert(AlertType.CONFIRMATION, "Are you sure you want to delete the following song?");
                        alert.setTitle("Delete Song");
                        alert.setHeaderText("Delete '" + getSongs.getSongs()[new_val.intValue()].getTitle() + "'?");
                        Optional<ButtonType> deleteResult = alert.showAndWait();
                        if (deleteResult.isPresent() && deleteResult.get() == ButtonType.OK) {
                            try {
                                delete(new_val.intValue());
                            } catch (Exception ex) {
                                Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, ex);
                            }
                        }
                    }
                    else if(selectedSongs.size() > 1)
                    {
                        Alert alert = new Alert(AlertType.CONFIRMATION);
                        alert.setTitle("Delete Songs");
                        alert.setHeaderText("Delete Multiple Songs?");
                        alert.setContentText("Are you sure you want to delete the following songs?");

                        TextArea textArea = new TextArea();
                        selectedSongs.stream().forEach((file) -> {
                            textArea.appendText(file + "\n");
                        });
                        textArea.setEditable(false);
                        textArea.setWrapText(true);

                        textArea.setMaxWidth(Double.MAX_VALUE);
                        textArea.setMaxHeight(Double.MAX_VALUE);
                        GridPane.setVgrow(textArea, Priority.ALWAYS);
                        GridPane.setHgrow(textArea, Priority.ALWAYS);

                        GridPane selectedSongsList = new GridPane();
                        selectedSongsList.setMaxWidth(Double.MAX_VALUE);
                        selectedSongsList.add(textArea, 0, 1);

                        alert.getDialogPane().setExpandableContent(selectedSongsList);
                        alert.getDialogPane().setExpanded(true);

                        Optional<ButtonType> deleteResult = alert.showAndWait();
                        if (deleteResult.isPresent() && deleteResult.get() == ButtonType.OK) {
                            try {
                                multipleDelete(selectedSongs);
                            } catch (Exception ex) {
                                Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, ex);
                            }
                        }
                    }
                }
            });
        });
        
        /* Open File Chooser, create Json Array from files, POST Json Array to the Database */
        upload.setOnAction(new EventHandler<ActionEvent>() {
            @Override
            public void handle(ActionEvent event) {
                try {
                    upload(primaryStage, titleList);
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
        
        hostManagement.setOnAction(new EventHandler<ActionEvent>() {
            @Override
            public void handle(ActionEvent event) {
                try {
                    Desktop.getDesktop().browse(new URI("http://localhost:8888/#/manageaccount"));
                } catch (IOException e1) {
                    e1.printStackTrace();
                } catch (URISyntaxException e1) {
                    e1.printStackTrace();
                }
            }
        });
        
        play.setOnAction(new EventHandler<ActionEvent>() {
            @Override
            public void handle(ActionEvent event) {
                playSong();
                pause.setDisable(false);
                play.setDisable(true);
            }
        });
        
        pause.setOnAction(new EventHandler<ActionEvent>() {
            @Override
            public void handle(ActionEvent event) {
                pauseSong();
                pause.setDisable(true);
                play.setDisable(false);
            }
        });
        
        stop.setOnAction(new EventHandler<ActionEvent>() {
            @Override
            public void handle(ActionEvent event) {
                try {
                    startStopJukebox();
                } catch (MalformedURLException ex) {
                    Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, ex);
                } catch (IOException ex) {
                    Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, ex);
                }
            }
        });
        
        primaryStage.setOnCloseRequest(new EventHandler<WindowEvent>() {
            @Override
            public void handle(WindowEvent event) {
                Alert alert = new Alert(AlertType.CONFIRMATION, "Are you sure you want to exit the applet?");
                alert.setTitle("Exit");
                alert.setHeaderText("Exit Applet?");
                Optional<ButtonType> exitResult = alert.showAndWait();
                if (exitResult.isPresent() && exitResult.get() == ButtonType.OK) {
                    try {
                        toggleJukeboxOnDB("stop");
                        toggleAllSongsOnDB("out");
                    } catch (Exception ex) {
                        Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, ex);
                    }
                }
                else
                {
                    event.consume();
                }
            }
        });
        
        play.setMinWidth(60);
        pause.setMinWidth(60);
        stop.setMinWidth(60);
        deleteSong.setMinWidth(60);
        hostTools.getItems().addAll(upload, stop, deleteSong, hostManagement);
        jukeboxTools.getItems().addAll(play, pause, nowPlaying);
        root.setTop(hostTools);
        root.setBottom(jukeboxTools);
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
    
    /* Function to make a DELETE request to the server */
    private boolean deleteSongFromDB(int song_id)
    {
        /* Make Connection with server and send DELETE Request to the database */
        try {
            String server = "https://thomasscully.com/songs?id=" + song_id;
            URL url = new URL(server);
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            
            //Set Request Method
            con.setRequestMethod("DELETE");
            
            //Add Request Header
            con.setRequestProperty("secret-token", "aBcDeFgHiJkReturnOfTheSixToken666666");
            con.setRequestProperty("Content-Type", "application/json");
            
            //Read the Request Response
            BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
            String inputLine;
            StringBuffer jsonString = new StringBuffer();
            
            while ((inputLine = in.readLine()) != null) {
                jsonString.append(inputLine);
            }
            in.close();
            
        } catch (IOException ex) {
            /* Deletion Failed */
            Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, ex);
            return false;
        }
        return true;
    }
    
    /* Function to authenticate a user login with the backend */
    /* Return: A boolean that represents a successful/failed login */
    private boolean authenticateLogin(String user_email, String password) throws IOException 
    {
        /* Create the POST Body for the POST Request */
        JsonObject postBody = new JsonObject();
        postBody.addProperty("user_email",user_email);
        postBody.addProperty("password",password);
                
        /* Write the POST Body to the POST Request */
        InputStream inputStream = new ByteArrayInputStream(postBody.toString().getBytes());
        InputStreamReader inputStreamReader = new InputStreamReader(inputStream);
	BufferedReader br = new BufferedReader(inputStreamReader);
	String jsonLine;
        String json = "";
	while ((jsonLine = br.readLine()) != null) {
            json += jsonLine + "\n";
	}
        
        /* Make Connection with server and send POST Request to the database */
        URL url;
        try {
            url = new URL("https://thomasscully.com/accounts/login");
        } catch (MalformedURLException mex) {
            /*Malformed URL */
            Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, mex);
            return false;
        }
        
        try {
            URLConnection conn = url.openConnection();
            conn.setDoOutput(true);
            conn.setRequestProperty("secret-token", "aBcDeFgHiJkReturnOfTheSixToken666666");
            conn.setRequestProperty("Content-Type", "application/json");
            OutputStreamWriter writer = new OutputStreamWriter(conn.getOutputStream());

            writer.write(json);
            writer.flush();
            
            /* JSON returned from the server after the request */
            String line;
            BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            while ((line = reader.readLine()) != null) {
                if(!line.equals("false"))
                {
                    user_account_id = Integer.parseInt(line);
                    return true;
                }
                else
                {
                    /* Login Failed */
                    return false;
                }
            }
            writer.close();
            reader.close();
        } catch (IOException ex) {
            Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, ex);
            return false;
        }     
        return false;
    }
    
    /* Function that creates a Media object from an absolute path */
    private Media createMedia(String songLocation)
    {
        File file = new File(songLocation);
        Media media = new Media(file.toURI().toString());
        return media;
    }
    
    private void playSong()
    {
        jukebox.play();
    }
    
    private void pauseSong()
    {
        jukebox.pause();
    }
    
    private void startStopJukebox() throws MalformedURLException, IOException
    {
        if(jukeboxActive == true)
        {
            Alert alert = new Alert(AlertType.CONFIRMATION, "Are you sure you want to stop your Jukebox?");
            alert.setTitle("Stop Jukebox");
            alert.setHeaderText("Stop Jukebox?");
            Optional<ButtonType> stopResult = alert.showAndWait();
            if (stopResult.isPresent() && stopResult.get() == ButtonType.OK) {
                try {
                    toggleJukeboxOnDB("stop");
                    toggleAllSongsOnDB("out");
                    jukebox.stop();
                    jukeboxActive = false;
                    songTitles.setDisable(false);
                    deleteSong.setDisable(false);
                    hostManagement.setDisable(false);
                    upload.setDisable(false);
                    play.setDisable(true);
                    pause.setDisable(true);
                    stop.setText("Start Jukebox");
                    nowPlaying.setText("Now Playing:");
                } catch (Exception ex) {
                    Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, ex);
                }
            }
        }
        else
        {
            if(getSongs.getSongs().length == 0)
            {
                Alert alert = new Alert(AlertType.INFORMATION);
                alert.setTitle("Empty Library");
                alert.setHeaderText("No Songs In Your Library!");
                alert.setContentText("You can not start a Jukebox without songs in your library. Upload songs to begin playing music.");
                alert.showAndWait();
            }
            else if(validateFileLocations())
            {
                try {
                    play();
                    toggleJukeboxOnDB("start");
                    songTitles.setDisable(true);
                    deleteSong.setDisable(true);
                    upload.setDisable(true);
                    hostManagement.setDisable(true);
                    pause.setDisable(false);
                    stop.setText("Stop Jukebox");
                    jukeboxActive = true;
                }
                catch (Exception e) {
                    Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, e);
                }
            }
            else
            {
                Alert alert = new Alert(AlertType.ERROR);
                alert.setTitle("Files Not Found");
                alert.setHeaderText("Files Not Found");
                alert.setContentText("View details to see which files could not be found. Either delete the songs from the library or upload again to continue.");
                
                TextArea textArea = new TextArea();
                filesNotFound.stream().forEach((file) -> {
                    textArea.appendText(file + "\n");
                });
                textArea.setEditable(false);
                textArea.setWrapText(true);

                textArea.setMaxWidth(Double.MAX_VALUE);
                textArea.setMaxHeight(Double.MAX_VALUE);
                GridPane.setVgrow(textArea, Priority.ALWAYS);
                GridPane.setHgrow(textArea, Priority.ALWAYS);

                GridPane filesNotFoundList = new GridPane();
                filesNotFoundList.setMaxWidth(Double.MAX_VALUE);
                filesNotFoundList.add(textArea, 0, 1);

                // Set expandable Exception into the dialog pane.
                alert.getDialogPane().setExpandableContent(filesNotFoundList);
                alert.getDialogPane().setExpanded(true);

                alert.showAndWait();
                filesNotFound.clear();
            }
        }
    }
    
    /* Function which sends a GET Request to the Database */
    /* Return: A integer representing the current state of the jukebox (Active or Inactive) */
    private void getJukeboxFromDB() throws MalformedURLException
    {
        try {
            String server = "https://thomasscully.com/playlists?account__id=" + user_account_id;
            URL url = new URL(server);
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            
            con.setRequestMethod("GET");
            
            con.setRequestProperty("secret-token", "aBcDeFgHiJkReturnOfTheSixToken666666");
            con.setRequestProperty("Content-Type", "application/json");
            
            BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
            String inputLine;
            StringBuffer jsonString = new StringBuffer();
            
            while ((inputLine = in.readLine()) != null) {
                jsonString.append(inputLine);
            }
            in.close();
            
            Gson gson = new Gson();
            currentJukebox = gson.fromJson(jsonString.toString(), Jukebox.class);
        } catch (IOException ex) {
            Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
    /* Function which sends a PUT Request to the Database to change the Jukebox state */
    /* Return: A integer representing the number of Jukeboxes that state changed */
    private void toggleJukeboxOnDB(String action) throws IOException
    {
        /* Create the PUT Body for the PUT Request */
        JsonObject putBody = new JsonObject();
        putBody.addProperty("action", action);
        putBody.addProperty("id", currentJukebox.getID());
        
        /* Write the PUT Body to the PUT Request */
        InputStream inputStream = new ByteArrayInputStream(putBody.toString().getBytes());
        InputStreamReader inputStreamReader = new InputStreamReader(inputStream);
	BufferedReader br = new BufferedReader(inputStreamReader);
	String jsonLine;
        String json = "";
	while ((jsonLine = br.readLine()) != null) {
            json += jsonLine + "\n";
	}
        
        /* Make Connection with server and send PUT Request to the database */
        URL url;
        try {
            url = new URL("https://thomasscully.com/toggle");
        } catch (MalformedURLException mex) {
            /* Malformed URL */
            Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, mex);
            return;
        }
        
        try {
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setDoOutput(true);
            conn.setRequestMethod("PUT");
            conn.setRequestProperty("secret-token", "aBcDeFgHiJkReturnOfTheSixToken666666");
            conn.setRequestProperty("Content-Type", "application/json");
            OutputStreamWriter writer = new OutputStreamWriter(conn.getOutputStream());

            writer.write(json);
            writer.flush();
            
            /* JSON returned from server after request */
            String line;
            BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            while ((line = reader.readLine()) != null) {
                /* Read Output from Server */
                /* System.out.println(line); */
            }
            writer.close();
            reader.close();
        } catch (IOException ex) {
            Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, ex);
        }
        getJukeboxFromDB();
    }
    
    /* Function which sends a PUT Request to the Database to change a Song's state */
    /* Return: A integer representing the number of Songs that state changed */
    private void toggleSongOnDB(String action) throws IOException
    {
        /* Create the PUT Body for the PUT Request */
        JsonObject putBody = new JsonObject();
        putBody.addProperty("action", action);
        putBody.addProperty("id", playingSong.getId());
        
        /* Write the PUT Body to the PUT Request */
        InputStream inputStream = new ByteArrayInputStream(putBody.toString().getBytes());
        InputStreamReader inputStreamReader = new InputStreamReader(inputStream);
	BufferedReader br = new BufferedReader(inputStreamReader);
	String jsonLine;
        String json = "";
	while ((jsonLine = br.readLine()) != null) {
            json += jsonLine + "\n";
	}
        
        /* Make Connection with server and send PUT Request to the database */
        URL url;
        try {
            url = new URL("https://thomasscully.com/toggle/song");
        } catch (MalformedURLException mex) {
            /* Malformed URL */
            Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, mex);
            return;
        }
        
        try {
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setDoOutput(true);
            conn.setRequestMethod("PUT");
            conn.setRequestProperty("secret-token", "aBcDeFgHiJkReturnOfTheSixToken666666");
            conn.setRequestProperty("Content-Type", "application/json");
            OutputStreamWriter writer = new OutputStreamWriter(conn.getOutputStream());

            writer.write(json);
            writer.flush();
            
            /* JSON returned from server after request */
            String line;
            BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            while ((line = reader.readLine()) != null) {
                /* Read Output from Server */
                /* System.out.println(line); */
            }
            writer.close();
            reader.close();
        } catch (IOException ex) {
            Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, ex);
        }
        getJukeboxFromDB();
    }
    
    /* Function which sends a PUT Request to the Database to change the Active Songs state */
    /* Return: A integer representing the number of Songs that state changed */
    private void toggleAllSongsOnDB(String action) throws IOException
    {
        /* Create the PUT Body for the PUT Request */
        JsonObject putBody = new JsonObject();
        putBody.addProperty("action", action);
        putBody.addProperty("id", user_account_id);
        
        /* Write the PUT Body to the PUT Request */
        InputStream inputStream = new ByteArrayInputStream(putBody.toString().getBytes());
        InputStreamReader inputStreamReader = new InputStreamReader(inputStream);
	BufferedReader br = new BufferedReader(inputStreamReader);
	String jsonLine;
        String json = "";
	while ((jsonLine = br.readLine()) != null) {
            json += jsonLine + "\n";
	}
        
        /* Make Connection with server and send PUT Request to the database */
        URL url;
        try {
            url = new URL("https://thomasscully.com/toggle/all_songs");
        } catch (MalformedURLException mex) {
            /* Malformed URL */
            Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, mex);
            return;
        }
        
        try {
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setDoOutput(true);
            conn.setRequestMethod("PUT");
            conn.setRequestProperty("secret-token", "aBcDeFgHiJkReturnOfTheSixToken666666");
            conn.setRequestProperty("Content-Type", "application/json");
            OutputStreamWriter writer = new OutputStreamWriter(conn.getOutputStream());

            writer.write(json);
            writer.flush();
            
            /* JSON returned from server after request */
            String line;
            BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            while ((line = reader.readLine()) != null) {
                /* Read Output from Server */
                /* System.out.println(line); */
            }
            writer.close();
            reader.close();
        } catch (IOException ex) {
            Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, ex);
        }
        getJukeboxFromDB();
    }
    
    /* Function which sends a GET Request to the Database */
    /* Return: A Song Object Array of all songs currently in the database */
    private Song[] getSongsFromDB() throws MalformedURLException 
    {
        try {
            String server = "https://thomasscully.com/songs?user_account_id=" + user_account_id;
            URL url = new URL(server);
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("GET");
            
            con.setRequestProperty("secret-token", "aBcDeFgHiJkReturnOfTheSixToken666666");
            con.setRequestProperty("Content-Type", "application/json");
            
            BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
            String inputLine;
            StringBuffer jsonString = new StringBuffer();
            
            while ((inputLine = in.readLine()) != null) {
                jsonString.append(inputLine);
            }
            in.close();
            
            Gson gson = new Gson();
            Songs songs = gson.fromJson(jsonString.toString(), Songs.class);
            getSongs = songs;
            return songs.getSongs();
            
        } catch (IOException ex) {
            Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, ex);
            return null;
        }
    }
    
    /* Function which sends a GET Request to the Database */
    /* Return: The Song with the highest number of votes in the Database */
    private boolean getNextSongFromDB()
    {
        try {
            String server = "https://thomasscully.com/songs/top_song?user_account_id=" + user_account_id + "&roomNumber=" + user_account_id;
            URL url = new URL(server);
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("GET");
            
            con.setRequestProperty("secret-token", "aBcDeFgHiJkReturnOfTheSixToken666666");
            con.setRequestProperty("Content-Type", "application/json");
            
            BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
            String inputLine;
            StringBuffer jsonString = new StringBuffer();
            
            while ((inputLine = in.readLine()) != null) {
                jsonString.append(inputLine);
            }
            in.close();
            
            if(jsonString.toString().equals("false"))
            {
                return false;
            }
            else
            {
                Gson gson = new Gson();
                playingSong = gson.fromJson(jsonString.toString(), Song.class);
                return true;
            }
            
        } catch (IOException ex) {
            Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, ex);
            return false;
        }
    }
    
    /* Function that will toggle the Current Song on the Database */
    /* Return: The Song will be set to Current or change from Current to in-active */
    private void setCurrentSongOnDB()
    {
        
    }
    
    /* Function that creates a ListView of song titles */
    /* Return: A ListView of all Song Titles currently in the Database */
    private void createListView(int user_account_id) throws Exception
    {
        Song[] songs = getSongsFromDB();
                
        ObservableList<String> items = FXCollections.observableArrayList();
        for(Song song : songs)
        {
            items.add(song.getTitle());
        }
        
        songTitles.setItems(items);
    }
    
    /* Function which sends a POST Request with a JSON Post Body to the Database */
    /* Return: None */
    private void postSongsToDB(JsonArray array) throws IOException
    {
        /* Create the POST Body for the POST Request */
        JsonObject postBody = new JsonObject();
        postBody.addProperty("user_account_id",user_account_id);
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
        
        /* Make Connection with server and send POST Request to the database */
        URL url;
        try {
            url = new URL("https://thomasscully.com/songs");
        } catch (MalformedURLException mex) {
            /* URL Malformed */
            Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, mex);
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
            
            /* JSON returned from server after request */
            String line;
            BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            while ((line = reader.readLine()) != null) {
                /* Read Output from Server */
                /* System.out.println(line); */
            }
            writer.close();
            reader.close();
        } catch (IOException ex) {
            Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
    /* Function which creates a JSON Object Array from a list of Files */
    /* Specifically each JSON Object holds metadata of selected songs */ 
    private void createJsonObject (List<File> files, JsonArray array) throws IOException, UnsupportedTagException, InvalidDataException
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
    private void showAllSongs(StackPane titleList) throws Exception
    {
        createListView(user_account_id);
        titleList.getChildren().remove(songTitles);
        titleList.getChildren().add(songTitles);
    }
    
    /* Function called to start the host's Jukebox */
    private Media songToPlay() throws MalformedURLException
    {
        if(getNextSongFromDB())
        {
            currentSong = createMedia(playingSong.getLocation());
            nowPlaying.setText("Now Playing: " + playingSong.getTitle() + ", " + playingSong.getArtist() + ", " + playingSong.getAlbum());
            return currentSong;
        }
        else
        {
            /* WSHTF Functionality */
            if(getSongs.getSongs().length != 0)
            {
                Random rn = new Random();
                int songID = rn.nextInt(getSongs.getSongs().length);
                playingSong = getSongs.getSongs()[songID];
                currentSong = createMedia(playingSong.getLocation());
                
                /* Set the Current Song on the Database */
                /* setCurrentSongOnDB(); */
                
                nowPlaying.setText("Now Playing: " + getSongs.getSongs()[songID].getTitle() + ", " + getSongs.getSongs()[songID].getArtist() + ", " + getSongs.getSongs()[songID].getAlbum());
                return currentSong;
            }
            else
            {
                return null;
            }
        }
    }
    
    private void searchForDuplicatesInDB() throws IOException, UnsupportedTagException, InvalidDataException
    {                
        if(uploadedFiles.size() > 0)
        {
            for(File file: uploadedFiles)
            {
                Mp3File mp3File = new Mp3File(file.getAbsolutePath());
                for(Song song: getSongs.getSongs())
                {
                    /* MP3 Files can have ID3v1 or ID3v2 tags, no real way to distigunish other than checking both */
                    if(mp3File.hasId3v1Tag())
                    {
                        if(mp3File.getId3v1Tag().getTitle().equals(song.getTitle()) && mp3File.getId3v1Tag().getArtist().equals(song.getArtist()))
                        {
                            /* If a duplicate delete the Song from the Database */
                            deleteSongFromDB(song.getId());
                        }
                    }
                    /* MP3 Files can have ID3v1 or ID3v2 tags, no real way to distigunish other than checking both */                
                    if(mp3File.hasId3v2Tag())
                    {
                        if(mp3File.getId3v2Tag().getTitle().equals(song.getTitle()) && mp3File.getId3v2Tag().getArtist().equals(song.getArtist()))
                        {
                            /* If a duplicate delete the Song from the Database */
                            deleteSongFromDB(song.getId());
                        }
                    }
                }
            }
        }
    }
    
    /* Function called when the Upload Button is clicked */
    private void upload(Stage stage, StackPane titleList) throws IOException, UnsupportedTagException, InvalidDataException, Exception
    {        
        /* Clear All to avoid duplicate Uploads */
        uploadedFiles = new ArrayList<File>();
        uploadedSongs = new JsonArray();
        
        /* Open File Chooser, POST the files that are selected, Display an updated list of Song Titles */
        uploadedFiles = uploadSongs.showOpenMultipleDialog(stage);

        if(uploadedFiles != null)
        {
            /* Check for duplicate songs in the files selected to be uploaded */
            searchForDuplicatesInDB();
        
            createJsonObject(uploadedFiles, uploadedSongs);
        }
        showAllSongs(titleList);
    }
    
    /* Function called when a Song is selected to be deleted */
    private void delete(int list_id) throws Exception
    {
        /* Remove Song from getSongs */
        if(deleteSongFromDB(getSongs.getSongs()[list_id].getId()) == true)
        {
            getSongsFromDB();
            songTitles.getItems().remove(list_id);
        }
        else
        {
            Alert alert = new Alert(AlertType.WARNING, "This song could not be deleted. Click 'OK' to continue");
            alert.setTitle("Deletion Failed");
            alert.setContentText("Deltion Failed");
            alert.showAndWait();
        }
    }
    
    /* Function called when multiple Songs are selected to be deleted */
    private void multipleDelete(List<String> itemsToDelete) throws Exception
    {
        List<String> successfullyDeleted = new ArrayList<String>();
        List<String> failedToDelete = new ArrayList<String>();
        
        for(String item: itemsToDelete)
        {
            int index = songTitles.getItems().indexOf(item);
            if(deleteSongFromDB(getSongs.getSongs()[index].getId()) == true)
            {
                successfullyDeleted.add(item);
            }
            else
            {
                failedToDelete.add(item);
                continue;
            }
        }
        
        if(failedToDelete.size() > 0)
        {
            Alert alert = new Alert(AlertType.WARNING, "The following songs could not be deleted. Click 'OK' to continue.");
            alert.setTitle("Deletion Failed");
            alert.setHeaderText("Deletion Failed");
            
            TextArea textArea = new TextArea();
                failedToDelete.stream().forEach((file) -> {
                    textArea.appendText(file + "\n");
                });
                textArea.setEditable(false);
                textArea.setWrapText(true);

                textArea.setMaxWidth(Double.MAX_VALUE);
                textArea.setMaxHeight(Double.MAX_VALUE);
                GridPane.setVgrow(textArea, Priority.ALWAYS);
                GridPane.setHgrow(textArea, Priority.ALWAYS);

                GridPane filesNotFoundList = new GridPane();
                filesNotFoundList.setMaxWidth(Double.MAX_VALUE);
                filesNotFoundList.add(textArea, 0, 1);

                // Set expandable Exception into the dialog pane.
                alert.getDialogPane().setExpandableContent(filesNotFoundList);
                alert.getDialogPane().setExpanded(true);

                alert.showAndWait();
        }
        
        /* Pull the most up to date Songs from the DB */
        getSongsFromDB();
        
        /* Only deletes the Songs from the List View that were successfully deleted */
        songTitles.getItems().removeAll(successfullyDeleted);
        
    }
    
    /* Function that checks that all Files potentially to be played exist */
    private boolean validateFileLocations()
    {
        boolean valid = true;
        for (Song song: getSongs.getSongs())
        {
            File file = new File(song.getLocation());
            if(!file.exists())
            {
                filesNotFound.add(song.getTitle());
                valid = false;
            }
        }
        return valid;
    }
    
    /* Function called when a Jukebox is started and music needs to begin playing */
    private void play() throws MalformedURLException
    {
        /* Makes sure no old data is present */
        jukebox = null;
        currentSong = null;
        playingSong = null;
        
        songToPlay();
        jukebox = new MediaPlayer(currentSong);
        playSong();
        
        jukebox.setOnEndOfMedia(() -> {
            try {
                toggleSongOnDB("out");
                play();
            } catch (MalformedURLException ex) {
                Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, ex);
            } catch (IOException ex) {
                Logger.getLogger(SongsApplet.class.getName()).log(Level.SEVERE, null, ex);
            }
        });
    }
}
