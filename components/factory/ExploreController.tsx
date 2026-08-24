"use client";

/* eslint-disable react-hooks/immutability -- Three.js camera transforms are intentionally mutated inside R3F's frame loop. */

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Euler, Raycaster, Vector2, Vector3, type Object3D } from "three";
import { useFactoryStore } from "@/store/useFactoryStore";
import type { MachineId } from "@/types/factory";

function findMachine(object: Object3D | null): MachineId | null {
  let current = object;
  while (current) {
    if (current.userData.machineId) return current.userData.machineId as MachineId;
    current = current.parent;
  }
  return null;
}

export function ExploreController() {
  const { camera, gl, scene } = useThree();
  const setExplore = useFactoryStore((state) => state.setExploreMode);
  const selectMachine = useFactoryStore((state) => state.selectMachine);
  const keys = useRef(new Set<string>());
  const mobileMove = useRef({ x:0,y:0 });
  const angles = useRef({ yaw:0,pitch:0 });
  const dragging = useRef<{x:number;y:number}|null>(null);
  const raycaster = useRef(new Raycaster());

  useEffect(() => {
    camera.position.set(1,1.7,8.5);
    camera.lookAt(0,1.5,0);
    const euler = new Euler().setFromQuaternion(camera.quaternion, "YXZ");
    angles.current = { yaw:euler.y,pitch:euler.x };
    const canvas = gl.domElement;
    const interact = () => {
      raycaster.current.setFromCamera(new Vector2(0,0), camera);
      const hit = raycaster.current.intersectObjects(scene.children,true).find((item) => findMachine(item.object));
      const machineId = findMachine(hit?.object ?? null);
      if (machineId) selectMachine(machineId);
    };
    const keyDown = (event: KeyboardEvent) => { keys.current.add(event.key.toLowerCase()); if (event.key.toLowerCase()==="e") interact(); if (event.key==="Escape") setExplore(false); };
    const keyUp = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase());
    const mouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return;
      angles.current.yaw -= event.movementX*.0022; angles.current.pitch = Math.max(-1.3,Math.min(1.3,angles.current.pitch-event.movementY*.0022));
    };
    const lock = () => { if (!window.matchMedia("(pointer: coarse)").matches) void canvas.requestPointerLock(); };
    const touchStart = (event: PointerEvent) => { if (event.pointerType !== "mouse") dragging.current={x:event.clientX,y:event.clientY}; };
    const touchMove = (event: PointerEvent) => { if (!dragging.current) return; angles.current.yaw -= (event.clientX-dragging.current.x)*.006; angles.current.pitch=Math.max(-1.3,Math.min(1.3,angles.current.pitch-(event.clientY-dragging.current.y)*.006)); dragging.current={x:event.clientX,y:event.clientY}; };
    const touchEnd = () => { dragging.current=null; };
    const move = (event: Event) => { mobileMove.current=(event as CustomEvent<{x:number;y:number}>).detail; };
    window.addEventListener("keydown",keyDown); window.addEventListener("keyup",keyUp); window.addEventListener("mousemove",mouseMove);
    window.addEventListener("factoryos-move",move); window.addEventListener("factoryos-interact",interact);
    canvas.addEventListener("click",lock); canvas.addEventListener("pointerdown",touchStart); canvas.addEventListener("pointermove",touchMove); canvas.addEventListener("pointerup",touchEnd);
    return () => {
      if (document.pointerLockElement===canvas) document.exitPointerLock();
      window.removeEventListener("keydown",keyDown); window.removeEventListener("keyup",keyUp); window.removeEventListener("mousemove",mouseMove);
      window.removeEventListener("factoryos-move",move); window.removeEventListener("factoryos-interact",interact);
      canvas.removeEventListener("click",lock); canvas.removeEventListener("pointerdown",touchStart); canvas.removeEventListener("pointermove",touchMove); canvas.removeEventListener("pointerup",touchEnd);
    };
  }, [camera,gl,scene,selectMachine,setExplore]);

  useFrame((_,delta) => {
    camera.rotation.set(angles.current.pitch,angles.current.yaw,0,"YXZ");
    const forward = Number(keys.current.has("w"))-Number(keys.current.has("s"))-mobileMove.current.y;
    const side = Number(keys.current.has("d"))-Number(keys.current.has("a"))+mobileMove.current.x;
    const direction = new Vector3(side,0,-forward).applyAxisAngle(new Vector3(0,1,0),angles.current.yaw).multiplyScalar(delta*4.2);
    camera.position.add(direction);
    camera.position.x=Math.max(-15.5,Math.min(15.5,camera.position.x)); camera.position.z=Math.max(-9.5,Math.min(9.5,camera.position.z)); camera.position.y=1.7;
  });
  return null;
}
