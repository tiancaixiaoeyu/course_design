import { atom } from 'jotai';

// 移动到 store/atoms.js 中
export const draggedItemAtom = atom(null);
export const draggedItemRotationAtom = atom(0);
export const roomIDAtom = atom(null);  // 这个应该是唯一的声明位置
