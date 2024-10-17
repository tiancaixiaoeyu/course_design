import React, { useState } from 'react';
import UserRoleContext from './UserRoleContext';

function UserRoleProvider({ children }) {
  // 初始化userRole状态
  const [userRole, setUserRole] = useState('student'); // 默认角色为'student'

  // Provider组件可以包含其他状态或逻辑
  // ...

  return (
    <UserRoleContext.Provider value={{ userRole, setUserRole }}>
      {children}
    </UserRoleContext.Provider>
  );
}

export default UserRoleProvider;