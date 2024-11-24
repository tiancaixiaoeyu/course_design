import { atom } from 'jotai';

// 用户相关状态
export const userNameAtom = atom('访客');
export const userRoleAtom = atom('student');
export const itemsAtom = atom([]);

// 从 UI.jsx 导入这些状态
import { roomIDAtom, draggedItemAtom, draggedItemRotationAtom } from '../components/UI';
export { roomIDAtom, draggedItemAtom, draggedItemRotationAtom };

// 其他全局状态... 