import { atom, useAtom } from "jotai";

export const userRoleAtom = atom("student");
export const userNameAtom = atom("");
export const avatarUrlAtom = atom("https://models.readyplayer.me/6575b1a3b21c8b3e80ba1a83.glb");
export const buildModeAtom = atom(false);
export const shopModeAtom = atom(false);
export const draggedItemAtom = atom(null);
export const draggedItemRotationAtom = atom(0);

export const UI = () => {
  const [userRole, setUserRole] = useAtom(userRoleAtom);
  const [userName, setUserName] = useAtom(userNameAtom);
  // ... 其他代码
}
