import { useAnimations, useGLTF } from "@react-three/drei";
import { useAtom } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import { avatarUrlAtom } from '../store/atoms';

export function LobbyAvatar({ ...props }) {
  const [avatarUrl] = useAtom(avatarUrlAtom);
  const avatar = useRef();
  const group = useRef();
  const { scene } = useGLTF(avatarUrl);

  // 加载动画模型
  const { animations: waveAnimation } = useGLTF(
    "/animations/untitled.glb"
  );
  const { animations: idleAnimation } = useGLTF(
    "/animations/M_Standing_Idle_001.glb"
  );
  // 绑定动画对象
  const { actions } = useAnimations(
    [waveAnimation[0], idleAnimation[0]],
    avatar
  );
  // 初始化状态变量
  const [animation, setAnimation] = useState("M_Standing_Idle_001");
  const [init, setInit] = useState(avatarUrl);

  useEffect(() => {
    if (actions[animation]) {
      actions[animation] // 获取动画
        .reset() //重置
        .fadeIn(init === avatarUrl ? 0.32 : 0) 
        .play(); // 播放
    }
    setInit(avatarUrl); // 更新init为当前avatarUrl
    return () => actions[animation]?.fadeOut(0.32); 
  }, [animation, avatarUrl, actions]);
  


// 动画轮播 delay -- expression，6s -- stand，3s --重新执行
  const delayWave = (delay) => {
    setTimeout(() => {
      setAnimation("M_Standing_Expressions_001");
      setTimeout(() => {
        setAnimation("M_Standing_Idle_001");
        delayWave(3000); 
      }, 6000);
    }, delay);
  };

  useEffect(() => {
    delayWave(12);
  }, []);


  // 禁用dispose清理资源，将group组件的引用赋值给group，scene作为原始对象传给primitive
  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={scene} ref={avatar} />
    </group>
  );
}