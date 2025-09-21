package com.e106.demolition_king.skin.repository;

import com.e106.demolition_king.skin.entity.PlayerSkin;
import com.e106.demolition_king.skin.entity.PlayerSkinItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlayerSkinItemRepository extends JpaRepository<PlayerSkinItem, Integer> {



}

