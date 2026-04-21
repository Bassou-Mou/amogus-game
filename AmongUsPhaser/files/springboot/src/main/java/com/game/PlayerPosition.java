package com.game.model;

public class PlayerPosition {
    private String playerId;
    private double x;
    private double y;
    private long timestamp;

    public PlayerPosition() {}

    public PlayerPosition(String playerId, double x, double y, long timestamp) {
        this.playerId = playerId;
        this.x = x;
        this.y = y;
        this.timestamp = timestamp;
    }

    public String getPlayerId() { return playerId; }
    public void setPlayerId(String playerId) { this.playerId = playerId; }

    public double getX() { return x; }
    public void setX(double x) { this.x = x; }

    public double getY() { return y; }
    public void setY(double y) { this.y = y; }

    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }

    @Override
    public String toString() {
        return String.format("PlayerPosition{playerId='%s', x=%.1f, y=%.1f}", playerId, x, y);
    }
}
