import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

function LapCounter({ laps, totalLaps, playerDistance }) {
  const groupRef = useRef();
  
  // Placed relative to the player's moving distance
  const targetZ = -playerDistance * 0.1 - 4;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.z = targetZ;
    }
  });

  return (
    <group ref={groupRef} position={[3.5, 3.2, -4]}>
      <Html
        transform
        distanceFactor={4}
        style={{
          background: "rgba(0, 0, 0, 0.8)",
          padding: "8px 16px",
          borderRadius: "6px",
          color: "#fff",
          fontFamily: "sans-serif",
          fontWeight: "bold",
          fontSize: "14px",
          borderLeft: "4px solid #00ffcc",
          whiteSpace: "nowrap",
          userSelect: "none",
        }}
      >
        LAP {laps} / {totalLaps}
      </Html>
    </group>
  );
}

export default LapCounter;