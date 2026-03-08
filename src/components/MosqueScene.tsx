import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

function Kaaba() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12;
    }
  });

  const black = new THREE.Color('#1a1a1a');
  const goldTrim = new THREE.Color('#d4a843');
  const darkGold = new THREE.Color('#b8922e');
  const marble = new THREE.Color('#e8e0d0');
  const lightMarble = new THREE.Color('#f5f0e8');
  const darkMarble = new THREE.Color('#c4b8a0');
  const groundColor = new THREE.Color('#d6cfc0');

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
      <group ref={groupRef} position={[0, -0.8, 0]}>
        {/* Ground / Mataf (circular tawaf area) */}
        <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[3.5, 64]} />
          <meshStandardMaterial color={marble} metalness={0.1} roughness={0.6} />
        </mesh>
        {/* Inner circle ring */}
        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.8, 2.0, 64]} />
          <meshStandardMaterial color={darkMarble} metalness={0.1} roughness={0.5} />
        </mesh>
        {/* Outer circle ring */}
        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.8, 3.0, 64]} />
          <meshStandardMaterial color={darkMarble} metalness={0.1} roughness={0.5} />
        </mesh>

        {/* Kaaba - main black cube */}
        <mesh position={[0, 0.65, 0]}>
          <boxGeometry args={[1.1, 1.3, 1.1]} />
          <meshStandardMaterial color={black} metalness={0.2} roughness={0.7} />
        </mesh>

        {/* Gold band (Hizam) - around the top third */}
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((rot, i) => (
          <mesh key={`band-${i}`} position={[
            Math.sin(rot) * 0.551,
            0.85,
            Math.cos(rot) * 0.551
          ]} rotation={[0, rot, 0]}>
            <planeGeometry args={[1.12, 0.08]} />
            <meshStandardMaterial
              color={goldTrim}
              metalness={0.8}
              roughness={0.15}
              emissive={goldTrim}
              emissiveIntensity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}

        {/* Gold calligraphy panels below band */}
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((rot, i) => (
          <mesh key={`panel-${i}`} position={[
            Math.sin(rot) * 0.552,
            0.65,
            Math.cos(rot) * 0.552
          ]} rotation={[0, rot, 0]}>
            <planeGeometry args={[0.35, 0.45]} />
            <meshStandardMaterial
              color={darkGold}
              metalness={0.7}
              roughness={0.2}
              emissive={darkGold}
              emissiveIntensity={0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}

        {/* Kaaba door (gold) */}
        <mesh position={[0.02, 0.55, 0.556]}>
          <planeGeometry args={[0.25, 0.4]} />
          <meshStandardMaterial
            color={goldTrim}
            metalness={0.85}
            roughness={0.1}
            emissive={goldTrim}
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Door frame */}
        <mesh position={[0.02, 0.55, 0.557]}>
          <planeGeometry args={[0.28, 0.43]} />
          <meshStandardMaterial
            color={darkGold}
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>

        {/* Hajr Ismail (Hateem) - semicircular wall */}
        {Array.from({ length: 20 }).map((_, i) => {
          const angle = (Math.PI * 0.05) + (i / 19) * Math.PI * 0.9;
          const radius = 1.0;
          const x = Math.cos(angle) * radius;
          const z = -Math.sin(angle) * radius + 0.1;
          return (
            <mesh key={`hateem-${i}`} position={[x, 0.2, z]}>
              <boxGeometry args={[0.12, 0.4, 0.06]} />
              <meshStandardMaterial color={lightMarble} metalness={0.1} roughness={0.4} />
            </mesh>
          );
        })}

        {/* Minarets - 4 corners (simplified, tall and white) */}
        {[
          [-2.2, 0, -2.2],
          [2.2, 0, -2.2],
          [-2.2, 0, 2.2],
          [2.2, 0, 2.2],
        ].map(([x, , z], i) => (
          <group key={`minaret-${i}`} position={[x, 0, z]}>
            {/* Base */}
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.1, 0.12, 0.6, 12]} />
              <meshStandardMaterial color={lightMarble} metalness={0.15} roughness={0.35} />
            </mesh>
            {/* Shaft */}
            <mesh position={[0, 1.2, 0]}>
              <cylinderGeometry args={[0.06, 0.08, 1.6, 12]} />
              <meshStandardMaterial color={lightMarble} metalness={0.15} roughness={0.35} />
            </mesh>
            {/* Balcony ring */}
            <mesh position={[0, 0.9, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />
              <meshStandardMaterial color={darkMarble} metalness={0.2} roughness={0.3} />
            </mesh>
            {/* Top cone */}
            <mesh position={[0, 2.15, 0]}>
              <coneGeometry args={[0.07, 0.25, 12]} />
              <meshStandardMaterial color={lightMarble} metalness={0.2} roughness={0.3} />
            </mesh>
            {/* Crescent */}
            <mesh position={[0, 2.35, 0]}>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshStandardMaterial color={goldTrim} metalness={0.9} roughness={0.1} emissive={goldTrim} emissiveIntensity={0.4} />
            </mesh>
          </group>
        ))}

        {/* Surrounding arcade arches (simplified pillars) */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const radius = 3.2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          return (
            <mesh key={`pillar-${i}`} position={[x, 0.4, z]}>
              <cylinderGeometry args={[0.04, 0.05, 0.8, 8]} />
              <meshStandardMaterial color={lightMarble} metalness={0.1} roughness={0.4} />
            </mesh>
          );
        })}
      </group>
    </Float>
  );
}

export default function MosqueScene() {
  return (
    <div className="three-canvas-container" style={{ height: '300px' }}>
      <Canvas
        camera={{ position: [0, 2.5, 5], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} color="#fff8e8" />
          <directionalLight position={[-4, 6, -3]} intensity={0.4} color="#ffe8c0" />
          <pointLight position={[0, 4, 0]} intensity={0.6} color="#d4a843" />
          <Stars radius={60} depth={40} count={200} factor={2} saturation={0.3} speed={0.3} />
          <Kaaba />
        </Suspense>
      </Canvas>
    </div>
  );
}
