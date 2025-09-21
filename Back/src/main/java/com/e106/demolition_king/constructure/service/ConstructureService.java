package com.e106.demolition_king.constructure.service;


import com.e106.demolition_king.constructure.entity.Constructure;
import com.e106.demolition_king.constructure.vo.in.ConstructureByEventInVo;
import com.e106.demolition_king.constructure.vo.out.ConstructureResponseVo;
import com.e106.demolition_king.constructure.vo.out.GetConstructureResponseVo;

import java.util.List;

public interface ConstructureService {
    public List<ConstructureResponseVo> generateConstructures(int count);

    public void insertNewConstructures(String userUuid, List<Integer> constructureSeqList);

    public List<GetConstructureResponseVo> getUserConstructures(String userUuid);
    ConstructureResponseVo getByEvent(ConstructureByEventInVo inVo);

    List<GetConstructureResponseVo> getUserEventConstructures(String userUuid);
}