package com.collider.code_collab;

import lombok.AllArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashMap;

@Controller
@AllArgsConstructor
public class NotepadController {

    SimpMessagingTemplate messagingTemplate;
    final HashMap<String,String> map = new HashMap<>();
    @MessageMapping("/room/{roomId}/notepad")
    @SendTo("/topic/room/{roomId}/notepad")
    public Notepad notepadSocket(@DestinationVariable String roomId, Notepad notepad) {
        map.put(roomId, notepad.getContent());
        return notepad;
    }
    @MessageMapping("room/{roomId}/sync/notepad")
    public void sync(@DestinationVariable String roomId) {
        String current = map.getOrDefault(roomId,"");
        Notepad notepad = new Notepad();
        notepad.setContent(current);
        messagingTemplate.convertAndSend("/topic/room/" + roomId+"/notepad",notepad );
    }
}
