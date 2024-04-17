import { createStore, applyMiddleware} from 'redux';
import { io } from 'socket.io-client';

// 定义初始状态
const initialState = {
    socket: null,
  };

// 定义 reducer
// 纯函数，接收当前的状态 (state) 和一个动作 (action)，然后返回一个新的状态
const rootReducer = (state = initialState, action) => {
  switch (action.type) { // 根据action.type的值确定如何更新
    case 'SET_SOCKET':
      return {
          ...state,
          socket: action.payload,  // 当我们dispatch一个{ type: 'SET_SOCKET', payload: someSocketValue }
        };
      default:
        return state;   // 默认是简单返回状态
    }
};

export const socketMiddleware = storeAPI => next => action => { // 自定义 socketMiddleware
  switch (action.type) {   
    case 'INIT_SOCKET':
      if (!storeAPI.getState().socket) {
        const socket = io('http://localhost:3000'); // 初始化 socket 连接
        socket.on('connect', () => {
          console.log('Connected to server');
        });
        storeAPI.dispatch({ type: 'SET_SOCKET', payload: socket });
      }
      break;
    default:
      return next(action);
  }
};

const store = createStore(rootReducer, applyMiddleware(socketMiddleware)); // 使用中间件 // 创建 Redux store
export default store;
  
