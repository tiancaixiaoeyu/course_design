import { atom, useAtom } from "jotai";
import { userRoleAtom, userNameAtom } from '../store/atoms';

export const buildModeAtom = atom(false);
export const shopModeAtom = atom(false);
export const draggedItemAtom = atom(null);
export const draggedItemRotationAtom = atom(0);
