import { atom } from 'jotai';

// 用户相关状态
export const userNameAtom = atom('访客');
export const userRoleAtom = atom('student');
export const roomIDAtom = atom(null);
export const itemsAtom = atom([]);

// 其他全局状态... 