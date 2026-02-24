"use client";

import { useMemo } from 'react';
import { Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';
import { BONE_CONNECTIONS } from './skeleton';

interface PlayerProps {
    data: any;
    color: string;
}

export function Player({ data, color }: PlayerProps) {
    const joints = useMemo(() => {
        if (!data || !data.joints || !data.joints[0]) return null;
        return data.joints[0];
    }, [data]);

    if (!joints) return null;

    return (
        <group>
            {/* Joints */}
            {Object.entries(joints).map(([key, pos]: [string, any]) => (
                <mesh key={key} position={pos}>
                    <sphereGeometry args={[2, 8, 8]} />
                    <meshBasicMaterial color={color} />
                </mesh>
            ))}

            {/* Bones */}
            {BONE_CONNECTIONS.map(([startName, endName], idx) => {
                const start = joints[startName];
                const end = joints[endName];

                if (!start || !end) return null;

                return (
                    <Line
                        key={idx}
                        points={[start, end]}
                        color={color}
                        lineWidth={2}
                        transparent
                        opacity={0.6}
                    />
                );
            })}
        </group>
    );
}
