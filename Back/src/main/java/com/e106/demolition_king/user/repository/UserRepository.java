package com.e106.demolition_king.user.repository;

import com.e106.demolition_king.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUserEmail(String userEmail);
    boolean existsByUserNickname(String nickname);
    Optional<User> findByUserUuid(String uuid);
    Optional<User> findByUserNickname(String userNickname);
    Optional<User> findByGoogleSub(String sub);

}
