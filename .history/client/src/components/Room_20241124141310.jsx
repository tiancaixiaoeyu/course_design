import {
  AccumulativeShadows,
  Grid,
  RandomizedLight,
  useCursor,
} from "@react-three/drei";

import { useThree } from "@react-three/fiber";
import { atom, useAtom } from "jotai";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useGrid } from "../hooks/useGrid";
import { Avatar } from "./Avatar";
import { Item } from "./Item";
import { Shop } from "./Shop";
//import { charactersAtom, mapAtom, roomIDAtom, socket, userAtom } from "./SocketManager";
import { useSelector } from "react-redux";
import { charactersAtom, mapAtom, roomIDAtom, userAtom } from "./SocketManager";
import {
  buildModeAtom,
  draggedItemAtom,
  draggedItemRotationAtom,
  shopModeAtom,
} from "./UI";


import { TextureLoader } from "three";
const texture = new TextureLoader().load('/textures/grass.jag')



export const roomItemsAtom = atom([]);

export const Room = () => {

  const socket = useSelector((state)=>state.socket)

  const [buildMode] = useAtom(buildModeAtom);
  const [shopMode, setShopMode] = useAtom(shopModeAtom);
  const [characters] = useAtom(charactersAtom);
  const [map] = useAtom(mapAtom);
  const [items, setItems] = useAtom(roomItemsAtom);
  const [onFloor, setOnFloor] = useState(false);
  useCursor(onFloor);
  const { vector3ToGrid, gridToVector3 } = useGrid();

  const scene = useThree((state) => state.scene);
  const [user] = useAtom(userAtom);

  useEffect(() => {
    setItems(map.items);
  }, [map]);

  const onPlaneClicked = (e) => {
    if (!buildMode) {
      const character = scene.getObjectByName(`character-${user}`);
      if (!character) {
        return;
      }
      socket.emit(
        "move",
        vector3ToGrid(character.position),
        vector3ToGrid(e.point)
      );
    } else {
      if (draggedItem !== null) {
        if (canDrop) {
          setItems((prev) => {
            const newItems = [...prev];
            delete newItems[draggedItem].tmp;
            newItems[draggedItem].gridPosition = vector3ToGrid(e.point);
            newItems[draggedItem].rotation = draggedItemRotation;
            return newItems;
          });
        }
        setDraggedItem(null);
      }
    }
  };

  const [draggedItem, setDraggedItem] = useAtom(draggedItemAtom);
  const [draggedItemRotation, setDraggedItemRotation] = useAtom(
    draggedItemRotationAtom
  );
  const [dragPosition, setDragPosition] = useState([0, 0]);
  const [canDrop, setCanDrop] = useState(false);

  useEffect(() => {
    if (draggedItem === null) {
      setItems((prev) => prev.filter((item) => !item.tmp));
    }
  }, [draggedItem]);

  useEffect(() => {
    if (draggedItem === null) {  // 假值
      return;
    }
    const item = items[draggedItem];
    const width =
      draggedItemRotation === 1 || draggedItemRotation === 3
        ? item.size[1]
        : item.size[0];
    const height =
      draggedItemRotation === 1 || draggedItemRotation === 3
        ? item.size[0]
        : item.size[1];

    let droppable = true;

    // 检查是否超边界
    if (
      dragPosition[0] < 0 ||
      dragPosition[0] + width > map.size[0] * map.gridDivision
    ) {
      droppable = false;
    }
    if (
      dragPosition[1] < 0 ||
      dragPosition[1] + height > map.size[1] * map.gridDivision
    ) {
      droppable = false;
    }
    // 检查是否和其他物体碰撞
    if (!item.walkable && !item.wall) {
      items.forEach((otherItem, idx) => {
        // ignore self
        if (idx === draggedItem) {
          return;
        }

        // 忽略墙和地板
        if (otherItem.walkable || otherItem.wall) {
          return;
        }

        // 检查两个矩形区域是否重叠
        const otherWidth =
          otherItem.rotation === 1 || otherItem.rotation === 3
            ? otherItem.size[1]
            : otherItem.size[0];
        const otherHeight =
          otherItem.rotation === 1 || otherItem.rotation === 3
            ? otherItem.size[0]
            : otherItem.size[1];
        if (
          dragPosition[0] < otherItem.gridPosition[0] + otherWidth &&
          dragPosition[0] + width > otherItem.gridPosition[0] &&
          dragPosition[1] < otherItem.gridPosition[1] + otherHeight &&
          dragPosition[1] + height > otherItem.gridPosition[1]
        ) {
          droppable = false;
        }
      });
    }

    setCanDrop(droppable);
  }, [dragPosition, draggedItem, items, draggedItemRotation]);
  const state = useThree((state) => state);

  useEffect(() => {
    if (buildMode) { // Build模式，设置items展示Build模式下的项目
      setItems(map?.items || []);  // map?为真，输出其items属性
    } else { 
     // console.log("itemsUpdate");
      socket.emit("itemsUpdate", items); // 非Build模式，将items数据发送给服务器，同步给其他用户
    }
  }, [buildMode]);

  const onItemSelected = (item) => {
    setShopMode(false);

    setItems((prev) => [
      ...prev,
      {
        ...item,
        gridPosition: [0, 0],
        tmp: true,
      },
    ]);
    setDraggedItem(items.length);
    setDraggedItemRotation(item.rotation || 0);
  };

  const accumulativeShadows = useMemo(
    () => (
      <AccumulativeShadows
        temporal
        frames={42}
        alphaTest={0.85}
        scale={30}
        position={[0, 0, 0]}
        color="pink"
      >
        <RandomizedLight
          amount={4}
          radius={9}
          intensity={0.38}
          ambient={0.25}
          position={[15, 5, -20]}
        />
        <RandomizedLight
          amount={4}
          radius={5}
          intensity={0.25}
          ambient={0.55}
          position={[-5, 5, -20]}
        />
      </AccumulativeShadows>
    ),
    [items]
  ); // 根据items来变化阴影，避免重复渲染

  return (
    <>
      {shopMode && <Shop onItemSelected={onItemSelected} />}
      {!buildMode && !shopMode && accumulativeShadows}
      {!shopMode &&
        (buildMode ? items : map.items).map((item, idx) => (
          <Item
            key={`${item.name}-${idx}`}
            item={item}
            onClick={() => {
              if (buildMode) {
                setDraggedItem((prev) => (prev === null ? idx : prev));
                setDraggedItemRotation(item.rotation || 0);
              }
            }}
            isDragging={draggedItem === idx}
            dragPosition={dragPosition}
            dragRotation={draggedItemRotation}
            canDrop={canDrop}
          />
        ))}


      {!shopMode && (
        <mesh
          rotation-x={-Math.PI / 2}
          position-y={-0.002}
          onClick={onPlaneClicked}
          onPointerEnter={() => setOnFloor(true)}
          onPointerLeave={() => setOnFloor(false)}
          onPointerMove={(e) => {
            if (!buildMode) {
              return;
            }
            const newPosition = vector3ToGrid(e.point);
            if (
              !dragPosition ||
              newPosition[0] !== dragPosition[0] ||
              newPosition[1] !== dragPosition[1]
            ) {
              setDragPosition(newPosition);
            }
          }}
          position-x={map.size[0] / 2}
          position-z={map.size[1] / 2}
          receiveShadow
        >
          {/* 房间平面大小+颜色*/}
          <planeGeometry args={map.size} />  
          <meshStandardMaterial color="#3B5323" />
          {/* <meshStandardMaterial map={texture}/> */}
        </mesh>
      )}
      {(buildMode || shopMode) && (
        <Grid infiniteGrid fadeDistance={50} fadeStrength={5} />
      )}
      {!buildMode &&
        characters.map((character) => (
          <Suspense key={character.session + "-" + character.id}>
            <group>
              <Avatar
                id={character.id}
                position={gridToVector3(character.position)}
                hairColor={character.hairColor}
                topColor={character.topColor}
                bottomColor={character.bottomColor}
                avatarUrl={character.avatarUrl}
              />
            </group>
          </Suspense>
        ))}
    </>
  );
};

