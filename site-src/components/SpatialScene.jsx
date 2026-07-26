"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMemo, useRef, useState } from "react";

const ORANGE = "#ff4d19";
const BLUE = "#176cff";
const BONE = "#eeeae0";

function Chrome({ color = "#b9c3cc", emissive = "#000000", opacity = 1 }) {
  return (
    <meshPhysicalMaterial
      color={color}
      emissive={emissive}
      emissiveIntensity={1.5}
      metalness={0.88}
      roughness={0.18}
      clearcoat={1}
      transparent={opacity < 1}
      opacity={opacity}
    />
  );
}

function Ring({ radius, tube = 0.08, color = "#9aa2aa", rotation = [0, 0, 0] }) {
  return (
    <mesh rotation={rotation}>
      <torusGeometry args={[radius, tube, 20, 100]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.08} metalness={0.72} roughness={0.24} />
    </mesh>
  );
}

function SignalCore() {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.13;
    ref.current.rotation.x = Math.sin(t * 0.22) * 0.14;
  });
  return (
    <group ref={ref}>
      {[1.4, 1.85, 2.3, 2.75].map((radius, index) => (
        <Ring key={radius} radius={radius} tube={index === 0 ? 0.13 : 0.075} rotation={[index * 0.42, index * 0.22, index * 0.55]} />
      ))}
      <mesh>
        <icosahedronGeometry args={[0.72, 2]} />
        <meshBasicMaterial color={ORANGE} />
      </mesh>
      <pointLight color={ORANGE} intensity={55} distance={13} />
      <pointLight position={[2, -1, 2]} color={BLUE} intensity={34} distance={12} />
      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.cos(angle) * 3.7, Math.sin(angle * 2) * 1.4, Math.sin(angle) * 3]} rotation={[angle, angle * .4, angle * .7]}>
            <tetrahedronGeometry args={[0.25 + (index % 3) * .08]} />
            <Chrome color={index % 2 ? "#66717a" : "#d7d7d2"} />
          </mesh>
        );
      })}
    </group>
  );
}

function WorldNode({ type, position, active, onSelect, index }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  useFrame((state, delta) => {
    ref.current.rotation.y += delta * (hovered ? .65 : .18);
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * .35 + index) * .14;
    const target = active || hovered ? 1.16 : 1;
    ref.current.scale.lerp(new THREE.Vector3(target, target, target), .08);
  });
  return (
    <group
      ref={ref}
      position={position}
      onPointerEnter={(event) => { event.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerLeave={() => { setHovered(false); document.body.style.cursor = ""; }}
      onClick={(event) => { event.stopPropagation(); onSelect(index, true); }}
    >
      <Ring radius={1.5} tube={active ? .08 : .045} color={active ? (type === "interaction" ? BLUE : ORANGE) : "#68717a"} rotation={[Math.PI / 2, 0, 0]} />
      {type === "ai" && (
        <mesh>
          <icosahedronGeometry args={[1.05, 1]} />
          <Chrome color="#7a362d" emissive={active ? ORANGE : "#160706"} />
        </mesh>
      )}
      {type === "interaction" && (
        <group>
          <Ring radius={.92} tube={.12} color="#7488a5" rotation={[.5, .3, 0]} />
          <Ring radius={.62} tube={.06} color={BLUE} rotation={[1.2, 0, .4]} />
        </group>
      )}
      {type === "craft" && (
        <mesh rotation={[.2, .4, 0]}>
          <octahedronGeometry args={[1.2, 0]} />
          <meshPhysicalMaterial color="#b5bdc7" metalness={.55} roughness={.08} transmission={.32} thickness={1.4} />
        </mesh>
      )}
      <pointLight color={type === "interaction" ? BLUE : type === "ai" ? ORANGE : BONE} intensity={active ? 28 : 10} distance={7} />
    </group>
  );
}

function Constellation({ selected, onSelect }) {
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * .16) * .035;
  });
  return (
    <group ref={ref}>
      <WorldNode type="ai" index={0} position={[0, 2.3, 0]} active={selected === 0} onSelect={onSelect} />
      <WorldNode type="interaction" index={1} position={[-3, -1.8, .5]} active={selected === 1} onSelect={onSelect} />
      <WorldNode type="craft" index={2} position={[3, -1.65, -.2]} active={selected === 2} onSelect={onSelect} />
      <Ring radius={4.2} tube={.018} color="#3e464f" rotation={[Math.PI / 2, 0, 0]} />
      <Ring radius={3.1} tube={.012} color="#5d321f" rotation={[1.32, .2, .15]} />
    </group>
  );
}

function ProductMachine({ selected }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = Math.sin(t * .21) * .12;
    ref.current.children.forEach((child, index) => {
      if (child.userData.spin) child.rotation.z = t * child.userData.spin * (index % 2 ? 1 : -1);
    });
  });
  const colors = [ORANGE, BLUE, BONE];
  return (
    <group ref={ref}>
      {[3.1, 2.55, 2, 1.45].map((radius, index) => (
        <group key={radius} userData={{ spin: .06 + index * .025 }} rotation={[index * .28, .25, index * .35]}>
          <Ring radius={radius} tube={index === 2 ? .13 : .065} color={index === selected ? colors[selected] : "#7b858e"} />
        </group>
      ))}
      <mesh>
        {selected === 0 ? <icosahedronGeometry args={[.9, 2]} /> : selected === 1 ? <torusKnotGeometry args={[.72, .18, 90, 12]} /> : <octahedronGeometry args={[1.05, 0]} />}
        <Chrome color={selected === 0 ? "#4d1710" : selected === 1 ? "#142a57" : "#b9c0c6"} emissive={colors[selected]} />
      </mesh>
      <pointLight color={colors[selected]} intensity={60} distance={12} />
      {Array.from({ length: 18 }, (_, index) => {
        const angle = index * .92;
        const radius = 3.6 + (index % 4) * .25;
        return (
          <mesh key={index} position={[Math.cos(angle) * radius, Math.sin(angle * 1.7) * 2.2, Math.sin(angle) * 1.5]}>
            <sphereGeometry args={[.065 + (index % 3) * .035, 12, 12]} />
            <Chrome color={colors[index % 3]} emissive={index % 3 === selected ? colors[selected] : "#000"} />
          </mesh>
        );
      })}
    </group>
  );
}

function FragmentVortex() {
  const ref = useRef();
  const pieces = useMemo(() => Array.from({ length: 180 }, (_, index) => {
    const t = index / 179;
    const angle = t * Math.PI * 13;
    const radius = .28 + t * 3.6;
    return {
      position: [
        (t - .5) * 13,
        Math.sin(angle) * radius * .48,
        Math.cos(angle) * radius * .52,
      ],
      rotation: [angle * .2, angle, angle * .45],
      scale: .018 + (index % 8) * .009,
      color: index % 17 === 0 ? ORANGE : index % 19 === 0 ? BLUE : index % 5 === 0 ? "#d8d4ca" : "#596168",
    };
  }), []);
  useFrame((state) => {
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * .14) * .14;
    ref.current.rotation.z = state.clock.elapsedTime * .035;
  });
  return (
    <group ref={ref} rotation={[0, -.25, -.18]}>
      {pieces.map((piece, index) => (
        <mesh
          key={index}
          position={piece.position}
          rotation={piece.rotation}
          scale={[piece.scale * 5.2, piece.scale, piece.scale * 1.6]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={piece.color} toneMapped={false} />
        </mesh>
      ))}
      <pointLight position={[6, 0, 0]} color={BONE} intensity={80} distance={15} />
      <pointLight position={[-3, -1, 2]} color={BLUE} intensity={28} distance={10} />
    </group>
  );
}

function Eclipse() {
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime * .055;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * .1) * .08;
  });
  return (
    <group ref={ref}>
      <Ring radius={2.85} tube={.25} color="#c3cbd0" rotation={[.08, .36, .15]} />
      <Ring radius={3.2} tube={.035} color={ORANGE} rotation={[.25, .1, -.18]} />
      <mesh>
        <sphereGeometry args={[2.35, 64, 64]} />
        <meshPhysicalMaterial color="#020304" metalness={.72} roughness={.12} clearcoat={1} />
      </mesh>
      <pointLight position={[-2.2, -2.4, 1]} color={ORANGE} intensity={70} distance={13} />
      <pointLight position={[2.4, -2, 1]} color={BLUE} intensity={45} distance={13} />
      {Array.from({ length: 14 }, (_, index) => {
        const angle = index * .74;
        const radius = 3.7 + (index % 3) * .48;
        return (
          <mesh key={index} position={[Math.cos(angle) * radius, Math.sin(angle * 1.31) * 2.7, Math.sin(angle) * 1.3]} rotation={[angle, angle * .3, 0]}>
            <tetrahedronGeometry args={[.1 + (index % 4) * .045]} />
            <Chrome color="#9ba3aa" />
          </mesh>
        );
      })}
    </group>
  );
}

function StarField() {
  const points = useMemo(() => {
    const values = new Float32Array(360 * 3);
    const noise = (seed) => {
      const value = Math.sin(seed * 12.9898) * 43758.5453;
      return value - Math.floor(value);
    };
    for (let i = 0; i < 360; i += 1) {
      values[i * 3] = (noise(i + 1) - .5) * 42;
      values[i * 3 + 1] = (noise(i + 401) - .5) * 24;
      values[i * 3 + 2] = (noise(i + 801) - .5) * 38;
    }
    return values;
  }, []);
  return (
    <points>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[points, 3]} /></bufferGeometry>
      <pointsMaterial color="#aeb5ba" size={.06} transparent opacity={.72} sizeAttenuation />
    </points>
  );
}

function World({ progressRef, selected, onSelect }) {
  const root = useRef();
  const groupRefs = useRef([]);
  const targetCamera = useMemo(() => [
    new THREE.Vector3(0, .1, 11),
    new THREE.Vector3(0, .6, 12.5),
    new THREE.Vector3(0, .1, 11.5),
    new THREE.Vector3(0, 0, 12.8),
    new THREE.Vector3(0, 0, 11.5),
  ], []);
  const cameraLook = useMemo(() => [
    new THREE.Vector3(.8, 0, 0),
    new THREE.Vector3(1.2, 0, 0),
    new THREE.Vector3(-1.2, 0, 0),
    new THREE.Vector3(1.1, 0, 0),
    new THREE.Vector3(-1.1, 0, 0),
  ], []);
  const stageScale = useMemo(() => [.84, .92, .9, .94, .88], []);
  const smooth = useRef(0);
  const look = useRef(new THREE.Vector3(3, 0, 0));

  useFrame((state, delta) => {
    const raw = THREE.MathUtils.clamp(progressRef.current, 0, 4);
    smooth.current = THREE.MathUtils.damp(smooth.current, raw, 4.2, delta);
    const p = smooth.current;
    const base = Math.floor(p);
    const next = Math.min(4, base + 1);
    const mix = THREE.MathUtils.smoothstep(p - base, 0, 1);
    state.camera.position.lerpVectors(targetCamera[base], targetCamera[next], mix);
    state.camera.position.x += state.pointer.x * .34;
    state.camera.position.y += state.pointer.y * .2;
    look.current.lerpVectors(cameraLook[base], cameraLook[next], mix);
    state.camera.lookAt(look.current);

    groupRefs.current.forEach((group, index) => {
      if (!group) return;
      const distance = Math.abs(p - index);
      group.visible = distance < .82;
      const scale = THREE.MathUtils.clamp(stageScale[index] - distance * .42, .58, stageScale[index]);
      group.scale.setScalar(scale);
      group.rotation.z = (p - index) * .16;
      group.position.z = -distance * 3.5;
    });
    root.current.rotation.y = state.pointer.x * .025;
    root.current.rotation.x = -state.pointer.y * .018;
  });

  return (
    <group ref={root}>
      <StarField />
      <ambientLight intensity={.25} />
      <directionalLight position={[4, 7, 8]} color="#dbe7ef" intensity={2.8} />
      <group ref={(node) => { groupRefs.current[0] = node; }} position={[3.7, 0, 0]}><SignalCore /></group>
      <group ref={(node) => { groupRefs.current[1] = node; }} position={[2.8, 0, 0]}><Constellation selected={selected} onSelect={onSelect} /></group>
      <group ref={(node) => { groupRefs.current[2] = node; }} position={[-3.4, 0, 0]}><ProductMachine selected={selected} /></group>
      <group ref={(node) => { groupRefs.current[3] = node; }} position={[3.2, 0, -1]}><FragmentVortex /></group>
      <group ref={(node) => { groupRefs.current[4] = node; }} position={[-3.3, 0, 0]}><Eclipse /></group>
    </group>
  );
}

export default function SpatialScene(props) {
  return (
    <div className="scene" aria-hidden="true">
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 0, 11], fov: 42, near: .1, far: 100 }}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor("#050607");
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.15;
        }}
      >
        <World {...props} />
      </Canvas>
    </div>
  );
}
