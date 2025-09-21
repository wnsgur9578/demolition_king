package com.e106.demolition_king.game.vo.out;

import java.util.List;

public class PatternNumericResponse {
    private final List<PatternNumericSetVo> patterns;
    public PatternNumericResponse(List<PatternNumericSetVo> patterns){ this.patterns = patterns; }
    public List<PatternNumericSetVo> getPatterns(){ return patterns; }
}