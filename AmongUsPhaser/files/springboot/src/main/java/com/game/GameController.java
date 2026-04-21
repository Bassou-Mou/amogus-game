package com.game.controller;

import com.game.model.PlayerEvent;
import com.game.model.PlayerPosition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.stereotype.Controller;

@Controller
public class GameController {

    private static final Logger log = LoggerFactory.getLogger(GameController.class);

    /**
     * Player sends their position → broadcast to all clients.
     */
    @MessageMapping("/player/move")
    @SendTo("/topic/positions")
    public PlayerPosition handleMove(PlayerPosition pos) {
        pos.setTimestamp(System.currentTimeMillis());
        log.debug("Move: {}", pos);
        return pos;
    }

    /**
     * Player announces they joined → broadcast to all clients.
     */
    @MessageMapping("/player/join")
    @SendTo("/topic/players")
    public PlayerEvent handleJoin(PlayerEvent event) {
        log.info("Player joined: {}", event.getPlayerId());
        return event;
    }

    /**
     * Player announces they left → broadcast to all clients.
     */
    @MessageMapping("/player/leave")
    @SendTo("/topic/players")
    public PlayerEvent handleLeave(PlayerEvent event) {
        log.info("Player left: {}", event.getPlayerId());
        return event;
    }
}
