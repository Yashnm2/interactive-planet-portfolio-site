"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import * as THREE from "three";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const ORANGE = "#ff4d19";
const BLUE = "#176cff";
const BONE = "#f4f1e9";
const STEEL = "#9da6ad";
const DARK_STEEL = "#323a42";

function StudioEnvironment() {
  const { gl, scene } = useThree();

  useEffect(() => {
    const room = new RoomEnvironment();
    const generator = new THREE.PMREMGenerator(gl);
    const environment = generator.fromScene(room, 0.04).texture;
    // Three.js owns this mutable scene graph; the environment is disposed below.
    // eslint-disable-next-line react-hooks/immutability
    scene.environment = environment;
    return () => {
      scene.environment = null;
      environment.dispose();
      generator.dispose();
      room.dispose();
    };
  }, [gl, scene]);

  return null;
}

function Chrome({
  color = STEEL,
  emissive = "#000000",
  emissiveIntensity = 0,
  opacity = 1,
  roughness = 0.12,
  transmission = 0,
}) {
  return (
    <meshPhysicalMaterial
      color={color}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
      metalness={transmission > 0 ? 0.38 : 0.96}
      roughness={roughness}
      clearcoat={1}
      clearcoatRoughness={0.08}
      envMapIntensity={2.25}
      transmission={transmission}
      thickness={1.2}
      transparent={opacity < 1 || transmission > 0}
      opacity={opacity}
    />
  );
}

function Glow({ color, intensity = 4 }) {
  return <meshBasicMaterial color={color} toneMapped={false} transparent opacity={Math.min(1, intensity / 4)} />;
}

function Ring({
  radius,
  tube = 0.08,
  color = STEEL,
  rotation = [0, 0, 0],
  emissive = "#000000",
  emissiveIntensity = 0,
  roughness = 0.12,
}) {
  return (
    <mesh rotation={rotation}>
      <torusGeometry args={[radius, tube, 24, 128]} />
      <Chrome
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        roughness={roughness}
      />
    </mesh>
  );
}

function SegmentedRing({
  radius,
  tube = 0.08,
  segments = 10,
  gap = 0.18,
  color = STEEL,
  rotation = [0, 0, 0],
}) {
  const arc = (Math.PI * 2) / segments - gap;
  return (
    <group rotation={rotation}>
      {Array.from({ length: segments }, (_, index) => (
        <mesh key={index} rotation={[0, 0, index * (Math.PI * 2) / segments]}>
          <torusGeometry args={[radius, tube, 20, 30, arc]} />
          <Chrome color={color} roughness={0.16} />
        </mesh>
      ))}
    </group>
  );
}

function OrbitalPlatform({ accent = ORANGE, radius = 1.7, y = -1.45 }) {
  return (
    <group position={[0, y, 0]}>
      <Ring radius={radius} tube={0.035} color={DARK_STEEL} rotation={[Math.PI / 2, 0, 0]} />
      <Ring radius={radius * 0.76} tube={0.025} color={accent} emissive={accent} emissiveIntensity={0.65} rotation={[Math.PI / 2, 0, 0]} />
      <Ring radius={radius * 0.5} tube={0.02} color="#78818a" rotation={[Math.PI / 2, 0, 0]} />
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[radius * 0.82, radius, 0.08, 64]} />
        <Chrome color="#101419" roughness={0.3} />
      </mesh>
    </group>
  );
}

function SignalCore() {
  const ref = useRef();
  const inner = useRef();

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    ref.current.rotation.y += delta * 0.12;
    ref.current.rotation.x = Math.sin(t * 0.18) * 0.12;
    inner.current.rotation.x -= delta * 0.18;
    inner.current.rotation.z += delta * 0.22;
  });

  return (
    <group ref={ref}>
      <group ref={inner}>
        <Ring radius={0.83} tube={0.16} color="#e5e8ea" rotation={[0.75, 0.22, 0.35]} />
        <Ring radius={1.18} tube={0.09} color={ORANGE} emissive={ORANGE} emissiveIntensity={0.8} rotation={[1.2, 0.1, -0.2]} />
        <mesh>
          <icosahedronGeometry args={[0.62, 3]} />
          <Chrome color="#54160e" emissive={ORANGE} emissiveIntensity={0.6} roughness={0.08} />
        </mesh>
      </group>

      <Ring radius={1.55} tube={0.14} color="#d7dce0" rotation={[0.15, 0.7, 0.28]} />
      <Ring radius={2.04} tube={0.12} color="#8c969e" rotation={[0.9, 0.15, 0.68]} />
      <SegmentedRing radius={2.48} tube={0.1} segments={9} gap={0.24} color="#d5dadd" rotation={[0.42, 0.4, -0.28]} />
      <Ring radius={2.92} tube={0.055} color={BLUE} emissive={BLUE} emissiveIntensity={0.6} rotation={[1.15, -0.25, 0.2]} />
      <Ring radius={3.13} tube={0.035} color="#6f7881" rotation={[0.25, 0.6, 0.92]} />

      <OrbitalPlatform radius={2.7} accent={ORANGE} />
      <pointLight color={ORANGE} intensity={26} distance={11} />
      <pointLight position={[2.7, -1.5, 2.4]} color={BLUE} intensity={14} distance={10} />
      <spotLight position={[2, 5, 5]} color={BONE} intensity={22} distance={16} angle={0.45} penumbra={0.8} />

      {Array.from({ length: 18 }, (_, index) => {
        const angle = (index / 18) * Math.PI * 2;
        const radius = 3.75 + (index % 3) * 0.35;
        return (
          <mesh
            key={index}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle * 2.1) * 1.65,
              Math.sin(angle) * 2.8,
            ]}
            rotation={[angle * 0.7, angle, angle * 0.35]}
            scale={[0.45, 0.13, 0.62]}
          >
            <tetrahedronGeometry args={[0.48 + (index % 4) * 0.07]} />
            <Chrome color={index % 4 === 0 ? "#e7e9e8" : "#6f7880"} roughness={0.09} />
          </mesh>
        );
      })}
    </group>
  );
}

function CrystalTower() {
  return (
    <group>
      {[
        [-0.65, 0, 0, 0.75, 2.4],
        [0.08, 0.28, 0.18, 0.95, 3.2],
        [0.72, -0.12, -0.06, 0.68, 2.1],
        [-0.22, -0.32, 0.54, 0.56, 1.75],
      ].map(([x, y, z, width, height], index) => (
        <mesh
          key={index}
          position={[x, y + height * 0.28, z]}
          scale={[width, height, width]}
          rotation={[0.1 * index, 0.28 * index, 0.08 * index]}
        >
          <octahedronGeometry args={[0.62, 0]} />
          <Chrome color="#bdc5ca" roughness={0.06} transmission={index % 2 ? 0.24 : 0.08} />
        </mesh>
      ))}
    </group>
  );
}

function WorldNode({ type, position, active, onSelect, index }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const accent = type === "interaction" ? BLUE : type === "ai" ? ORANGE : BONE;

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    ref.current.rotation.y += delta * (hovered ? 0.42 : 0.08);
    ref.current.position.y = position[1] + Math.sin(t * 0.42 + index) * 0.1;
    const target = active || hovered ? 0.88 : 0.78;
    ref.current.scale.lerp(new THREE.Vector3(target, target, target), 0.07);
  });

  return (
    <group
      ref={ref}
      position={position}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={() => {
        setHovered(false);
        document.body.style.cursor = "";
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(index, true);
      }}
    >
      <OrbitalPlatform radius={1.3} y={-1.18} accent={accent} />
      <SegmentedRing radius={1.45} tube={0.075} segments={8} gap={0.28} color={active ? accent : "#828b93"} rotation={[0.35, 0.2, 0.12]} />
      {type === "ai" ? (
        <group>
          <mesh rotation={[0.18, 0.48, 0]}>
            <icosahedronGeometry args={[1.05, 1]} />
            <Chrome color="#773126" emissive={ORANGE} emissiveIntensity={active ? 1.3 : 0.35} roughness={0.1} transmission={0.12} />
          </mesh>
          <mesh scale={1.18} rotation={[0.18, 0.48, 0]}>
            <icosahedronGeometry args={[1.05, 1]} />
            <meshBasicMaterial color={ORANGE} wireframe transparent opacity={0.32} toneMapped={false} />
          </mesh>
        </group>
      ) : type === "interaction" ? (
        <group>
          <SegmentedRing radius={1.03} tube={0.12} segments={7} gap={0.22} color="#d8dde0" rotation={[0.42, 0.3, 0.12]} />
          <Ring radius={0.62} tube={0.07} color={BLUE} emissive={BLUE} emissiveIntensity={0.8} rotation={[1.08, 0.2, 0.48]} />
          <mesh>
            <sphereGeometry args={[0.2, 24, 24]} />
            <Glow color={BLUE} />
          </mesh>
        </group>
      ) : (
        <CrystalTower />
      )}
      <pointLight color={accent} intensity={active ? 18 : 7} distance={7} />
    </group>
  );
}

function Constellation({ selected, onSelect, compact = false }) {
  const ref = useRef();

  useFrame((state) => {
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.12) * 0.025;
  });

  return (
    <group ref={ref}>
      <WorldNode type="ai" index={0} position={compact ? [-2.15, 1.55, 0] : [0.25, 2.65, 0]} active={selected === 0} onSelect={onSelect} />
      <WorldNode type="interaction" index={1} position={compact ? [0, 1.45, 0.35] : [-3.45, -1.7, 0.45]} active={selected === 1} onSelect={onSelect} />
      <WorldNode type="craft" index={2} position={compact ? [2.15, 1.55, -0.1] : [3.55, -1.7, -0.2]} active={selected === 2} onSelect={onSelect} />
      <Ring radius={4.35} tube={0.02} color="#59626b" rotation={[Math.PI / 2, 0, 0]} />
      <Ring radius={3.28} tube={0.018} color="#6d392a" rotation={[1.31, 0.2, 0.15]} />
      {Array.from({ length: 10 }, (_, index) => {
        const angle = (index / 10) * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.cos(angle) * 4.4, Math.sin(angle) * 2.8, Math.sin(angle) * 0.35]}>
            <sphereGeometry args={[index % 3 === 0 ? 0.095 : 0.05, 16, 16]} />
            <Glow color={index % 2 ? BONE : ORANGE} />
          </mesh>
        );
      })}
      <pointLight position={[0, 0, 3]} color={BONE} intensity={10} distance={12} />
    </group>
  );
}

function GlassPanel({ position, rotation, scale }) {
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <boxGeometry args={[1, 1, 0.035]} />
      <meshPhysicalMaterial
        color="#8e9ba5"
        metalness={0.18}
        roughness={0.08}
        transmission={0.72}
        thickness={0.4}
        transparent
        opacity={0.33}
        envMapIntensity={1.8}
      />
    </mesh>
  );
}

function ProductMachine({ selected }) {
  const ref = useRef();
  const moving = useRef([]);
  const colors = [ORANGE, BLUE, BONE];
  const accent = colors[selected];

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = Math.sin(t * 0.16) * 0.08;
    moving.current.forEach((ring, index) => {
      if (!ring) return;
      ring.rotation.z += delta * (0.035 + index * 0.012) * (index % 2 ? 1 : -1);
    });
  });

  return (
    <group ref={ref}>
      {[3.55, 3.08, 2.62, 2.15, 1.68, 1.22].map((radius, index) => (
        <group
          key={radius}
          ref={(node) => { moving.current[index] = node; }}
          rotation={[index * 0.16, 0.28, index * 0.23]}
        >
          {index % 2 ? (
            <SegmentedRing
              radius={radius}
              tube={index === 1 ? 0.13 : 0.075}
              segments={10 - (index % 3)}
              gap={0.2}
              color={index === selected + 1 ? accent : index < 2 ? "#d5d9db" : "#76818a"}
            />
          ) : (
            <Ring
              radius={radius}
              tube={index === 2 ? 0.15 : 0.08}
              color={index === selected ? accent : "#9ba4aa"}
              emissive={index === selected ? accent : "#000000"}
              emissiveIntensity={index === selected ? 0.6 : 0}
            />
          )}
        </group>
      ))}

      <mesh rotation={[0.2, 0.35, 0]}>
        {selected === 0 ? (
          <icosahedronGeometry args={[0.92, 3]} />
        ) : selected === 1 ? (
          <torusKnotGeometry args={[0.7, 0.17, 128, 20]} />
        ) : (
          <octahedronGeometry args={[1.02, 0]} />
        )}
        <Chrome color={selected === 0 ? "#5c1c13" : selected === 1 ? "#173067" : "#d4d9dc"} emissive={accent} emissiveIntensity={0.6} roughness={0.08} />
      </mesh>
      <Ring radius={0.82} tube={0.045} color={accent} emissive={accent} emissiveIntensity={0.85} rotation={[1.05, 0.2, 0.35]} />

      <GlassPanel position={[-1.9, 1.25, 1.15]} rotation={[0, 0.15, 0.08]} scale={[1.8, 1.12, 1]} />
      <GlassPanel position={[1.78, 0.65, 1.35]} rotation={[0, -0.12, -0.05]} scale={[1.25, 1.75, 1]} />
      <GlassPanel position={[-1.45, -1.55, 1.2]} rotation={[0, 0.2, -0.06]} scale={[1.35, 0.8, 1]} />

      {Array.from({ length: 24 }, (_, index) => {
        const angle = index * 0.82;
        const radius = 3.75 + (index % 4) * 0.22;
        return (
          <mesh key={index} position={[Math.cos(angle) * radius, Math.sin(angle * 1.6) * 2.25, Math.sin(angle) * 1.45]}>
            <sphereGeometry args={[0.075 + (index % 4) * 0.025, 18, 18]} />
            <Chrome color={index % 7 === 0 ? accent : "#a7afb5"} emissive={index % 7 === 0 ? accent : "#000000"} emissiveIntensity={0.5} />
          </mesh>
        );
      })}
      <pointLight color={accent} intensity={28} distance={13} />
      <spotLight position={[-1, 5, 5]} color={BONE} intensity={25} distance={18} angle={0.45} penumbra={0.9} />
    </group>
  );
}

function VortexLane({ count, phase, color, size = 1 }) {
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    for (let index = 0; index < count; index += 1) {
      const t = index / Math.max(1, count - 1);
      const angle = t * Math.PI * 9.5 + phase;
      const radius = 0.28 + Math.pow(t, 1.15) * 3.8;
      dummy.position.set(
        (t - 0.5) * 13.6,
        (t - 0.5) * 3.2 + Math.sin(angle) * radius * 0.54,
        Math.cos(angle) * radius * 0.72 - t * 2.4,
      );
      dummy.rotation.set(angle * 0.18, angle * 0.5, angle);
      const scale = (0.035 + t * 0.12) * size * (0.75 + (index % 5) * 0.11);
      dummy.scale.set(scale * 4.8, scale, scale * 1.8);
      dummy.updateMatrix();
      ref.current.setMatrixAt(index, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [count, dummy, phase, size]);

  return (
    <instancedMesh ref={ref} args={[null, null, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshPhysicalMaterial
        color={color}
        metalness={0.86}
        roughness={0.17}
        clearcoat={1}
        envMapIntensity={2}
        emissive={color === ORANGE || color === BLUE ? color : "#000000"}
        emissiveIntensity={color === ORANGE || color === BLUE ? 0.75 : 0}
      />
    </instancedMesh>
  );
}

function FragmentVortex() {
  const ref = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    ref.current.rotation.x = Math.sin(t * 0.11) * 0.08;
    ref.current.rotation.z = Math.sin(t * 0.08) * 0.04;
    ref.current.position.x = Math.sin(t * 0.18) * 0.12;
  });

  return (
    <group ref={ref} rotation={[0, -0.18, -0.15]}>
      <VortexLane count={140} phase={0} color="#8d959b" size={1} />
      <VortexLane count={92} phase={1.8} color="#d9d5ca" size={0.82} />
      <VortexLane count={42} phase={3.1} color={ORANGE} size={0.64} />
      <VortexLane count={32} phase={4.4} color={BLUE} size={0.58} />

      <group position={[6.85, 1.75, -2.8]} rotation={[0, 0.45, 0]}>
        <Ring radius={2.1} tube={0.09} color="#d9ddde" />
        <Ring radius={1.65} tube={0.045} color={ORANGE} emissive={ORANGE} emissiveIntensity={0.8} />
        <Ring radius={1.2} tube={0.025} color={BONE} emissive={BONE} emissiveIntensity={0.65} />
        <pointLight color={BONE} intensity={38} distance={12} />
      </group>
      <pointLight position={[2, -1, 2]} color={BLUE} intensity={14} distance={12} />
    </group>
  );
}

function Eclipse() {
  const ref = useRef();
  const droplets = useRef();

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = Math.sin(t * 0.08) * 0.08;
    ref.current.rotation.x = Math.sin(t * 0.1) * 0.035;
    droplets.current.rotation.y += delta * 0.025;
  });

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[2.42, 96, 96]} />
        <meshStandardMaterial color="#000000" metalness={0.18} roughness={0.48} envMapIntensity={0.12} />
      </mesh>
      <Ring radius={2.78} tube={0.29} color="#dce0e2" rotation={[0.06, 0.3, 0.1]} roughness={0.06} />
      <Ring radius={3.08} tube={0.11} color="#9fa8ae" rotation={[0.18, -0.18, -0.12]} roughness={0.08} />
      <Ring radius={3.28} tube={0.032} color={ORANGE} emissive={ORANGE} emissiveIntensity={0.85} rotation={[0.24, 0.08, -0.19]} />
      <Ring radius={3.42} tube={0.018} color={BLUE} emissive={BLUE} emissiveIntensity={0.7} rotation={[-0.12, 0.22, 0.14]} />

      <group ref={droplets}>
        {Array.from({ length: 22 }, (_, index) => {
          const angle = index * 0.71;
          const radius = 3.75 + (index % 5) * 0.32;
          return (
            <mesh
              key={index}
              position={[
                Math.cos(angle) * radius,
                Math.sin(angle * 1.27) * 2.7,
                Math.sin(angle) * 1.45,
              ]}
              rotation={[angle, angle * 0.3, 0]}
            >
              <icosahedronGeometry args={[0.075 + (index % 4) * 0.035, 2]} />
              <Chrome color="#c0c8cd" roughness={0.05} transmission={index % 3 === 0 ? 0.4 : 0.08} />
            </mesh>
          );
        })}
      </group>

      <mesh position={[0, -3.25, -0.45]} rotation={[-Math.PI / 2, 0, 0]} scale={[2.1, 1.25, 1]}>
        <circleGeometry args={[3.4, 96]} />
        <meshPhysicalMaterial color="#05080b" metalness={0.45} roughness={0.42} envMapIntensity={0.35} />
      </mesh>
      <Ring radius={3.3} tube={0.025} color={BONE} emissive={BONE} emissiveIntensity={0.7} rotation={[Math.PI / 2, 0, 0]} />

      <pointLight position={[-2.5, -2.6, 1.4]} color={ORANGE} intensity={32} distance={14} />
      <pointLight position={[2.5, -2.35, 1.2]} color={BLUE} intensity={22} distance={14} />
      <spotLight position={[0, 4, 5]} color={BONE} intensity={34} distance={16} angle={0.5} penumbra={0.92} />
    </group>
  );
}

function StarField() {
  const points = useMemo(() => {
    const values = new Float32Array(420 * 3);
    const noise = (seed) => {
      const value = Math.sin(seed * 12.9898) * 43758.5453;
      return value - Math.floor(value);
    };
    for (let index = 0; index < 420; index += 1) {
      values[index * 3] = (noise(index + 1) - 0.5) * 44;
      values[index * 3 + 1] = (noise(index + 501) - 0.5) * 26;
      values[index * 3 + 2] = (noise(index + 1001) - 0.5) * 40;
    }
    return values;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#b8bec2" size={0.045} transparent opacity={0.58} sizeAttenuation />
    </points>
  );
}

function World({ progressRef, selected, onSelect }) {
  const root = useRef();
  const groupRefs = useRef([]);
  const { size } = useThree();
  const isMobile = size.width < 700;
  const targetCamera = useMemo(() => [
    new THREE.Vector3(0, 0.1, 11.5),
    new THREE.Vector3(0, 0.6, 12.7),
    new THREE.Vector3(0, 0.1, 12.2),
    new THREE.Vector3(0, 0.15, 13.2),
    new THREE.Vector3(0, 0, 12.1),
  ], []);
  const cameraLook = useMemo(() => isMobile
    ? [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -0.8),
        new THREE.Vector3(0, 0, 0),
      ]
    : [
        new THREE.Vector3(0.7, 0, 0),
        new THREE.Vector3(1.15, 0, 0),
        new THREE.Vector3(-1.15, 0, 0),
        new THREE.Vector3(1.15, 0, -0.8),
        new THREE.Vector3(-1.05, 0, 0),
      ], [isMobile]);
  const stageScale = useMemo(
    () => isMobile ? [0.62, 0.5, 0.54, 0.52, 0.54] : [0.95, 0.88, 0.84, 0.9, 0.88],
    [isMobile],
  );
  const smooth = useRef(0);
  const look = useRef(new THREE.Vector3(3, 0, 0));

  useFrame((state, delta) => {
    const raw = THREE.MathUtils.clamp(progressRef.current, 0, 4);
    smooth.current = THREE.MathUtils.damp(smooth.current, raw, 4.1, delta);
    const progress = smooth.current;
    const base = Math.floor(progress);
    const next = Math.min(4, base + 1);
    const mix = THREE.MathUtils.smoothstep(progress - base, 0, 1);

    state.camera.position.lerpVectors(targetCamera[base], targetCamera[next], mix);
    state.camera.position.x += state.pointer.x * 0.28;
    state.camera.position.y += state.pointer.y * 0.18;
    look.current.lerpVectors(cameraLook[base], cameraLook[next], mix);
    state.camera.lookAt(look.current);

    groupRefs.current.forEach((group, index) => {
      if (!group) return;
      const distance = Math.abs(progress - index);
      group.visible = distance < 0.86;
      const scale = THREE.MathUtils.clamp(stageScale[index] - distance * 0.38, 0.56, stageScale[index]);
      group.scale.setScalar(scale);
      group.rotation.z = (progress - index) * 0.12;
      group.position.z = -distance * 3.8;
    });

    root.current.rotation.y = state.pointer.x * 0.018;
    root.current.rotation.x = -state.pointer.y * 0.014;
  });

  return (
    <group ref={root}>
      <StudioEnvironment />
      <StarField />
      <ambientLight intensity={0.1} />
      <hemisphereLight color="#dfe7ed" groundColor="#100a08" intensity={0.32} />
      <directionalLight position={[5, 8, 7]} color="#dce7ee" intensity={2.2} />
      <directionalLight position={[-5, -2, 4]} color={BLUE} intensity={0.7} />

      <group ref={(node) => { groupRefs.current[0] = node; }} position={isMobile ? [0, 2.1, 0] : [4.0, 0.05, 0]}>
        <SignalCore />
      </group>
      <group ref={(node) => { groupRefs.current[1] = node; }} position={isMobile ? [0, 1.65, 0] : [2.9, 0, 0]}>
        <Constellation selected={selected} onSelect={onSelect} compact={isMobile} />
      </group>
      <group ref={(node) => { groupRefs.current[2] = node; }} position={isMobile ? [0, 1.75, 0] : [-3.55, 0, 0]}>
        <ProductMachine selected={selected} />
      </group>
      <group ref={(node) => { groupRefs.current[3] = node; }} position={isMobile ? [0, 1.7, -0.8] : [3.25, 0, -0.8]}>
        <FragmentVortex />
      </group>
      <group ref={(node) => { groupRefs.current[4] = node; }} position={isMobile ? [0, 1.7, 0] : [-3.35, 0.05, 0]}>
        <Eclipse />
      </group>
    </group>
  );
}

export default function SpatialScene(props) {
  return (
    <div className="scene" aria-hidden="true">
      <Canvas
        dpr={[1, 1.55]}
        camera={{ position: [0, 0, 11.5], fov: 41, near: 0.1, far: 100 }}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor("#050607");
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.96;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <World {...props} />
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.34} luminanceThreshold={0.94} luminanceSmoothing={0.1} mipmapBlur />
          <Vignette eskil={false} offset={0.16} darkness={0.52} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
