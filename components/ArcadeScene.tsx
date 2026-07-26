"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { TextureLoader, NearestFilter, AdditiveBlending } from "three";
import * as THREE from "three";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Vignette,
  Scanline,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

// ──────────────────────────────────────
// BACKGROUND PLANE
// ──────────────────────────────────────
function ScenePlane() {
  const texture = useLoader(TextureLoader, "/bg.png");
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useMemo(() => {
    texture.minFilter = NearestFilter;
    texture.magFilter = NearestFilter;
  }, [texture]);

  // Subtle breathing pulse
  useFrame((_, delta) => {
    timeRef.current += delta;
    if (meshRef.current) {
      const breath = 1 + Math.sin(timeRef.current * 0.5) * 0.008;
      meshRef.current.scale.set(breath, breath, 1);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[16, 9.71, 1, 1]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

// ──────────────────────────────────────
// NEON GLOW LIGHTS — more intense
// ──────────────────────────────────────
function NeonGlows() {
  const refs = useRef<THREE.PointLight[]>([]);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;
    refs.current.forEach((light, i) => {
      if (!light) return;
      const phase = t * (0.8 + i * 0.3) + i * 2;
      // More aggressive flicker for arcade feel
      const flicker = Math.sin(phase) * 0.3 + Math.sin(phase * 3.7) * 0.15 + Math.sin(phase * 7.1) * 0.05;
      light.intensity = Math.max(0.1, 0.5 + flicker);
    });
  });

  return (
    <>
      <pointLight ref={(el) => { if (el) refs.current[0] = el; }} position={[-5.5, 0.8, 2]} color="#ff3c3c" intensity={0.6} distance={6} />
      <pointLight ref={(el) => { if (el) refs.current[1] = el; }} position={[-1.5, 1.2, 2]} color="#ffdc50" intensity={0.5} distance={5} />
      <pointLight ref={(el) => { if (el) refs.current[2] = el; }} position={[4.6, 1.4, 2]} color="#ffe644" intensity={0.7} distance={4} />
      <pointLight ref={(el) => { if (el) refs.current[3] = el; }} position={[6, 0, 2.5]} color="#ff2d7b" intensity={0.4} distance={7} />
      <pointLight ref={(el) => { if (el) refs.current[4] = el; }} position={[0, 3.5, 2.5]} color="#00c8ff" intensity={0.3} distance={10} />
      <pointLight ref={(el) => { if (el) refs.current[5] = el; }} position={[-3, -2, 2]} color="#b44dff" intensity={0.3} distance={6} />
      <pointLight ref={(el) => { if (el) refs.current[6] = el; }} position={[3, -3, 2]} color="#39ff14" intensity={0.2} distance={5} />
    </>
  );
}

// ──────────────────────────────────────
// FLOATING PARTICLES — more, bigger, varied
// ──────────────────────────────────────
function ArcadeParticles({ count = 120 }: { count?: number }) {
  const meshRef = useRef<THREE.Points>(null);

  const { positions, colors, sizes, speeds, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);
    const palette = [
      [1, 0.18, 0.48], [0, 0.94, 1], [1, 0.9, 0.27],
      [0.71, 0.3, 1], [0.22, 1, 0.08], [1, 1, 1],
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = Math.random() * 4 + 0.3;
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c[0];
      colors[i * 3 + 1] = c[1];
      colors[i * 3 + 2] = c[2];
      sizes[i] = 0.03 + Math.random() * 0.08;
      speeds[i] = 0.15 + Math.random() * 1;
      phases[i] = Math.random() * Math.PI * 2;
    }

    return { positions, colors, sizes, speeds, phases };
  }, [count]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const pos = meshRef.current.geometry.attributes.position;
    const sizeAttr = meshRef.current.geometry.attributes.size;
    for (let i = 0; i < count; i++) {
      phases[i] += delta * speeds[i];
      const y = pos.getY(i) + delta * speeds[i] * 0.4;
      pos.setY(i, y > 7 ? -7 : y);
      pos.setX(i, positions[i * 3] + Math.sin(phases[i]) * 0.3);
      // Pulse size
      sizeAttr.setX(i, sizes[i] * (1 + Math.sin(phases[i] * 2) * 0.3));
    }
    pos.needsUpdate = true;
    sizeAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        vertexColors
        transparent
        opacity={0.8}
        blending={AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

// ──────────────────────────────────────
// FLOATING WIREFRAME SHAPES
// ──────────────────────────────────────
function FloatingShapes() {
  const groupRef = useRef<THREE.Group>(null);
  const shapesRef = useRef<THREE.Mesh[]>([]);
  const timeRef = useRef(0);

  const shapeData = useMemo(() => [
    { pos: [-6.5, 3.5, 1.5], scale: 0.3, speed: 0.4, color: "#ff2d7b", type: "oct" },
    { pos: [7, -3, 2], scale: 0.25, speed: 0.6, color: "#00f0ff", type: "box" },
    { pos: [-4, -4, 1], scale: 0.2, speed: 0.5, color: "#ffe644", type: "oct" },
    { pos: [5, 4, 1.8], scale: 0.35, speed: 0.3, color: "#b44dff", type: "box" },
    { pos: [-7, 0, 2.5], scale: 0.15, speed: 0.7, color: "#39ff14", type: "tet" },
    { pos: [2, -4.5, 1.2], scale: 0.2, speed: 0.55, color: "#ff2d7b", type: "tet" },
    { pos: [8, 1, 2], scale: 0.18, speed: 0.45, color: "#00f0ff", type: "oct" },
    { pos: [-2, 5, 1.5], scale: 0.22, speed: 0.65, color: "#ffe644", type: "box" },
  ], []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    shapesRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const d = shapeData[i];
      mesh.rotation.x += delta * d.speed * 1.2;
      mesh.rotation.y += delta * d.speed * 0.8;
      mesh.rotation.z += delta * d.speed * 0.5;
      // Float up and down
      mesh.position.y = d.pos[1] + Math.sin(timeRef.current * d.speed + i) * 0.5;
    });
  });

  return (
    <group ref={groupRef}>
      {shapeData.map((d, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) shapesRef.current[i] = el; }}
          position={d.pos as [number, number, number]}
          scale={d.scale}
        >
          {d.type === "box" && <boxGeometry args={[1, 1, 1]} />}
          {d.type === "oct" && <octahedronGeometry args={[1]} />}
          {d.type === "tet" && <tetrahedronGeometry args={[1]} />}
          <meshBasicMaterial
            color={d.color}
            wireframe
            transparent
            opacity={0.4}
            blending={AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// ──────────────────────────────────────
// NEON LIGHT BEAMS — volumetric rays
// ──────────────────────────────────────
function LightBeams() {
  const beamsRef = useRef<THREE.Mesh[]>([]);
  const timeRef = useRef(0);

  const beamData = useMemo(() => [
    { pos: [-5.5, 4, 0.5], rot: [0, 0, -0.3], color: "#ff3c3c", len: 8, width: 0.08 },
    { pos: [4.6, 4.5, 0.5], rot: [0, 0, 0.15], color: "#ffe644", len: 7, width: 0.06 },
    { pos: [-1, 5, 0.5], rot: [0, 0, 0.05], color: "#00c8ff", len: 9, width: 0.05 },
    { pos: [7, 3, 0.5], rot: [0, 0, 0.4], color: "#b44dff", len: 6, width: 0.04 },
  ], []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    beamsRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const phase = timeRef.current * (0.6 + i * 0.2) + i * 1.5;
      (mesh.material as THREE.MeshBasicMaterial).opacity = 0.03 + Math.sin(phase) * 0.025 + Math.sin(phase * 3) * 0.01;
    });
  });

  return (
    <>
      {beamData.map((b, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) beamsRef.current[i] = el; }}
          position={b.pos as [number, number, number]}
          rotation={b.rot as [number, number, number]}
        >
          <planeGeometry args={[b.width, b.len]} />
          <meshBasicMaterial
            color={b.color}
            transparent
            opacity={0.04}
            blending={AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}

// ──────────────────────────────────────
// TRON GRID FLOOR
// ──────────────────────────────────────
function TronGrid() {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#b44dff") },
  }), []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = timeRef.current;
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      // Scrolling grid
      float gridX = step(0.95, fract(uv.x * 20.0));
      float gridY = step(0.95, fract(uv.y * 20.0 + uTime * 0.3));
      float grid = max(gridX, gridY);

      // Fade with distance from center
      float fade = 1.0 - smoothstep(0.0, 0.5, abs(uv.x - 0.5));
      fade *= smoothstep(0.0, 0.3, uv.y);

      // Pulse
      float pulse = 0.3 + sin(uTime * 1.5) * 0.15;

      gl_FragColor = vec4(uColor * grid * fade * pulse, grid * fade * pulse * 0.4);
    }
  `;

  return (
    <mesh ref={meshRef} position={[0, -5.2, 0.3]} rotation={[-0.8, 0, 0]}>
      <planeGeometry args={[20, 10, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        blending={AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ──────────────────────────────────────
// SPARK BURSTS — random flash points
// ──────────────────────────────────────
function SparkBursts() {
  const sparksRef = useRef<THREE.Mesh[]>([]);
  const timeRef = useRef(0);
  const nextSpark = useRef(0);

  const sparkData = useMemo(() =>
    Array.from({ length: 8 }, () => ({
      active: false,
      life: 0,
      x: 0,
      y: 0,
    })),
  []);

  useFrame((_, delta) => {
    timeRef.current += delta;

    if (timeRef.current > nextSpark.current) {
      const spark = sparkData.find((s) => !s.active);
      if (spark) {
        spark.active = true;
        spark.life = 0;
        spark.x = (Math.random() - 0.5) * 14;
        spark.y = (Math.random() - 0.5) * 8;
      }
      nextSpark.current = timeRef.current + Math.random() * 0.6 + 0.15;
    }

    sparkData.forEach((spark, idx) => {
      const mesh = sparksRef.current[idx];
      if (!mesh) return;

      if (!spark.active) {
        mesh.visible = false;
        return;
      }

      spark.life += delta;
      if (spark.life > 0.12) {
        spark.active = false;
        mesh.visible = false;
        return;
      }

      mesh.visible = true;
      mesh.position.set(spark.x, spark.y, 1.5);
      const flash = 1 - spark.life / 0.12;
      mesh.scale.setScalar(flash * 0.3);
      (mesh.material as THREE.MeshBasicMaterial).opacity = flash * 0.9;
    });
  });

  return (
    <>
      {sparkData.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) sparksRef.current[i] = el; }}
          visible={false}
        >
          <circleGeometry args={[1, 6]} />
          <meshBasicMaterial
            color="#00f0ff"
            transparent
            opacity={0}
            blending={AdditiveBlending}
          />
        </mesh>
      ))}
    </>
  );
}

// ──────────────────────────────────────
// ENERGY WAVE — periodic radial pulse
// ──────────────────────────────────────
function EnergyWave() {
  const ringRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const timeRef = useRef(0);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#00f0ff") },
  }), []);

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;
    void main() {
      vec2 center = vUv - 0.5;
      float dist = length(center);
      float wave = sin(dist * 30.0 - uTime * 3.0) * 0.5 + 0.5;
      float ring = smoothstep(0.02, 0.0, abs(dist - mod(uTime * 0.15, 0.5)));
      float alpha = ring * 0.3 * wave;
      gl_FragColor = vec4(uColor, alpha);
    }
  `;

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = timeRef.current;
    }
  });

  return (
    <mesh ref={ringRef} position={[0, 0, 0.15]}>
      <planeGeometry args={[18, 12, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        blending={AdditiveBlending}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ──────────────────────────────────────
// HOLOGRAPHIC GRID LINES — horizontal sweep
// ──────────────────────────────────────
function HoloSweep() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const timeRef = useRef(0);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), []);

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      float y = vUv.y;
      // Thin horizontal scan line that sweeps
      float scanPos = mod(uTime * 0.12, 1.4) - 0.2;
      float scan = smoothstep(0.01, 0.0, abs(y - scanPos)) * 0.4;
      // Fine horizontal lines
      float lines = step(0.98, fract(y * 80.0)) * 0.02;
      float alpha = scan + lines;
      vec3 color = mix(vec3(0.0, 0.94, 1.0), vec3(1.0, 0.18, 0.48), y);
      gl_FragColor = vec4(color, alpha);
    }
  `;

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = timeRef.current;
    }
  });

  return (
    <mesh position={[0, 0, 0.2]}>
      <planeGeometry args={[16, 10, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// ──────────────────────────────────────
// PULSING NEON RING
// ──────────────────────────────────────
function NeonRing() {
  const ringRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (ringRef.current) {
      const t = timeRef.current;
      const scale = 1 + Math.sin(t * 0.8) * 0.15;
      ringRef.current.scale.set(scale, scale, 1);
      ringRef.current.rotation.z += delta * 0.1;
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.08 + Math.sin(t * 1.2) * 0.04;
    }
  });

  return (
    <mesh ref={ringRef} position={[0, 0, 0.1]}>
      <ringGeometry args={[6, 6.15, 64]} />
      <meshBasicMaterial
        color="#ff2d7b"
        transparent
        opacity={0.1}
        blending={AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ──────────────────────────────────────
// MOUSE-TRACKED CAMERA
// ──────────────────────────────────────
function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 0.5;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 0.4;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame(() => {
    target.current.x += (mouse.current.x - target.current.x) * 0.04;
    target.current.y += (mouse.current.y - target.current.y) * 0.04;
    camera.position.x = target.current.x;
    camera.position.y = target.current.y;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ──────────────────────────────────────
// POST-PROCESSING — cranked up
// ──────────────────────────────────────
function PostFX() {
  const chromaRef = useRef<any>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (chromaRef.current) {
      const t = timeRef.current;
      const pulse = 0.0006 + Math.sin(t * 2) * 0.0003;
      chromaRef.current.offset.set(pulse, pulse * 0.8);
    }
  });

  return (
    <EffectComposer>
      <Bloom
        intensity={1.5}
        luminanceThreshold={0.35}
        luminanceSmoothing={0.15}
        mipmapBlur
      />
      <ChromaticAberration
        ref={chromaRef}
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.0008, 0.0006)}
      />
      <Scanline
        blendFunction={BlendFunction.OVERLAY}
        density={1.5}
        opacity={0.05}
      />
      <Noise
        blendFunction={BlendFunction.OVERLAY}
        opacity={0.1}
      />
      <Vignette
        offset={0.25}
        darkness={0.75}
      />
    </EffectComposer>
  );
}

// ──────────────────────────────────────
// MAIN SCENE
// ──────────────────────────────────────
export default function ArcadeScene() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-[#0a0610] flex items-center justify-center">
        <div className="text-[8px] text-[#ffe644] tracking-[0.4em] uppercase animate-pulse"
          style={{ fontFamily: "var(--font-press-start)" }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 60 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      dpr={[1, 2]}
    >
      <color attach="background" args={["#0a0610"]} />
      <ambientLight intensity={0.2} />

      <ScenePlane />
      <NeonGlows />
      <ArcadeParticles count={120} />
      <FloatingShapes />
      <LightBeams />
      <TronGrid />
      <SparkBursts />
      <NeonRing />
      <EnergyWave />
      <HoloSweep />
      <CameraRig />
      <PostFX />
    </Canvas>
  );
}
