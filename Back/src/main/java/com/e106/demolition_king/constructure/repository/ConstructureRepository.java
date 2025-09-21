package com.e106.demolition_king.constructure.repository;

import com.e106.demolition_king.constructure.entity.Constructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ConstructureRepository extends JpaRepository<Constructure, Integer> {
    List<Constructure> findAllByTierNotIgnoreCase(String tier);
    Optional<Constructure> findByName(String name);

    @Query("select c from Constructure c where c.name like 'eventk%' or c.name like 'eventw%'")
    List<Constructure> findAllEventConstructures();
}
