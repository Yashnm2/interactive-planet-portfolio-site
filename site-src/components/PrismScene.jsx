import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const accent = new THREE.Color("#c8ff4d");
const smoke = new THREE.Color("#090a0a");

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(value) {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
}

function Prism() {
  const group = useRef();
  const beam = useRef();
  const slices = useRef([]);
  const pointer = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  const geometry = useMemo(() => {
    return new THREE.BoxGeometry(0.72, 3.2, 1.1, 1, 1, 1);
  }, []);

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#b8cac8",
        transmission: 0,
        opacity: 0.24,
        transparent: true,
        roughness: 0.12,
        metalness: 0.72,
        emissive: "#263130",
        emissiveIntensity: 1.6,
        thickness: 1.4,
        ior: 1.45,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        envMapIntensity: 1.5,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [],
  );

  useFrame((state, delta) => {
    if (!group.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const maxScroll =
      Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = window.scrollY / maxScroll;
    const work = smoothstep((progress - 0.13) / 0.32);
    const resolve = smoothstep((progress - 0.7) / 0.22);
    const split = work * (1 - resolve);

    const targetX =
      viewport.width > 8 ? 2.75 - work * 0.7 + resolve * 0.8 : 0.85;
    const targetY = 0.15 + work * 0.2 - resolve * 0.3;
    group.current.position.x = THREE.MathUtils.damp(
      group.current.position.x,
      targetX,
      3.5,
      delta,
    );
    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      targetY,
      3.5,
      delta,
    );

    const targetScale =
      viewport.width > 8 ? 1 - work * 0.12 + resolve * 0.08 : 0.58;
    group.current.scale.setScalar(
      THREE.MathUtils.damp(group.current.scale.x, targetScale, 4, delta),
    );

    const px = reduced ? 0 : pointer.current.x * 0.1;
    const py = reduced ? 0 : pointer.current.y * 0.08;
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      -0.2 + px + progress * 0.35,
      3,
      delta,
    );
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      -0.08 + py,
      3,
      delta,
    );

    slices.current.forEach((slice, index) => {
      if (!slice) return;
      const offset = (index - 1) * split * 1.25;
      slice.position.y = THREE.MathUtils.damp(
        slice.position.y,
        offset,
        4,
        delta,
      );
      slice.position.x = THREE.MathUtils.damp(
        slice.position.x,
        (index - 1) * (0.74 + split * 0.38),
        4,
        delta,
      );
      slice.rotation.z = THREE.MathUtils.damp(
        slice.rotation.z,
        (index - 1) * split * -0.07,
        4,
        delta,
      );
    });

    if (beam.current) {
      beam.current.scale.x = 0.65 + split * 0.45;
    }
  });

  return (
    <group
      ref={group}
      onPointerMove={(event) => {
        pointer.current.x = event.pointer.x;
        pointer.current.y = event.pointer.y;
      }}
      onPointerLeave={() => {
        pointer.current.x = 0;
        pointer.current.y = 0;
      }}
    >
      <group ref={beam} position={[-2.2, 0, -0.6]} rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <cylinderGeometry args={[0.045, 0.15, 8, 24]} />
          <meshBasicMaterial
            color={accent}
            transparent
            opacity={0.82}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.18, 0.38, 8, 24]} />
          <meshBasicMaterial
            color={accent}
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
      {[-0.74, 0, 0.74].map((x, index) => (
        <group
          key={x}
          ref={(node) => {
            slices.current[index] = node;
          }}
          position={[x, 0, 0]}
        >
          <mesh geometry={geometry} material={material} />
          <lineSegments>
            <edgesGeometry args={[geometry, 18]} />
            <lineBasicMaterial
              color="#e8f2f0"
              transparent
              opacity={index === 1 ? 0.92 : 0.68}
            />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}

export default function PrismScene() {
  return (
    <div className="scene" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 9], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        fallback={<div className="scene-fallback" />}
      >
        <color attach="background" args={[smoke]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 5]} intensity={4} color="#f8ffff" />
        <pointLight position={[-3, -1, 3]} intensity={2.8} color={accent} />
        <Prism />
      </Canvas>
    </div>
  );
}
