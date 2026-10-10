import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

function Leaderboard({ cars, playerDistance }) {
  const meshRef = useRef();
  const targetZ = -playerDistance * 0.1 - 25;

  useFrame(() => {
    if (meshRef.current) {
      // Slides the billboard along the Z-axis with the player's camera position
      meshRef.current.position.z += (targetZ - meshRef.current.position.z) * 0.1;
    }
  });

  const sortedLeaderboard = [...cars].sort((a, b) => b.total - a.total);

  return (
    <group ref={meshRef} position={[-8, 4, -25]} rotation={[0, 0.4, 0]}>
      {/* Support Pole */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 4]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Screen Frame */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[7, 4.5, 0.2]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Leaderboard UI Projector */}
      <Html
        transform
        distanceFactor={6}
        position={[0, 1, 0.11]}
        style={{
          width: "280px",
          height: "180px",
          background: "rgba(10, 10, 15, 0.95)",
          border: "2px solid #555",
          borderRadius: "8px",
          color: "#fff",
          fontFamily: "monospace",
          padding: "12px",
          boxSizing: "border-box",
          userSelect: "none"
        }}
      >
        <h3 style={{ margin: "0 0 8px 0", textAlign: "center", color: "#00ffcc", borderBottom: "1px solid #333" }}>
          LEADERBOARD
        </h3>
        {sortedLeaderboard.map((car, index) => (
          <div
            key={car.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
              padding: "3px 0",
              color: car.id === "player" ? "#ffcc00" : "#aaa",
              fontWeight: car.id === "player" ? "bold" : "normal",
            }}
          >
            <span>{index + 1}. {car.name}</span>
            <span>{Math.floor(car.total)}m</span>
          </div>
        ))}
      </Html>
    </group>
  );
}

export default Leaderboard;