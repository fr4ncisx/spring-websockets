package com.sockets.spring_sockets.controller;

import com.sockets.spring_sockets.model.dto.MessageRequest;
import com.sockets.spring_sockets.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@RequiredArgsConstructor
@Controller
public class ChatController {

    private final MessageService messageService;

    @MessageMapping("/chat") // route to send messages /topic/chat
    @SendTo("/topic/messages") // destination route for subscribe
    public String responseTopic(MessageRequest message) {
        messageService.addMessage(message);
        return message.getMessage();
    }
}
