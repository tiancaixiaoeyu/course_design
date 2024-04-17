import { useCursor, useGLTF } from "@react-three/drei";
import { mapAtom } from "./SocketManager";
import { useAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { SkeletonUtils } from "three-stdlib";
import { useGrid } from "../hooks/useGrid";
import { buildModeAtom } from "./UI";
 

export const Item = ({
   item,
   onClick,
   isDragging,
   dragPosition,
   canDrop,
   dragRotation,
 }) => {
   const { name, gridPosition, size, rotation: itemRotation } = item;
 
   const rotation = isDragging ? dragRotation : itemRotation;
   const { gridToVector3 } = useGrid();
   const [map] = useAtom(mapAtom);
   const { scene } = useGLTF(`/models/items/${name}.glb`);
   const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
   const width = rotation === 1 || rotation === 3 ? size[1] : size[0];
   const height = rotation === 1 || rotation === 3 ? size[0] : size[1];
   const [hover, setHover] = useState(false);
   const [buildMode] = useAtom(buildModeAtom);
    //如果处于构建状态，使用悬停值，否则不应用
   useCursor(buildMode ? hover : undefined);
 
    //在组件上加上物体+人物阴影
   useEffect(() => {
     // 克隆网格
     clone.traverse((child) => {
       if (child.isMesh) {
         child.castShadow = true;
         child.receiveShadow = true;
       }
     });
   }, []);
 
   return (
     <group
       onClick={onClick}
       position={gridToVector3(
         isDragging ? dragPosition || gridPosition : gridPosition,
         width,
         height
       )}
       onPointerEnter={() => setHover(true)}
       onPointerLeave={() => setHover(false)}
     >
       <primitive object={clone} rotation-y={((rotation || 0) * Math.PI) / 2} />
       {isDragging && (
         <mesh>
           <boxGeometry
             args={[width / map.gridDivision, 0.2, height / map.gridDivision]}
           />
           <meshBasicMaterial
             color={canDrop ? "green" : "red"}
             opacity={0.3}
             transparent
           />
         </mesh>
       )}
     </group>
   );
 };
 