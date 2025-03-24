package com.sockets.spring_sockets.repository;

import com.sockets.spring_sockets.model.Messages;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Messages, Long> {
}
