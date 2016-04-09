/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package songsapplet;

/**
 *
 * @author garrettknox
 */
public class Song {
    
    private int id;
    private String song_title;
    private String song_artist;
    private int song_length;
    private String song_album;
    private String location_in_filesystem;
    
    public Song(int id, String song_title, String song_artist, int song_length, String song_album, String location_in_filesystem)
    {
        this.id = id;
        this.song_title = song_title;
        this.song_artist = song_artist;
        this.song_length = song_length;
        this.song_album = song_album;
        this.location_in_filesystem = location_in_filesystem;
    }
    
    public int getId()
    {
        return this.id;
    }
    
    public String getTitle()
    {
        return this.song_title;
    }
    
    public String getArtist()
    {
        return this.song_artist;
    }
    
    public int getLength()
    {
        return this.song_length;
    }
    
    public String getAlbum()
    {
        return this.song_album;
    }
    
    public String getLocation()
    {
        return this.location_in_filesystem;
    }

}
