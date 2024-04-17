import { useCursor, useGLTF, useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useAtom } from "jotai";
import { useMemo, useRef, useState } from "react";
import { SkeletonUtils } from "three-stdlib";
import { useGrid } from "../hooks/useGrid";
import { itemsAtom, mapAtom } from "./SocketManager";

// props 其余参数
const ShopItem = ({ item, ...props }) => {
  const { name, size, rotation } = item;  // 提取item对象的name和size
  const { scene } = useGLTF(`/models/items/${name}.glb`);
// 复制Item.jsx中实现的逻辑即可
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { gridToVector3 } = useGrid();// useGrid 自定义的hook
  const [hover, setHover] = useState(false);
  useCursor(hover);// 根据悬停改变光标
  return (
    <group {...props}>
      <group
        position={gridToVector3([0, 0], size[0], size[1])}
        rotation-y={((rotation || 0) * Math.PI) / 2}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
      >
        <primitive object={clone} />
      </group>
    </group>
  );
};

// 列出所有的物品
export const Shop = ({ onItemSelected }) => {
  const [items] = useAtom(itemsAtom);
  const [map] = useAtom(mapAtom);

  const maxX = useRef(0);

  const shopItems = useMemo(() => {
    let x = 0;
    return Object.values(items).map((item, index) => {
      const xPos = x; //存当前物品的位置
      x += item.size[0] / map.gridDivision + 1;
      maxX.current = x;
      return (
        <ShopItem
          key={index}
          position-x={xPos}
          item={item}
          onClick={(e) => {
            e.stopPropagation();  // 拖动物品，同时禁止掉相关的点击事件，避免误触
            onItemSelected(item);
          }}
        />
      );
    });
  }, [items]);

  const shopContainer = useRef(); // 获取group元素
  const scrollData = useScroll();  // 获取滚动条数据
  const scale = 0.42; 
 
  // 实现滚动条滚动，items展示也随着移动
  // 滚动偏移量映射到整个<group>元素的x范围 因为是让前面的方框向负半轴移动所以乘负

  useFrame(() => {
    shopContainer.current.position.x =
      -scrollData.offset * maxX.current * scale;
  });
  return (
    <group ref={shopContainer} scale={scale}>
      {shopItems}
    </group>
  );
};