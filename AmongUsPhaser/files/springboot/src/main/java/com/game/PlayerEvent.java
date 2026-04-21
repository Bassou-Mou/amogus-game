package com.game.model;

public class PlayerEvent {
    private String playerId;
    private String type; // "join" or "leave"

    public PlayerEvent() {}

    public String getPlayerId() { return playerId; }
    public void setPlayerId(String playerId) { this.playerId = playerId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
