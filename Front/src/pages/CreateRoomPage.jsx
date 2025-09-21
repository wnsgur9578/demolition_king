import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

function CreateRoomPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const newRoomId = uuidv4();
    console.log("룸아이디생성",newRoomId);
    navigate(`/lobby/${newRoomId}`); // 생성하자마자 입장
  }, [navigate]);

  return <div>방을 생성 중입니다...</div>;
}

export default CreateRoomPage;