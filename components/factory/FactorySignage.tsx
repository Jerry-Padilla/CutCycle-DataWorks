"use client";

import { useEffect, useMemo } from "react";
import { CanvasTexture, LinearFilter, SRGBColorSpace } from "three";
import { FACTORY_SIGNAGE, type FactorySignLayout } from "@/lib/factory/layout";

function createSignTexture(sign: FactorySignLayout) {
  const canvas = document.createElement("canvas");
  canvas.width = 1536;
  canvas.height = sign.primary ? 320 : 256;
  const context = canvas.getContext("2d");
  if (!context) return new CanvasTexture(canvas);

  context.fillStyle = "#111b22";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = sign.accent;
  context.fillRect(0, 0, canvas.width, 18);
  context.strokeStyle = "#718995";
  context.lineWidth = 8;
  context.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);
  context.fillStyle = "#e5f0f4";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `800 ${sign.primary ? 88 : 82}px Arial, sans-serif`;
  context.fillText(sign.label, canvas.width / 2, canvas.height * 0.53, canvas.width - 110);
  if (sign.primary) {
    context.fillStyle = "#89a5b3";
    context.font = "600 29px monospace";
    context.fillText("AUTOMATION · MACHINING · INSPECTION", canvas.width / 2, canvas.height * 0.79);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  return texture;
}

function FactorySign({ sign }: { sign: FactorySignLayout }) {
  const texture = useMemo(() => createSignTexture(sign), [sign]);
  useEffect(() => () => texture.dispose(), [texture]);
  const height = sign.primary ? 2.2 : 1.2;
  return (
    <group position={sign.position} rotation={[0, sign.rotationY ?? 0, 0]} userData={{ factorySign: sign.id }}>
      <mesh castShadow><boxGeometry args={[sign.width, height, 0.14]} /><meshStandardMaterial color="#26343c" metalness={0.72} roughness={0.28} /></mesh>
      <mesh position={[0, 0, 0.076]}><planeGeometry args={[sign.width - 0.14, height - 0.14]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
      {sign.primary && [-sign.width * 0.39, sign.width * 0.39].map((x) => <mesh key={x} position={[x, -3.1, 0]} castShadow><boxGeometry args={[0.18, 5.2, 0.18]} /><meshStandardMaterial color="#53636b" metalness={0.78} roughness={0.3} /></mesh>)}
    </group>
  );
}

export function FactorySignage() {
  return <>{FACTORY_SIGNAGE.map((sign) => <FactorySign key={sign.id} sign={sign} />)}</>;
}
