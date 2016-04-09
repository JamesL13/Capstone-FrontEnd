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
public class Jukebox {
    
    private int id;
    private int user_account;
    private String description;
    private String password;
    private int is_active;
    
    public Jukebox(int id, int user_account, String description, String password, int is_active)
    {
        this.id = id;
        this.user_account = user_account;
        this.description = description;
        this.password = password;
        this.is_active = is_active;
    }
    
    public int getIsActive()
    {
        return this.is_active;
    }
}
