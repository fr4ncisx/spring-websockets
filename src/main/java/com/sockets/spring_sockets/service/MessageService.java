package com.sockets.spring_sockets.service;

import com.sockets.spring_sockets.model.Messages;
import com.sockets.spring_sockets.model.dto.MessageRequest;
import com.sockets.spring_sockets.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
@Service
public class MessageService {

    private final MessageRepository messageRepository;

    @Transactional
    public void addMessage(MessageRequest message) {
        Messages msg = new Messages(null, message.getMessage());
        messageRepository.save(msg);
    }

    public Flux<Messages> getAll() {
        var fluxMsg = Flux.fromIterable(messageRepository.findAll());
        return fluxMsg.switchIfEmpty(
                Mono.error(new IllegalArgumentException("No elements"))
        );
    }
}
