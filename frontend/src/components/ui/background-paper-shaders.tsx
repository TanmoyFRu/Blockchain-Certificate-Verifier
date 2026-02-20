"use client"

import React, { useRef, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

const vertexShader = `
  uniform float time;
  uniform float intensity;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    
    vec3 pos = position;
    pos.y += sin(pos.x * 10.0 + time) * 0.1 * intensity;
    pos.x += cos(pos.y * 8.0 + time * 1.5) * 0.05 * intensity;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const fragmentShader = `
  uniform float time;
  uniform float intensity;
  uniform vec3 color1;
  uniform vec3 color2;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vec2 uv = vUv;
    
    float noise = sin(uv.x * 20.0 + time) * cos(uv.y * 15.0 + time * 0.8);
    noise += sin(uv.x * 35.0 - time * 2.0) * cos(uv.y * 25.0 + time * 1.2) * 0.5;
    
    vec3 color = mix(color1, color2, noise * 0.5 + 0.5);
    color = mix(color, vec3(1.0), pow(abs(noise), 2.0) * intensity);
    
    float glow = 1.0 - length(uv - 0.5) * 2.0;
    glow = pow(glow, 2.0);
    
    gl_FragColor = vec4(color * glow, glow * 0.8);
  }
`

function ShaderPlane({
    color1 = "#ff5722",
    color2 = "#ffffff",
    speed = 1.0,
}: {
    color1?: string
    color2?: string
    speed?: number
}) {
    const mesh = useRef<THREE.Mesh>(null)
    // Use viewport to cover screen
    const { viewport } = useThree()

    const uniforms = useMemo(
        () => ({
            time: { value: 0 },
            intensity: { value: 1.0 },
            color1: { value: new THREE.Color(color1) },
            color2: { value: new THREE.Color(color2) },
        }),
        [color1, color2],
    )

    useFrame((state) => {
        if (mesh.current) {
            uniforms.time.value = state.clock.elapsedTime * speed
            uniforms.intensity.value = 1.0 + Math.sin(state.clock.elapsedTime * 2 * speed) * 0.3
        }
    })

    return (
        <mesh ref={mesh} position={[0, 0, 0]}>
            <planeGeometry args={[viewport.width * 1.5, viewport.height * 1.5, 64, 64]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                transparent
                side={THREE.DoubleSide}
            />
        </mesh>
    )
}

export function MeshGradient({
    className,
    colors = ["#000000", "#ffffff"],
    speed = 1.0,
    style,
    ...props
}: {
    className?: string
    colors?: string[]
    speed?: number
    style?: React.CSSProperties
}) {
    return (
        <div className={className} style={{ ...style, pointerEvents: "none" }} {...props}>
            <Canvas camera={{ position: [0, 0, 1], fov: 75 }} style={{ width: '100%', height: '100%' }}>
                <ShaderPlane
                    color1={colors[0] || "#1a0533"}
                    color2={colors[1] || "#0f3460"}
                    speed={speed}
                />
            </Canvas>
        </div>
    )
}

export function EnergyRing({
    radius = 1,
    position = [0, 0, 0],
}: {
    radius?: number
    position?: [number, number, number]
}) {
    const mesh = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.z = state.clock.elapsedTime
                ; (mesh.current.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3
        }
    })

    return (
        <mesh ref={mesh} position={position}>
            <ringGeometry args={[radius * 0.8, radius, 32]} />
            <meshBasicMaterial color="#ff5722" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
    )
}
