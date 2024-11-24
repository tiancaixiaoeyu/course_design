import { atom } from "jotai";

// 用户相关
export const userRoleAtom = atom("student");
export const userNameAtom = atom("");
export const avatarUrlAtom = atom("https://models.readyplayer.me/6575b1a3b21c8b3e80ba1a83.glb");

// UI 相关
export const buildModeAtom = atom(false);
export const shopModeAtom = atom(false);
export const draggedItemAtom = atom(null);
export const draggedItemRotationAtom = atom(0);

// 房间和物品相关
export const charactersAtom = atom([]);
export const mapAtom = atom(null);
export const userAtom = atom(null);
export const itemsAtom = atom(null);
export const roomIDAtom = atom(null);
export const roomsAtom = atom([]); 