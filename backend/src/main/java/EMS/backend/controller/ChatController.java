package EMS.backend.controller;

import EMS.backend.entity.ChatMessage;
import EMS.backend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // REST endpoints
    @GetMapping("/community")
    public List<ChatMessage> getCommunityHistory() {
        return chatService.getCommunityHistory();
    }

    @GetMapping("/private/{u1}/{u2}")
    public List<ChatMessage> getPrivateHistory(@PathVariable Long u1, @PathVariable Long u2) {
        return chatService.getPrivateHistory(u1, u2);
    }

    @GetMapping("/group/{groupId}")
    public List<ChatMessage> getGroupHistory(@PathVariable Long groupId) {
        return chatService.getGroupHistory(groupId);
    }

    @GetMapping("/groups/{userId}")
    public ResponseEntity<?> getUserGroups(@PathVariable Long userId) {
        return ResponseEntity.ok(chatService.getUserGroups(userId));
    }

    @PostMapping("/groups/create")
    public ResponseEntity<?> createGroup(@RequestBody Map<String, Object> payload) {
        String name = (String) payload.get("name");
        Long creatorId = Long.valueOf(payload.get("creatorId").toString());
        List<Integer> memberIdsRaw = (List<Integer>) payload.get("memberIds");
        List<Long> memberIds = memberIdsRaw.stream().map(Long::valueOf).toList();
        return ResponseEntity.ok(chatService.createGroup(name, creatorId, memberIds));
    }

    // WebSocket Message Handling
    @MessageMapping("/community.send")
    public void receiveCommunityMessage(@Payload ChatMessage message) {
        ChatMessage saved = chatService.sendCommunityMessage(message.getSender().getId(), message.getContent());
        messagingTemplate.convertAndSend("/topic/community", saved);
    }

    @MessageMapping("/private.send")
    public void receivePrivateMessage(@Payload ChatMessage message) {
        ChatMessage saved = chatService.sendPrivateMessage(
                message.getSender().getId(), 
                message.getRecipient().getId(), 
                message.getContent());
        // Destination: /queue/messages-{recipientId}
        messagingTemplate.convertAndSendToUser(
                saved.getRecipient().getUsername(), "/queue/messages", saved);
        // Also send back to sender for updating UI
        messagingTemplate.convertAndSendToUser(
                saved.getSender().getUsername(), "/queue/messages", saved);
    }

    @MessageMapping("/group.send")
    public void receiveGroupMessage(@Payload ChatMessage message) {
        ChatMessage saved = chatService.sendGroupMessage(
                message.getSender().getId(), 
                message.getGroup().getId(), 
                message.getContent());
        messagingTemplate.convertAndSend("/topic/group/" + saved.getGroup().getId(), saved);
    }
}
