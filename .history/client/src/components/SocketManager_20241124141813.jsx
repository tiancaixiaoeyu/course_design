import { useAtom } from 'jotai';
import { userNameAtom, userRoleAtom } from '../store/atoms';

export function SocketManager({ children }) {
  const [userName] = useAtom(userNameAtom);
  const [userRole] = useAtom(userRoleAtom);

  return children;
}
