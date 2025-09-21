package com.e106.demolition_king.game.vo.out;

import java.util.List;

public class PatternNumericSetVo {
    private final int index;
    private final List<Integer> moves; // 0=잽, 1=어퍼, 2=회피
    public PatternNumericSetVo(int index, List<Integer> moves){ this.index=index; this.moves=moves; }
    public int getIndex(){ return index; }
    public List<Integer> getMoves(){ return moves; }
}