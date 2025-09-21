// src/utils/roomUtils.js

// 방 이름 목록을 localStorage에서 가져옴
export function getRoomList() {
  const stored = localStorage.getItem("roomList");
  return stored ? JSON.parse(stored) : [];
}

// 방 이름 추가
export function addRoom(roomName) {
  const rooms = getRoomList();
  if (!rooms.includes(roomName)) {
    rooms.push(roomName);
    localStorage.setItem("roomList", JSON.stringify(rooms));
  }
}

// 방 이름 존재 확인
export function roomExists(roomName) {
  const rooms = getRoomList();
  return rooms.includes(roomName);
}
