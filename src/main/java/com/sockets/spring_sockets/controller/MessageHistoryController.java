package com.sockets.spring_sockets.controller;

import com.sockets.spring_sockets.model.Messages;
import com.sockets.spring_sockets.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RequiredArgsConstructor
@RestController
@RequestMapping("/v1/")
public class MessageHistoryController {

    private final MessageService messageService;

    @GetMapping("/get-all")
    public Flux<Messages> getMessagesFlux(){
        return messageService.getAll();
    }

}
