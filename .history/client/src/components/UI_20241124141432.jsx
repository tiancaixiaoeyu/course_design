import { useAtom } from 'jotai';
import { userNameAtom, userRoleAtom, avatarUrlAtom, draggedItemAtom, draggedItemRotationAtom } from '../store/atoms';

export function UI() {
  const [userName, setUserName] = useAtom(userNameAtom);
  const [userRole, setUserRole] = useAtom(userRoleAtom);
  
  const handleNameChange = (e) => {
    setUserName(e.target.value);
  };

  const toggleRole = () => {
    setUserRole(prev => prev === 'student' ? 'teacher' : 'student');
  };

  return (
    <div className="fixed top-0 left-0 p-4">
      <input
        type="text"
        value={userName}
        onChange={handleNameChange}
        placeholder="输入昵称"
        className="mb-2 p-2 border rounded"
      />
      <button
        onClick={toggleRole}
        className="p-2 bg-blue-500 text-white rounded"
      >
        当前身份: {userRole === 'student' ? '学生' : '教师'}
      </button>
    </div>
  );
}
