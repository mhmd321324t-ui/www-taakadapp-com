import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

function Mosque() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  const purple = new THREE.Color('hsl(270, 60%, 45%)');
  const teal = new THREE.Color('hsl(175, 70%, 40%)');
  const gold = new THREE.Color('hsl(43, 90%, 55%)');
  const darkPurple = new THREE.Color('hsl(270, 50%, 25%)');

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef} position={[0, -0.5, 0]}>
        {/* Main body */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[2, 0.8, 1.2]} />
          <meshStandardMaterial color={purple} metalness={0.3} roughness={0.4} />
        </mesh>

        {/* Base platform */}
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[2.4, 0.1, 1.6]} />
          <meshStandardMaterial color={darkPurple} metalness={0.5} roughness={0.3} />
        </mesh>

        {/* Main dome */}
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={teal} metalness={0.6} roughness={0.2} />
        </mesh>

        {/* Dome base ring */}
        <mesh position={[0, 0.82, 0]}>
          <cylinderGeometry args={[0.52, 0.52, 0.05, 32]} />
          <meshStandardMaterial color={gold} metalness={0.8} roughness={0.1} />
        </mesh>

        {/* Main dome crescent */}
        <mesh position={[0, 1.75, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color={gold} metalness={0.9} roughness={0.1} emissive={gold} emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, 1.65, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.15, 8]} />
          <meshStandardMaterial color={gold} metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Left minaret */}
        <mesh position={[-1.15, 0.7, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 1.4, 12]} />
          <meshStandardMaterial color={purple} metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[-1.15, 1.5, 0]}>
          <coneGeometry args={[0.12, 0.3, 12]} />
          <meshStandardMaterial color={teal} metalness={0.6} roughness={0.2} />
        </mesh>
        <mesh position={[-1.15, 1.7, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color={gold} metalness={0.9} roughness={0.1} emissive={gold} emissiveIntensity={0.5} />
        </mesh>

        {/* Right minaret */}
        <mesh position={[1.15, 0.7, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 1.4, 12]} />
          <meshStandardMaterial color={purple} metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[1.15, 1.5, 0]}>
          <coneGeometry args={[0.12, 0.3, 12]} />
          <meshStandardMaterial color={teal} metalness={0.6} roughness={0.2} />
        </mesh>
        <mesh position={[1.15, 1.7, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color={gold} metalness={0.9} roughness={0.1} emissive={gold} emissiveIntensity={0.5} />
        </mesh>

        {/* Door arch */}
        <mesh position={[0, 0.35, 0.61]}>
          <boxGeometry args={[0.3, 0.45, 0.02]} />
          <meshStandardMaterial color={darkPurple} metalness={0.4} roughness={0.3} />
        </mesh>

        {/* Side domes */}
        {[-0.55, 0.55].map((x) => (
          <group key={`dome-${x}`}>
            <mesh position={[x, 1.0, 0]}>
              <sphereGeometry args={[0.22, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={teal} metalness={0.5} roughness={0.25} />
            </mesh>
            <mesh position={[x, 1.22, 0]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial color={gold} metalness={0.9} roughness={0.1} emissive={gold} emissiveIntensity={0.3} />
            </mesh>
          </group>
        ))}

        {/* Windows */}
        {[-0.6, -0.3, 0.3, 0.6].map((x) => (
          <mesh key={`win-${x}`} position={[x, 0.5, 0.61]}>
            <boxGeometry args={[0.08, 0.15, 0.01]} />
            <meshStandardMaterial color={gold} metalness={0.7} roughness={0.1} emissive={gold} emissiveIntensity={0.2} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

export default function MosqueScene() {
  return (
    <div className="three-canvas-container" style={{ height: '280px' }}>
      <Canvas
        camera={{ position: [0, 1.5, 4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 8, 5]} intensity={1} color="#fff" />
          <directionalLight position={[-3, 4, -2]} intensity={0.3} color="hsl(175, 70%, 60%)" />
          <pointLight position={[0, 3, 2]} intensity={0.5} color="hsl(270, 60%, 65%)" />
          <Stars radius={50} depth={30} count={300} factor={3} saturation={0.5} speed={0.5} />
          <Mosque />
        </Suspense>
      </Canvas>
    </div>
  );
}
