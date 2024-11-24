import { useAtom } from 'jotai';
import { userNameAtom, userRoleAtom } from '../store/atoms';

export function SocketManager({ children }) {
  const [socket, setSocket] = useState(null);
  const [userName] = useAtom(userNameAtom);
  const [userRole] = useAtom(userRoleAtom);

  useEffect(() => {
    // socket 初始化代码...
  }, [userName, userRole]);

  return children;
}
