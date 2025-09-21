package com.e106.demolition_king.user.repository;

import com.e106.demolition_king.user.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProfileRepository extends JpaRepository<Profile, Integer> {
    List<Profile> findAllByOrderByProfileSeqAsc();
}

