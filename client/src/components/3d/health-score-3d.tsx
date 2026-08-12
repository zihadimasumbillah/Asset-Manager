/* eslint-disable react/no-unknown-property */
/* eslint-disable react-hooks/refs, react-hooks/purity */
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import type * as THREE from "three";

function HealthScoreRing({ score }: { score: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const safeScore = Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0;

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.2;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    meshRef.current.rotation.y += delta * 0.25;
  });

  return (
    <mesh ref={meshRef} scale={1.8}>
      <torusGeometry args={[1, 0.12, 32, 100]} />
      <meshStandardMaterial
        color={safeScore >= 80 ? "#22c55e" : safeScore >= 60 ? "#f59e0b" : "#ef4444"}
        metalness={0.4}
        roughness={0.3}
      />
    </mesh>
  );
}

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 120;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!particlesRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    particlesRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.1;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#6366f1" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

export function HealthScore3D({ score }: { score: number | null }) {
  if (score === null || !Number.isFinite(score)) return null;

  return (
    <div className="h-[260px] w-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#6366f1" />
        <HealthScoreRing score={score} />
        <ParticleField />
      </Canvas>
    </div>
  );
}
