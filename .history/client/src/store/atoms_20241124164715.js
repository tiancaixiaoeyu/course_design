import { atom } from "jotai";

// 用户相关的atoms
export const userRoleAtom = atom("student");
export const userNameAtom = atom("someone");

// 其他atoms
export const charactersAtom = atom([]);
export const mapAtom = atom(null);
export const userAtom = atom(null);
export const itemsAtom = atom(null);
export const roomIDAtom = atom(null);
export const roomsAtom = atom([]); 