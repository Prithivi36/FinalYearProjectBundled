package com.collider.code_collab;

import lombok.AllArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.PrintStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@AllArgsConstructor
@CrossOrigin("*")
public class CodeEditorController {

    SimpMessagingTemplate messagingTemplate;
    NotepadController notepadController;
    private final Map<String,String > map = new HashMap<>();
    private final Map<String, List<String>> users = new HashMap<>();

    @MessageMapping("/room/{userId}/edit")
    @SendTo("/topic/room/{userId}")
    public CodeEditor codeSocket(@DestinationVariable String userId, CodeEditor codeEditor) {
        map.put(userId, codeEditor.getContent());
        return codeEditor;
    }

    @MessageMapping("/room/{roomId}/users/{userName}")
    @SendTo("/topic/room/users/{roomId}")
    public List<String> getUsers(@DestinationVariable String roomId, @DestinationVariable String userName) {
        List<String> user = users.getOrDefault(roomId,new ArrayList<>());
        if(!user.contains(userName))
            user.add(userName);
        users.put(roomId,user);
        System.out.println(users.get(roomId) +"room "+roomId +"state changed");
        messagingTemplate.convertAndSend("/topic/room/users/" + roomId, users.get(roomId));
        return users.getOrDefault(roomId,new ArrayList<>());
    }
    @MessageMapping("room/{roomId}/del/{userId}")
    public void delete(@DestinationVariable String roomId, @DestinationVariable String userId) {
        System.out.println("user : " + userId +" left room : " + roomId);
        users.get(roomId).remove(userId);
        if(users.get(roomId).isEmpty()){
            users.remove(roomId);
            notepadController.map.remove(roomId);
        }
        map.remove(userId);
        if(users.containsKey(roomId)){
            messagingTemplate.convertAndSend("/topic/room/users/"+roomId, users.get(roomId));
            messagingTemplate.convertAndSend("/topic/room/"+userId,new CodeEditor());
        }
    }
    @MessageMapping("room/{roomId}/sync")
    public void sync(@DestinationVariable String roomId) {
        String current = map.get(roomId);
        CodeEditor latest = new CodeEditor();
        latest.setContent(current);
        messagingTemplate.convertAndSend("/topic/room/" + roomId, latest);
    }

    @PostMapping("/delete/{roomId}/{userId}")
    public void deleteRequest(@PathVariable String roomId,@PathVariable String userId) {
        delete(roomId,userId);
    }
    @PostMapping("/feedback")
    @ResponseBody
    public void fileWrite(@RequestBody FeedBack feedBack) throws FileNotFoundException {
        PrintStream ps = System.out;
        System.setOut(new PrintStream(new FileOutputStream("feedback.txt",true)));
        System.out.println(LocalDateTime.now());
        System.out.println(feedBack.getMessage());
        System.out.println();
        System.setOut(ps);
    }

}
