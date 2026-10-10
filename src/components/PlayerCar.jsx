import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

function PlayerCar({ lane, distance }) {
  const meshRef = useRef();

  // Map lanes (0-3) to X coordinates, and progress to negative Z coordinates
  const targetX = (lane - 1.5) * 2.5;
  const targetZ = -distance * 0.1;

  useFrame(() => {
    if (meshRef.current) {
      // Linear interpolation (lerp) smoothly slides the car left/right
      meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.2;
      meshRef.current.position.z = targetZ;
    }
  });

  return (
    <mesh ref={meshRef} position={[targetX, 0.4, 0]} castShadow>
      {/* Width, Height, Depth */}
      <boxGeometry args={[1.4, 0.7, 2.8]} />
      <meshStandardMaterial color="#ff2222" metalness={0.5} roughness={0.2} />
    </mesh>
  );
}

export default PlayerCar;