import { mapAtom } from "../components/SocketManager";
import { useAtom } from "jotai";
import * as THREE from 'three';

export const useGrid = () =>{
    const [map] = useAtom(mapAtom);
    // 向量坐标-->三维坐标
    const vector3ToGrid = (Vector3) =>{
     return[
        Math.floor(Vector3.x * map.gridDivision),
        Math.floor(Vector3.z * map.gridDivision),
     ];
    };
    // 三维坐标-->向量坐标
    const gridToVector3 = (gridPosition,width=1,height=1) =>{
        return new THREE.Vector3(
            width / map.gridDivision / 2 + gridPosition[0] / map.gridDivision,
            0,
            height / map.gridDivision / 2 + gridPosition[1] / map.gridDivision
        );
    };

    return {
        vector3ToGrid,
        gridToVector3
    };
};