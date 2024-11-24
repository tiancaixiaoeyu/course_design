import { useGLTF } from "@react-three/drei";
import { atom, useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

export const charactersAtom = atom([]);
export const mapAtom = atom(null);
export const userAtom = atom(null);
export const itemsAtom = atom(null);
export const roomIDAtom = atom(null);
export const roomsAtom = atom([]);

export const userRoleAtom = atom("student"); // 默认值为 student
export const userNameAtom = atom("");
export const SocketManager = () => {
  const [_characters, setCharacters] = useAtom(charactersAtom);
  const [_map, setMap] = useAtom(mapAtom);
  const [_user, setUser] = useAtom(userAtom);
  const [items, setItems] = useAtom(itemsAtom);
  const [_rooms, setRooms] = useAtom(roomsAtom);

  const dispatch = useDispatch(); // 使用 dispatch 来设置和存储 socket 对象

  const socket = useSelector((state) => state.socket); // 从 Redux store 中获取 socket

  const [userName] = useAtom(userNameAtom)
  const [userRole] = useAtom(userRoleAtom)

  useEffect(() => {
    if (!socket) {
      dispatch({ type: "INIT_SOCKET" }); // 通过 Redux 中间件初始化 socket
    }
    return () => {
      // 当组件卸载时，你可以在这里执行必要的清理工作，例如断开连接。
      if (socket) {
        console.log("mount");
        socket.disconnect();
      }
    };
  }, [socket, dispatch]);

  useEffect(() => {
    if (!items) {
      return;
    }
    // items存在时，预加载所有模型
    // 由于Welcome时已经获得物品，所以可以预加载
    Object.values(items).forEach((item) => {
      useGLTF.preload(`/models/items/${item.name}.glb`);
    });
  }, [items]);

  useEffect(() => {
    console.log("component did mounted");

    return () => {
      console.log("component will unmount");
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    // function onConnect() {
    //   console.log("connected");
    // }

    function onDisconnect(reason) {
      console.log("disconnected", reason);
    }

    function onWelcome(value) {
      console.log("onWelcome", socket.id);
      setRooms(value.rooms); // 全局设置房间和物品
      setItems(value.items);
    }

    function onRooms(value) {
      setRooms(value);
    }

    function onRoomJoined(value) {
      console.log("onRoomJoined");
      setMap(value.map); // 房间布局
      setUser(value.id); // 用户id
      setCharacters(value.characters);
      // 加入房间时发送用户信息
      const [userName] = useAtom(userNameAtom);
      const [userRole] = useAtom(userRoleAtom);
      if (userName && userRole) {
        socket.emit("setUserInfo", { userName, userRole });
      }
    }

    function onCharacters(value) {
      console.log("onCharacters");
      setCharacters(value);
      console.log("characters", value);
      console.log("characters", value[0].role);
    }

    function onMapUpdate(value) {
      // 更新地图
      console.log("onMapUpdate map", value.map);
      console.log("onMapUpdate characters", value.characters);
      setMap(value.map);
      setCharacters(value.characters);
    }

    //socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("roomJoined", onRoomJoined);
    socket.on("rooms", onRooms);
    socket.on("welcome", onWelcome);
    socket.on("characters", onCharacters);
    socket.on("mapUpdate", onMapUpdate);
    return () => {
      //socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("roomJoined", onRoomJoined);
      socket.off("rooms", onRooms);
      socket.off("welcome", onWelcome);
      socket.off("characters", onCharacters);
      socket.off("mapUpdate", onMapUpdate);
    };
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.emit('initialCharacterData', {
        name: userName,
        role: userRole
      })
    }
  }, [socket]) // 只在 socket 连接时执行一次
};
