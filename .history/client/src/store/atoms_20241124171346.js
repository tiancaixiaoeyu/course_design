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

