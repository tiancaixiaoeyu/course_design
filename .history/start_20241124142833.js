const concurrently = require('concurrently');

concurrently([
  { 
    command: 'cd client && npm run dev', 
    name: 'CLIENT', 
    prefixColor: 'blue'
  },
  { 
    command: 'cd server && node index.js', 
    name: 'SERVER', 
    prefixColor: 'green'
  }
], {
  prefix: 'name',
  killOthers: ['failure', 'success'],
  restartTries: 3,
}).then(
  () => console.log('所有进程成功退出'),
  (error) => console.error('有进程异常退出:', error)
); 