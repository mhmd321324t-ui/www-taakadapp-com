import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

/* ── Golden Particles (dust/light motes) ── */
function GoldenParticles({ count = 600 }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = Math.random() * 25;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.015;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffd966"
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* ── Kaaba ── */
function Kaaba() {
  const kaabaMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0a0a0a',
    roughness: 0.8,
    metalness: 0.1,
  }), []);

  const goldTrimMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#c9a23c',
    emissive: '#8b6914',
    emissiveIntensity: 0.3,
    metalness: 0.9,
    roughness: 0.15,
  }), []);

  return (
    <group position={[0, 0, 0]}>
      {/* Main Kaaba body */}
      <mesh position={[0, 1.5, 0]} material={kaabaMat}>
        <boxGeometry args={[3, 3, 3]} />
      </mesh>
      {/* Gold band (kiswa border) */}
      <mesh position={[0, 2.6, 0]} material={goldTrimMat}>
        <boxGeometry args={[3.05, 0.25, 3.05]} />
      </mesh>
      {/* Gold band lower */}
      <mesh position={[0, 2.2, 0]} material={goldTrimMat}>
        <boxGeometry args={[3.03, 0.05, 3.03]} />
      </mesh>
      {/* Door (gold) */}
      <mesh position={[1.51, 1.8, 0]} material={goldTrimMat}>
        <boxGeometry args={[0.05, 1.4, 0.9]} />
      </mesh>
      {/* Hajr Ismail (semi-circular wall) */}
      <mesh position={[-2.5, 0.4, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[1.8, 0.15, 8, 32, Math.PI]} />
        <meshStandardMaterial color="#d4c5a0" roughness={0.6} metalness={0.2} />
      </mesh>
    </group>
  );
}

/* ── Minaret (Masjid al-Haram style) ── */
function Minaret({ position, height = 12 }: { position: [number, number, number]; height?: number }) {
  const stoneMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#e8dcc8',
    roughness: 0.7,
    metalness: 0.1,
  }), []);

  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#c9a23c',
    emissive: '#8b6914',
    emissiveIntensity: 0.2,
    metalness: 0.85,
    roughness: 0.15,
  }), []);

  const s = height / 12;

  return (
    <group position={position} scale={[s, s, s]}>
      {/* Base */}
      <mesh position={[0, 1, 0]} material={stoneMat}>
        <cylinderGeometry args={[0.6, 0.8, 2, 12]} />
      </mesh>
      {/* Main shaft */}
      <mesh position={[0, 5, 0]} material={stoneMat}>
        <cylinderGeometry args={[0.4, 0.55, 6, 12]} />
      </mesh>
      {/* Balcony 1 */}
      <mesh position={[0, 4, 0]} material={goldMat}>
        <cylinderGeometry args={[0.7, 0.65, 0.15, 16]} />
      </mesh>
      {/* Balcony railing posts */}
      {Array.from({ length: 16 }).map((_, i) => (
        <mesh key={i} position={[
          Math.cos(i * Math.PI / 8) * 0.65,
          4.2,
          Math.sin(i * Math.PI / 8) * 0.65,
        ]} material={goldMat}>
          <boxGeometry args={[0.025, 0.25, 0.025]} />
        </mesh>
      ))}
      {/* Balcony 2 */}
      <mesh position={[0, 7, 0]} material={goldMat}>
        <cylinderGeometry args={[0.6, 0.55, 0.12, 16]} />
      </mesh>
      {/* Upper shaft */}
      <mesh position={[0, 9, 0]} material={stoneMat}>
        <cylinderGeometry args={[0.25, 0.35, 3.5, 12]} />
      </mesh>
      {/* Dome */}
      <mesh position={[0, 11, 0]} material={goldMat}>
        <sphereGeometry args={[0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      {/* Crescent pole */}
      <mesh position={[0, 11.6, 0]} material={goldMat}>
        <cylinderGeometry args={[0.015, 0.015, 0.6, 6]} />
      </mesh>
      {/* Crescent */}
      <mesh position={[0, 12, 0]} rotation={[0, 0, Math.PI / 6]} material={goldMat}>
        <torusGeometry args={[0.12, 0.025, 8, 24, Math.PI * 1.5]} />
      </mesh>
    </group>
  );
}

/* ── Arches (colonnade) ── */
function Colonnade({ radius = 10, count = 24, height = 4 }: { radius?: number; count?: number; height?: number }) {
  const stoneMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#e0d4be',
    roughness: 0.65,
    metalness: 0.1,
  }), []);

  return (
    <group>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <group key={i} position={[x, 0, z]} rotation={[0, -angle + Math.PI / 2, 0]}>
            {/* Column */}
            <mesh position={[0, height / 2, 0]} material={stoneMat}>
              <cylinderGeometry args={[0.15, 0.18, height, 8]} />
            </mesh>
            {/* Arch top */}
            <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]} material={stoneMat}>
              <torusGeometry args={[0.5, 0.08, 8, 12, Math.PI]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ── Mataf (circular tawaf area) ── */
function Mataf() {
  return (
    <group>
      {/* White marble floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[3.5, 8, 64]} />
        <meshStandardMaterial color="#f0ece4" roughness={0.3} metalness={0.05} />
      </mesh>
      {/* Tawaf path lines */}
      {[4, 5.5, 7].map((r, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[r - 0.02, r + 0.02, 64]} />
          <meshStandardMaterial color="#c9a23c" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Ground ── */
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <circleGeometry args={[50, 64]} />
      <meshStandardMaterial color="#1a1520" roughness={0.9} metalness={0} />
    </mesh>
  );
}

/* ── Animated scene lights ── */
function SceneLights() {
  const spotRef = useRef<THREE.PointLight>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (spotRef.current) {
      spotRef.current.intensity = 1.5 + Math.sin(t * 0.5) * 0.5;
    }
  });

  return (
    <>
      <ambientLight intensity={0.2} color="#c4b896" />
      <directionalLight position={[10, 15, 5]} intensity={0.6} color="#fff5e0" castShadow />
      <pointLight ref={spotRef} position={[0, 8, 0]} color="#ffd966" intensity={2} distance={30} />
      <pointLight position={[8, 5, 8]} color="#00cccc" intensity={0.4} distance={25} />
      <pointLight position={[-8, 5, -8]} color="#ffc080" intensity={0.4} distance={25} />
    </>
  );
}

/* ── Camera auto-rotate ── */
function CameraRig() {
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime() * 0.06;
    const radius = 18;
    camera.position.x = Math.sin(t) * radius;
    camera.position.z = Math.cos(t) * radius;
    camera.position.y = 7 + Math.sin(t * 0.3) * 2;
    camera.lookAt(0, 3, 0);
  });
  return null;
}

/* ── Main Scene ── */
export default function MinaretScene() {
  return (
    <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [18, 7, 0], fov: 40 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#030514' }}
      >
        <fog attach="fog" args={['#030514', 20, 55]} />
        <color attach="background" args={['#030514']} />

        <Stars radius={80} depth={60} count={1500} factor={3} saturation={0.1} fade speed={0.5} />

        <Kaaba />
        <Mataf />
        <Colonnade />

        {/* 4 main minarets */}
        <Minaret position={[-9, 0, -9]} height={14} />
        <Minaret position={[9, 0, -9]} height={14} />
        <Minaret position={[-9, 0, 9]} height={14} />
        <Minaret position={[9, 0, 9]} height={14} />

        {/* 2 smaller side minarets */}
        <Minaret position={[-12, 0, 0]} height={10} />
        <Minaret position={[12, 0, 0]} height={10} />

        <GoldenParticles />
        <Ground />
        <SceneLights />
        <CameraRig />
      </Canvas>
    </div>
  );
}
