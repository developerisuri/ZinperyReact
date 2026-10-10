import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

function OpponentCar({ lane, distance }) {
  const meshRef = useRef();
  const targetX = (lane - 1.5) * 2.5;
  const targetZ = -distance * 0.1;

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.x = targetX;
      meshRef.current.position.z = targetZ;
    }
  });

  return (
    <mesh ref={meshRef} position={[targetX, 0.4, targetZ]} castShadow>
      <boxGeometry args={[1.4, 0.7, 2.8]} />
      <meshStandardMaterial color="#2255ff" metalness={0.5} roughness={0.2} />
    </mesh>
  );
}

export default OpponentCar;