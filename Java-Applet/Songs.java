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
public class Songs {
    
    private Song[] songs;
    
    public Songs(Song[] songs)
    {
        this.songs = songs;
    }
    
    public Song[] getSongs()
    {
        return this.songs;
    }
    
    public void setSongs(Song[] songs)
    {
        this.songs = songs;
    }
    
}

