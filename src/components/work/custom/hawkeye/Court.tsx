"use client";

import { Plane, Grid, Text } from '@react-three/drei';

// Court dimensions in inches
const COURT_WIDTH = 50 * 12; // 600
const COURT_LENGTH = 94 * 12; // 1128

export function Court() {
    return (
        <group>
            {/* Ground Plane (Dark Tech Vibe) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[COURT_LENGTH + 200, COURT_WIDTH + 200]} />
                <meshStandardMaterial
                    color="#0a0a0a"
                    roughness={0.4}
                    metalness={0.8}
                />
            </mesh>

            {/* Reflective Main Floor */}
            <Grid
                infiniteGrid
                fadeDistance={2000}
                sectionSize={100}
                sectionColor="#222"
                sectionThickness={1}
                cellColor="#1a1a1a"
                cellSize={20}
                position={[0, 0, 0.1]}
                rotation={[Math.PI / 2, 0, 0]}
            />

            {/* Court Markings - Glowing / Holographic */}
            <group position={[0, 0, 0.5]}>
                <CourtLine length={COURT_LENGTH} width={4} position={[0, COURT_WIDTH / 2, 0]} />
                <CourtLine length={COURT_LENGTH} width={4} position={[0, -COURT_WIDTH / 2, 0]} />
                <CourtLine length={4} width={COURT_WIDTH} position={[COURT_LENGTH / 2, 0, 0]} />
                <CourtLine length={4} width={COURT_WIDTH} position={[-COURT_LENGTH / 2, 0, 0]} />
                <CourtLine length={4} width={COURT_WIDTH} position={[0, 0, 0]} opacity={0.3} />
            </group>
        </group>
    );
}

function CourtLine({ length, width, position, opacity = 0.8 }: { length: number, width: number, position: [number, number, number], opacity?: number }) {
    return (
        <mesh position={position}>
            <planeGeometry args={[length, width]} />
            <meshBasicMaterial color="#444" transparent opacity={opacity} />
        </mesh>
    );
}
