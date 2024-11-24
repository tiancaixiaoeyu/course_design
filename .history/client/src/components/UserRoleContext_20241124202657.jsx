import { createContext } from 'react';

const UserRoleContext = createContext({
  userRole: 'student',  // 提供默认值
  userName: ''
});

export default UserRoleContext;