import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

/* ── Golden Particles ── */
function GoldenParticles({ count = 800 }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 1] = Math.random() * 20 - 2;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.03;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#ffd966"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* ── Minaret (geometric) ── */
function Minaret({ position = [0, 0, 0] as [number, number, number], scale = 1 }) {
  const cyanMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#00cccc',
    emissive: '#004444',
    metalness: 0.6,
    roughness: 0.3,
  }), []);

  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffd966',
    emissive: '#665500',
    metalness: 0.8,
    roughness: 0.2,
  }), []);

  const darkMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0a1428',
    emissive: '#001122',
    metalness: 0.5,
    roughness: 0.4,
  }), []);

  return (
    <group position={position} scale={scale}>
      {/* Base */}
      <mesh position={[0, 0.6, 0]} material={darkMat}>
        <cylinderGeometry args={[0.7, 0.85, 1.2, 8]} />
      </mesh>
      {/* Base ring */}
      <mesh position={[0, 1.2, 0]} material={goldMat}>
        <torusGeometry args={[0.72, 0.06, 8, 24]} />
      </mesh>

      {/* Main shaft */}
      <mesh position={[0, 3.8, 0]} material={cyanMat}>
        <cylinderGeometry args={[0.45, 0.6, 4, 8]} />
      </mesh>

      {/* Decorative ribs */}
      {[0, 1, 2, 3].map(i => (
        <mesh key={i} position={[
          Math.cos(i * Math.PI / 2) * 0.5,
          3.8,
          Math.sin(i * Math.PI / 2) * 0.5,
        ]} material={goldMat}>
          <boxGeometry args={[0.04, 3.6, 0.04]} />
        </mesh>
      ))}

      {/* Balcony */}
      <mesh position={[0, 5.9, 0]} material={goldMat}>
        <cylinderGeometry args={[0.8, 0.75, 0.15, 16]} />
      </mesh>
      {/* Balcony fence posts */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={`f${i}`} position={[
          Math.cos(i * Math.PI / 6) * 0.75,
          6.1,
          Math.sin(i * Math.PI / 6) * 0.75,
        ]} material={goldMat}>
          <boxGeometry args={[0.03, 0.3, 0.03]} />
        </mesh>
      ))}

      {/* Upper shaft */}
      <mesh position={[0, 7, 0]} material={cyanMat}>
        <cylinderGeometry args={[0.25, 0.4, 2, 8]} />
      </mesh>

      {/* Dome */}
      <mesh position={[0, 8.3, 0]} material={goldMat}>
        <sphereGeometry args={[0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>

      {/* Crescent pole */}
      <mesh position={[0, 8.9, 0]} material={goldMat}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 6]} />
      </mesh>

      {/* Crescent */}
      <mesh position={[0, 9.3, 0]} rotation={[0, 0, Math.PI / 6]} material={goldMat}>
        <torusGeometry args={[0.15, 0.03, 8, 24, Math.PI * 1.5]} />
      </mesh>
    </group>
  );
}

/* ── Small pillar ── */
function SmallPillar({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 1.6, 6]} />
        <meshStandardMaterial color="#0a2030" emissive="#002233" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.14, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#ffd966" emissive="#665500" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

/* ── Floating shapes ── */
function FloatingShapes() {
  const colors = ['#00ffff', '#ffd966', '#ff6699'];
  return (
    <>
      {colors.map((color, i) => (
        <Float key={i} speed={1.5} rotationIntensity={2} floatIntensity={2}>
          <mesh position={[
            -4 + i * 4,
            5 + Math.sin(i * 2) * 2,
            -3 - i,
          ]}>
            <octahedronGeometry args={[0.3]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.4}
              transparent
              opacity={0.6}
              wireframe
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

/* ── Ground ── */
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial
        color="#030514"
        emissive="#001122"
        emissiveIntensity={0.2}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  );
}

/* ── Animated lights ── */
function AnimatedLights() {
  const ref1 = useRef<THREE.PointLight>(null!);
  const ref2 = useRef<THREE.PointLight>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref1.current) {
      ref1.current.position.x = Math.sin(t * 0.3) * 6;
      ref1.current.position.z = Math.cos(t * 0.3) * 6;
    }
    if (ref2.current) {
      ref2.current.position.x = Math.cos(t * 0.2) * 5;
      ref2.current.position.z = Math.sin(t * 0.2) * 5;
    }
  });

  return (
    <>
      <pointLight ref={ref1} position={[4, 6, 4]} color="#00ffff" intensity={2} distance={20} />
      <pointLight ref={ref2} position={[-4, 4, -4]} color="#ffd966" intensity={1.5} distance={20} />
      <pointLight position={[0, 10, 0]} color="#ff6699" intensity={0.5} distance={15} />
    </>
  );
}

/* ── Camera auto-rotate ── */
function CameraRig() {
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime() * 0.08;
    const radius = 14;
    camera.position.x = Math.sin(t) * radius;
    camera.position.z = Math.cos(t) * radius;
    camera.position.y = 5 + Math.sin(t * 0.5) * 1.5;
    camera.lookAt(0, 4, 0);
  });
  return null;
}

/* ── Main Scene ── */
export default function MinaretScene() {
  return (
    <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [14, 5, 0], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <fog attach="fog" args={['#030514', 10, 30]} />
        <ambientLight intensity={0.15} />
        <directionalLight position={[5, 10, 5]} intensity={0.4} color="#aaddff" />

        <Minaret />
        <SmallPillar position={[-3, 0, -2]} />
        <SmallPillar position={[3, 0, -2]} />
        <SmallPillar position={[-2, 0, 3]} />
        <SmallPillar position={[2, 0, 3]} />

        <GoldenParticles />
        <FloatingShapes />
        <Ground />
        <AnimatedLights />
        <CameraRig />
      </Canvas>
    </div>
  );
}
