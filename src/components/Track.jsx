import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

// Helper function to handle wrapping coordinates smoothly for infinite loops
const wrapZ = (z, minVal, maxVal) => {
  const range = maxVal - minVal;
  return (((z - minVal) % range) + range) % range + minVal;
};

// --- STAGE DATA CONFIGURATION SCHEMA ---
const STAGES = [
  {
    id: 1,
    name: "Stage 1: Paddock Novice Cup",
    totalLaps: 10,
    trackLength: 1000,
    aiBaseSpeedFactor: 0.95, 
    aiLaneChangeRate: 0.001, 
    roadWidth: 16,
    ambientColor: "#a0c4ff",
    groundColor: "#357030",
    fogColor: "#a0c4ff",
    fogDensity: 95,
    difficultyText: "Daylight • Wide Track • Relaxed Pace",
    description: "An open layout perfect for learning track boundaries and collision avoidance."
  },
  {
    id: 2,
    name: "Stage 2: Golden Hour Sunset",
    totalLaps: 20,
    trackLength: 1100,
    aiBaseSpeedFactor: 1.05, 
    aiLaneChangeRate: 0.004, 
    roadWidth: 14, 
    ambientColor: "#fd5e53",
    groundColor: "#403018",
    fogColor: "#fd5e53",
    fogDensity: 85,
    difficultyText: "Sunset • Medium Track • Balanced Pace",
    description: "Sunset driving conditions with dynamic opponent lane swaps. Maintain safety distances."
  },
  {
    id: 3,
    name: "Stage 3: Midnight Grand Prix",
    totalLaps: 30,
    trackLength: 1200,
    aiBaseSpeedFactor: 1.12, 
    aiLaneChangeRate: 0.008, 
    roadWidth: 13,
    ambientColor: "#050816",
    groundColor: "#111424",
    fogColor: "#050816",
    fogDensity: 70,
    difficultyText: "Night • Narrow Track • Steady Pace",
    description: "Ultra-tight night course requiring sharp reflexes to avoid high-speed overtaking impacts."
  }
];

// --- 3D ENVIRONMENT COMPONENTS ---

function SkyDome({ ambientColor }) {
  return (
    <mesh>
      <sphereGeometry args={[120, 32, 15]} />
      <meshBasicMaterial color={ambientColor} side={THREE.BackSide} />
    </mesh>
  );
}

function StadiumGround({ groundColor }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -50]} receiveShadow>
      <planeGeometry args={[250, 180]} />
      <meshStandardMaterial color={groundColor} roughness={0.9} />
    </mesh>
  );
}

function StandSegment({ index, spacing, playerDistanceRef, children }) {
  const ref = useRef();
  
  useFrame(() => {
    const playerDistance = playerDistanceRef.current || 0;
    if (ref.current) {
      const rawZ = -index * spacing + (playerDistance * 0.1);
      ref.current.position.z = wrapZ(rawZ, -140, 20);
    }
  });

  return <group ref={ref}>{children}</group>;
}

function StadiumStands({ playerDistanceRef }) {
  const spacing = 10;
  const count = 16;

  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <StandSegment key={i} index={i} spacing={spacing} playerDistanceRef={playerDistanceRef}>
          {/* Left Concrete Steps */}
          <group position={[-10.5, 0, 0]}>
            <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
              <boxGeometry args={[3.0, 0.4, spacing]} />
              <meshStandardMaterial color="#88898e" roughness={0.8} />
            </mesh>
            <mesh position={[-0.8, 0.4, 0]} receiveShadow castShadow>
              <boxGeometry args={[3.0, 0.8, spacing]} />
              <meshStandardMaterial color="#76777c" roughness={0.8} />
            </mesh>
            <mesh position={[-1.6, 0.6, 0]} receiveShadow castShadow>
              <boxGeometry args={[3.0, 1.2, spacing]} />
              <meshStandardMaterial color="#65666b" roughness={0.8} />
            </mesh>
          </group>

          {/* Right Concrete Steps */}
          <group position={[10.5, 0, 0]}>
            <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
              <boxGeometry args={[3.0, 0.4, spacing]} />
              <meshStandardMaterial color="#88898e" roughness={0.8} />
            </mesh>
            <mesh position={[0.8, 0.4, 0]} receiveShadow castShadow>
              <boxGeometry args={[3.0, 0.8, spacing]} />
              <meshStandardMaterial color="#76777c" roughness={0.8} />
            </mesh>
            <mesh position={[1.6, 0.6, 0]} receiveShadow castShadow>
              <boxGeometry args={[3.0, 1.2, spacing]} />
              <meshStandardMaterial color="#65666b" roughness={0.8} />
            </mesh>
          </group>
        </StandSegment>
      ))}
    </group>
  );
}

function SpectatorGroup({ index, spacing, playerDistanceRef, children }) {
  const ref = useRef();

  useFrame(() => {
    const playerDistance = playerDistanceRef.current || 0;
    if (ref.current) {
      const rawZ = -index * spacing + (playerDistance * 0.1);
      ref.current.position.z = wrapZ(rawZ, -140, 20);
    }
  });

  return <group ref={ref}>{children}</group>;
}

function SpectatorCrowd({ playerDistanceRef }) {
  const spacing = 3.0;
  const count = 50;

  const tiers = [
    { x: 0, y: 0.4 },
    { x: -0.8, y: 0.8 },
    { x: -1.6, y: 1.2 }
  ];

  const shirtColors = ["#ff3f3f", "#3a86c8", "#ffbe0b", "#06d6a0", "#ff007f", "#ff9f1c", "#ffffff"];
  const skinTones = ["#ffd0a1", "#e0a96d", "#8d5524", "#ffdbac", "#c68642"];

  const elements = [];

  for (let i = 0; i < count; i++) {
    const tempElements = [];

    tiers.forEach((tier, tierIdx) => {
      if (Math.sin(i * 1.5 + tierIdx) > -0.6) {
        const shirtColor = shirtColors[(i + tierIdx) % shirtColors.length];
        const skinTone = skinTones[(i * tierIdx) % skinTones.length];
        const xPos = -10.5 + tier.x;

        tempElements.push(
          <group key={`left-${tierIdx}`} position={[xPos, tier.y, 0]}>
            <mesh position={[0, 0.25, 0]} castShadow>
              <boxGeometry args={[0.3, 0.5, 0.3]} />
              <meshStandardMaterial color={shirtColor} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.62, 0]}>
              <sphereGeometry args={[0.13, 8, 8]} />
              <meshStandardMaterial color={skinTone} roughness={0.6} />
            </mesh>
          </group>
        );
      }
    });

    tiers.forEach((tier, tierIdx) => {
      if (Math.cos(i * 1.2 + tierIdx) > -0.6) {
        const shirtColor = shirtColors[(i * 3 + tierIdx) % shirtColors.length];
        const skinTone = skinTones[(i * 2 + tierIdx) % skinTones.length];
        const xPos = 10.5 - tier.x;

        tempElements.push(
          <group key={`right-${tierIdx}`} position={[xPos, tier.y, 0]}>
            <mesh position={[0, 0.25, 0]} castShadow>
              <boxGeometry args={[0.3, 0.5, 0.3]} />
              <meshStandardMaterial color={shirtColor} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.62, 0]}>
              <sphereGeometry args={[0.13, 8, 8]} />
              <meshStandardMaterial color={skinTone} roughness={0.6} />
            </mesh>
          </group>
        );
      }
    });

    elements.push(
      <SpectatorGroup key={i} index={i} spacing={spacing} playerDistanceRef={playerDistanceRef}>
        {tempElements}
      </SpectatorGroup>
    );
  }

  return <group>{elements}</group>;
}

function ThreeRoad({ playerDistanceRef, roadWidth }) {
  const dashesRef = useRef();

  useFrame(() => {
    if (dashesRef.current && playerDistanceRef.current !== undefined) {
      dashesRef.current.position.z = (playerDistanceRef.current * 0.1) % 4;
    }
  });

  const halfWidth = roadWidth / 2;

  return (
    <group>
      {/* Asphalt Surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -50]} receiveShadow>
        <planeGeometry args={[roadWidth, 180]} />
        <meshStandardMaterial color="#4e4f54" roughness={0.8} />
      </mesh>

      {/* Red/White Rumble curbs along road edges */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-halfWidth - 0.15, 0.01, -50]} receiveShadow>
        <planeGeometry args={[0.3, 180]} />
        <meshStandardMaterial color="#b32424" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[halfWidth + 0.15, 0.01, -50]} receiveShadow>
        <planeGeometry args={[0.3, 180]} />
        <meshStandardMaterial color="#b32424" roughness={0.8} />
      </mesh>

      {/* Moving Center Line Dashes */}
      <group ref={dashesRef}>
        {Array.from({ length: 45 }).map((_, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -i * 4]} receiveShadow>
            <planeGeometry args={[0.08, 1.5]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// 3D Starting lines drawn on the asphalt road matching initial grid positions
function StartingGrid({ roadWidth, playerDistanceRef }) {
  const ref = useRef();
  const laneWidth = roadWidth / 4;

  useFrame(() => {
    const playerDistance = playerDistanceRef.current || 0;
    if (ref.current) {
      ref.current.position.z = playerDistance * 0.1;
    }
  });

  const positions = [
    { lane: 1, z: 0 },       
    { lane: 3, z: -5.0 },    
    { lane: 0, z: -8.0 },    
    { lane: 2, z: -15.0 }    
  ];

  return (
    <group ref={ref}>
      {positions.map((pos, idx) => {
        const xPos = (pos.lane - 1.5) * laneWidth;
        return (
          <group key={idx} position={[xPos, 0.012, pos.z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[laneWidth * 0.7, 3.2]} />
              <meshStandardMaterial color="#ffffff" roughness={0.9} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
              <planeGeometry args={[laneWidth * 0.6, 2.9]} />
              <meshStandardMaterial color="#4e4f54" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.002, 1.45]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[laneWidth * 0.6, 0.15]} />
              <meshBasicMaterial color="#ffbb00" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function FlagWaver({ playerLapRef, totalLaps, gameOver }) {
  const armRef = useRef();
  const greenFlagRef = useRef();
  const checkeredFlagRef = useRef();

  useFrame((state) => {
    if (!armRef.current) return;
    const t = state.clock.getElapsedTime();
    const currentLap = playerLapRef ? playerLapRef.current : 1;
    const isFinishing = (currentLap === totalLaps) || gameOver;

    if (greenFlagRef.current) greenFlagRef.current.visible = !isFinishing;
    if (checkeredFlagRef.current) checkeredFlagRef.current.visible = isFinishing;

    if (isFinishing) {
      armRef.current.rotation.z = Math.sin(t * 11) * 0.55 + 0.5;
      armRef.current.rotation.x = Math.cos(t * 11) * 0.25;
    } else {
      armRef.current.rotation.z = Math.sin(t * 4.5) * 0.35 + 0.4;
      armRef.current.rotation.x = Math.cos(t * 4.5) * 0.15;
    }
  });

  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.8, 1.2]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.85, 0.5]} castShadow>
        <boxGeometry args={[1.2, 0.1, 0.1]} />
        <meshStandardMaterial color="#ffcc00" />
      </mesh>

      <group position={[0, 0.8, 0]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[0.3, 0.5, 0.18]} />
          <meshStandardMaterial color="#ff6600" roughness={0.6} />
        </mesh>

        <mesh position={[0, 0.72, 0]} castShadow>
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshStandardMaterial color="#e0a96d" />
        </mesh>
        <mesh position={[0, 0.78, 0]}>
          <sphereGeometry args={[0.13, 8, 8]} />
          <meshStandardMaterial color="#ffffff" metalness={0.1} />
        </mesh>

        <mesh position={[-0.2, 0.42, 0]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.08, 0.35, 0.08]} />
          <meshStandardMaterial color="#ff6600" />
        </mesh>

        <group ref={armRef} position={[0.2, 0.45, 0]}>
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[0.08, 0.35, 0.08]} />
            <meshStandardMaterial color="#ff6600" />
          </mesh>

          <mesh position={[0, 0.3, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.7, 8]} />
            <meshStandardMaterial color="#e5e5e5" metalness={0.5} />
          </mesh>

          <group position={[0, 0.3, 0.5]} rotation={[0, -Math.PI / 2, 0]}>
            <mesh ref={greenFlagRef} castShadow>
              <planeGeometry args={[0.5, 0.35]} />
              <meshStandardMaterial color="#00aa33" side={THREE.DoubleSide} roughness={0.4} />
            </mesh>

            <group ref={checkeredFlagRef}>
              <mesh position={[-0.125, 0.125, 0]} castShadow>
                <planeGeometry args={[0.25, 0.25]} />
                <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0.125, 0.125, 0]} castShadow>
                <planeGeometry args={[0.25, 0.25]} />
                <meshBasicMaterial color="#000000" side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[-0.125, -0.125, 0]} castShadow>
                <planeGeometry args={[0.25, 0.25]} />
                <meshBasicMaterial color="#000000" side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0.125, -0.125, 0]} castShadow>
                <planeGeometry args={[0.25, 0.25]} />
                <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

function FinishLine({ playerDistanceRef, playerLapRef, totalLaps, gameOver, roadWidth }) {
  const ref = useRef();

  useFrame(() => {
    const playerDistance = playerDistanceRef.current || 0;
    if (ref.current) {
      const rawZ = (playerDistance * 0.1);
      ref.current.position.z = wrapZ(rawZ, -140, 20);
    }
  });

  return (
    <group ref={ref}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[roadWidth, 1.5]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>
      {Array.from({ length: 16 }).map((_, idx) => (
        <mesh
          key={idx}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-7.5 + idx * 1.0, 0.015, idx % 2 === 0 ? 0.375 : -0.375]}
        >
          <planeGeometry args={[0.5, 0.75]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      ))}

      <group position={[-roadWidth / 2 - 1.2, 0, 0]}>
        <FlagWaver playerLapRef={playerLapRef} totalLaps={totalLaps} gameOver={gameOver} />
      </group>
    </group>
  );
}

// --- VEHICLES ---

function SportsCarModel({ color }) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 0.3, 2.4]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.15} />
      </mesh>

      <mesh position={[0, 0.25, -0.1]} castShadow>
        <boxGeometry args={[0.8, 0.25, 1.0]} />
        <meshStandardMaterial color="#111" transparent opacity={0.7} roughness={0.1} />
      </mesh>

      <mesh position={[-0.4, 0.22, 1.0]} castShadow>
        <boxGeometry args={[0.05, 0.25, 0.05]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0.4, 0.22, 1.0]} castShadow>
        <boxGeometry args={[0.05, 0.25, 0.05]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, 0.35, 1.0]} castShadow>
        <boxGeometry args={[1.3, 0.04, 0.3]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.15} />
      </mesh>

      <mesh position={[-0.62, -0.15, -0.7]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.2, 12]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
      <mesh position={[0.62, -0.15, -0.7]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.2, 12]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
      <mesh position={[-0.62, -0.15, 0.7]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.2, 12]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
      <mesh position={[0.62, -0.15, 0.7]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.2, 12]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>

      <mesh position={[-0.4, 0.05, -1.21]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#fffae6" emissive="#fffae6" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[0.4, 0.05, -1.21]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#fffae6" emissive="#fffae6" emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}

function PlayerCar({ lane, roadWidth }) {
  const meshRef = useRef();
  
  const laneWidth = roadWidth / 4;
  const targetX = (lane - 1.5) * laneWidth;

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.15;
      meshRef.current.rotation.y = (meshRef.current.position.x - targetX) * 0.1;
      meshRef.current.rotation.z = (meshRef.current.position.x - targetX) * 0.15;
    }
  });

  return (
    <group ref={meshRef} position={[0, 0.4, 0]}>
      <SportsCarModel color="#ff1144" />
    </group>
  );
}

// --- CORE GAME CONTROLLER ENGINE ---

function GameEngine({ gameOver, setGameOver, onRestart, activeStage, setPlayerResultPosition, raceStarted, setRaceStarted, startLightCount, setIsCrashed }) {
  const { totalLaps, trackLength, aiBaseSpeedFactor, aiLaneChangeRate, roadWidth, ambientColor, groundColor, fogColor, fogDensity } = activeStage;

  const [playerLane, setPlayerLane] = useState(1);

  const playerDistanceRef = useRef(0);
  const playerLapRef = useRef(1);
  const velocityRef = useRef(0);
  const scoreRef = useRef(0);
  const keysRef = useRef({ ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false });

  const playerLaneRef = useRef(1);

  // Initial staggered Z-offset spawning boundaries
  const opponentsRef = useRef([
    { id: 1, name: "Viper AI", lane: 0, distance: -80, lap: 1, baseSpeed: 11.5 * aiBaseSpeedFactor, speed: 11.5 * aiBaseSpeedFactor },
    { id: 2, name: "Specter AI", lane: 2, distance: -150, lap: 1, baseSpeed: 13.8 * aiBaseSpeedFactor, speed: 13.8 * aiBaseSpeedFactor },
    { id: 3, name: "Phantom AI", lane: 3, distance: -50, lap: 1, baseSpeed: 12.2 * aiBaseSpeedFactor, speed: 12.2 * aiBaseSpeedFactor },
  ]);

  const opponentRefs = useRef([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (k === "r") {
        onRestart();
        return;
      }
      if (e.key === "ArrowUp" || k === "w") keysRef.current.ArrowUp = true;
      if (e.key === "ArrowDown" || k === "s") keysRef.current.ArrowDown = true;
      if (e.key === "ArrowLeft" || k === "a") {
        const nextLane = Math.max(playerLaneRef.current - 1, 0);
        setPlayerLane(nextLane);
        playerLaneRef.current = nextLane;
      }
      if (e.key === "ArrowRight" || k === "d") {
        const nextLane = Math.min(playerLaneRef.current + 1, 3);
        setPlayerLane(nextLane);
        playerLaneRef.current = nextLane;
      }
    };

    const handleKeyUp = (e) => {
      const k = e.key.toLowerCase();
      if (e.key === "ArrowUp" || k === "w") keysRef.current.ArrowUp = false;
      if (e.key === "ArrowDown" || k === "s") keysRef.current.ArrowDown = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [onRestart]);

  useFrame((state) => {
    if (!raceStarted || gameOver) return;

    const maxSpeed = 15;
    const acceleration = 0.25;
    const friction = 0.08;

    if (keysRef.current.ArrowUp) {
      velocityRef.current = Math.min(velocityRef.current + acceleration, maxSpeed);
    } else if (keysRef.current.ArrowDown) {
      velocityRef.current = Math.max(velocityRef.current - acceleration * 2, 0);
    } else {
      velocityRef.current = Math.max(velocityRef.current - friction, 0);
    }

    playerDistanceRef.current += velocityRef.current;
    scoreRef.current += velocityRef.current * 0.15;

    // --- 3D BOUNDING-BOX COLLISION DETECTION SYSTEM ---
    const playerTotal = playerLapRef.current * trackLength + playerDistanceRef.current;
    
    opponentsRef.current.forEach((car) => {
      const opponentTotal = car.lap * trackLength + car.distance;
      const relativeZ = -(opponentTotal - playerTotal) * 0.1; // relative Z coordinate in WebGL space

      // Car geometries: 2.4 units length, 1.2 units width
      const zOverlap = Math.abs(relativeZ) < 1.8; 
      
      const laneWidth = roadWidth / 4;
      const playerX = (playerLaneRef.current - 1.5) * laneWidth;
      const opponentX = (car.lane - 1.5) * laneWidth;
      const xOverlap = Math.abs(playerX - opponentX) < 1.0;

      if (zOverlap && xOverlap) {
        setIsCrashed(true);
        setGameOver(true);
        velocityRef.current = 0;
      }
    });

    // Calculate Lap complete
    if (playerDistanceRef.current >= trackLength) {
      if (playerLapRef.current < totalLaps) {
        playerLapRef.current += 1;
        playerDistanceRef.current = 0;
      } else {
        const standings = [
          { id: "player", total: playerLapRef.current * trackLength + playerDistanceRef.current },
          ...opponentsRef.current.map((c) => ({
            id: c.id,
            total: c.lap * trackLength + c.distance,
          })),
        ].sort((a, b) => b.total - a.total);

        const playerRank = standings.findIndex((item) => item.id === "player") + 1;
        setPlayerResultPosition(playerRank);
        setGameOver(true);
        velocityRef.current = 0;
      }
    }

    // Process AI mechanics
    const elapsedTime = state.clock.getElapsedTime();
    opponentsRef.current.forEach((car) => {
      const speedModifier = Math.sin(elapsedTime * 1.5 + car.id) * 0.8;
      car.speed = (car.baseSpeed + speedModifier);
      car.distance += car.speed;

      if (Math.random() < aiLaneChangeRate) {
        const action = Math.random() > 0.5 ? 1 : -1;
        car.lane = Math.max(0, Math.min(3, car.lane + action));
      }

      if (car.distance >= trackLength) {
        if (car.lap < totalLaps) {
          car.distance = 0;
          car.lap += 1;
        } else {
          const standings = [
            { id: "player", total: playerLapRef.current * trackLength + playerDistanceRef.current },
            ...opponentsRef.current.map((c) => ({
              id: c.id,
              total: c.lap * trackLength + c.distance,
            })),
          ].sort((a, b) => b.total - a.total);

          const playerRank = standings.findIndex((item) => item.id === "player") + 1;
          setPlayerResultPosition(playerRank);
          setGameOver(true);
          velocityRef.current = 0;
        }
      }
    });

    opponentsRef.current.forEach((car, idx) => {
      const mesh = opponentRefs.current[idx];
      if (mesh) {
        const opponentTotal = car.lap * trackLength + car.distance;
        const relativeDistance = opponentTotal - playerTotal;

        const laneWidth = roadWidth / 4;
        mesh.position.x = (car.lane - 1.5) * laneWidth;
        mesh.position.z = -relativeDistance * 0.1;
      }
    });

    // Update overlay displays
    const hudLap = document.getElementById("hud-lap");
    if (hudLap) {
      hudLap.innerHTML = `${playerLapRef.current} <span style="font-size: 14px; color: #555">/ ${totalLaps}</span>`;
    }

    const hudSpeed = document.getElementById("hud-speed");
    if (hudSpeed) {
      hudSpeed.innerHTML = `${Math.floor(velocityRef.current * 18)} <span style="font-size: 12px; color: #888">KM/H</span>`;
    }

    const hudScore = document.getElementById("hud-score");
    if (hudScore) {
      hudScore.textContent = Math.floor(scoreRef.current);
    }

    const hudStandings = document.getElementById("hud-standings");
    if (hudStandings) {
      const standings = [
        { id: "player", name: "Player (You)", total: playerLapRef.current * trackLength + playerDistanceRef.current },
        ...opponentsRef.current.map((c) => ({
          id: c.id,
          name: c.name,
          total: c.lap * trackLength + c.distance,
        })),
      ].sort((a, b) => b.total - a.total);

      hudStandings.innerHTML = standings.map((car, idx) => `
        <div style="display: flex; justify-content: space-between; font-size: 13px; padding: 3px 0; color: ${car.id === 'player' ? '#ffcc00' : '#fff'}; font-weight: ${car.id === 'player' ? 'bold' : 'normal'};">
          <span>${idx + 1}. ${car.name}</span>
          <span>${Math.floor(car.total)}m</span>
        </div>
      `).join('');
    }
  });

  return (
    <group>
      <color attach="background" args={[ambientColor]} />
      <fog attach="fog" args={[fogColor, 25, fogDensity]} />

      <ambientLight intensity={ambientColor === "#050816" ? 0.3 : 0.7} color="#f0f5ff" />
      <directionalLight position={[15, 30, 15]} intensity={ambientColor === "#050816" ? 0.5 : 1.5} castShadow color="#fffbf2" />

      <PerspectiveCamera makeDefault position={[0, 4.0, 8.5]} fov={70} />

      <SkyDome ambientColor={ambientColor} />
      <ThreeRoad playerDistanceRef={playerDistanceRef} roadWidth={roadWidth} />
      <StartingGrid roadWidth={roadWidth} playerDistanceRef={playerDistanceRef} />
      <FinishLine 
        playerDistanceRef={playerDistanceRef} 
        playerLapRef={playerLapRef}
        totalLaps={totalLaps}
        gameOver={gameOver}
        roadWidth={roadWidth}
      />
      <StadiumGround groundColor={groundColor} />
      <StadiumStands playerDistanceRef={playerDistanceRef} />
      <SpectatorCrowd playerDistanceRef={playerDistanceRef} />

      <PlayerCar lane={playerLane} roadWidth={roadWidth} />
      {opponentsRef.current.map((c, idx) => (
        <group key={c.id} ref={(el) => (opponentRefs.current[idx] = el)}>
          <SportsCarModel color="#1155ff" />
        </group>
      ))}
    </group>
  );
}

// --- MAIN WRAPPER (HANDLE STAGE SELECT MENU & SCENE RENDERING) ---

function Track() {
  const [gameState, setGameState] = useState("MENU"); 
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const activeStage = STAGES[activeStageIdx];

  const [gameId, setGameId] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isCrashed, setIsCrashed] = useState(false);
  const [playerResultPosition, setPlayerResultPosition] = useState(null);

  const [raceStarted, setRaceStarted] = useState(false);
  const [startLightCount, setStartLightCount] = useState(0); 

  // Start sequence countdown managed at main level
  useEffect(() => {
    if (gameState !== "RACING") return;

    setStartLightCount(0);
    setRaceStarted(false);
    setIsCrashed(false);

    const timers = [];
    for (let i = 1; i <= 5; i++) {
      timers.push(
        setTimeout(() => {
          setStartLightCount(i);
        }, i * 900)
      );
    }

    const goDelay = 4500 + Math.random() * 1200 + 800;
    timers.push(
      setTimeout(() => {
        setStartLightCount(6); 
        setRaceStarted(true);
      }, goDelay)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [gameState, gameId, activeStageIdx]);

  const handleLaunchStage = (idx) => {
    setActiveStageIdx(idx);
    setGameOver(false);
    setIsCrashed(false);
    setPlayerResultPosition(null);
    setGameId((prev) => prev + 1);
    setGameState("RACING");
  };

  const handleRestart = () => {
    setGameOver(false);
    setIsCrashed(false);
    setPlayerResultPosition(null);
    setGameId((prev) => prev + 1);
  };

  const handleBackToMenu = () => {
    setGameOver(false);
    setIsCrashed(false);
    setPlayerResultPosition(null);
    setGameState("MENU");
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#0d0e15",
        overflow: "hidden",
        zIndex: 1,
      }}
    >
      {/* Global CSS Reset */}
      <style dangerouslySetInnerHTML={{__html: `
        body, html {
          margin: 0;
          padding: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background-color: #0d0e15;
        }
        
        @keyframes pulse {
          0% { transform: translateX(-50%) scale(1); opacity: 0.9; }
          50% { transform: translateX(-50%) scale(1.05); opacity: 1; }
          100% { transform: translateX(-50%) scale(1); opacity: 0.9; }
        }
      `}} />

      {/* --- MENU VIEW SCREEN --- */}
      {gameState === "MENU" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "radial-gradient(circle, #151622 0%, #0d0e15 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, sans-serif",
            color: "#fff",
            zIndex: 100,
          }}
        >
          {/* Main Arcade Title */}
          <h1
            style={{
              fontSize: "42px",
              fontWeight: "900",
              letterSpacing: "4px",
              margin: "0 0 5px 0",
              background: "linear-gradient(45deg, #00ffcc, #ff1144)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textTransform: "uppercase",
            }}
          >
            Retro Speedway
          </h1>
          <p style={{ color: "#888", fontSize: "14px", margin: "0 0 40px 0", letterSpacing: "1px" }}>
            Select a stage and hit the grid
          </p>

          {/* Grid Layout of Stage Options */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              maxWidth: "900px",
              width: "90%",
              justifyContent: "center",
            }}
          >
            {STAGES.map((stg, idx) => (
              <div
                key={stg.id}
                style={{
                  background: "#181926",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "12px",
                  padding: "25px",
                  flex: "1",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                  transition: "border-color 0.3s",
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "bold", color: "#00ffcc", letterSpacing: "1px", textTransform: "uppercase" }}>
                    Stage 0{stg.id}
                  </div>
                  <h3 style={{ margin: "5px 0 10px 0", fontSize: "18px", fontWeight: "bold" }}>{stg.name.split(":")[1].trim()}</h3>
                  <div style={{ fontSize: "12px", color: "#888", marginBottom: "15px", fontStyle: "italic" }}>
                    {stg.difficultyText}
                  </div>
                  <p style={{ fontSize: "13px", color: "#bbb", lineHeight: "1.5", margin: "0 0 20px 0" }}>
                    {stg.description}
                  </p>
                </div>

                <button
                  onClick={() => handleLaunchStage(idx)}
                  style={{
                    padding: "12px",
                    background: "transparent",
                    color: "#00ffcc",
                    border: "2px solid #00ffcc",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "14px",
                    width: "100%",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#00ffcc";
                    e.currentTarget.style.color = "#000";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#00ffcc";
                  }}
                >
                  START STAGE
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- ACTIVE STAGE GRAPHICS LAYER --- */}
      {gameState === "RACING" && (
        <>
          {/* 3D WebGL Graphics */}
          <Canvas style={{ width: "100%", height: "100%" }} shadows>
            <GameEngine
              key={`${gameId}-${activeStageIdx}`}
              gameOver={gameOver}
              setGameOver={setGameOver}
              onRestart={handleRestart}
              activeStage={activeStage}
              setPlayerResultPosition={setPlayerResultPosition}
              raceStarted={raceStarted}
              setRaceStarted={setRaceStarted}
              startLightCount={startLightCount}
              setIsCrashed={setIsCrashed}
            />
          </Canvas>

          {/* Active Stage Name Label */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(10, 11, 20, 0.85)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(0, 255, 204, 0.3)",
              borderRadius: "10px",
              padding: "10px 20px",
              color: "#fff",
              fontFamily: "system-ui, sans-serif",
              textAlign: "center",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: "bold", color: "#00ffcc" }}>
              {activeStage.name}
            </div>
            <div style={{ fontSize: "10px", color: "#aaa", textTransform: "uppercase", marginTop: "2px", letterSpacing: "1px" }}>
              {activeStage.difficultyText}
            </div>
          </div>

          {/* Telemetry Dashboard Panel */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              background: "rgba(10, 11, 20, 0.85)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(0, 255, 204, 0.3)",
              borderRadius: "10px",
              padding: "15px",
              color: "#fff",
              fontFamily: "system-ui, sans-serif",
              width: "160px",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "1px" }}>
              Lap Counter
            </div>
            <div id="hud-lap" style={{ fontSize: "22px", fontWeight: "900", color: "#00ffcc", margin: "2px 0 8px" }}>
              1 <span style={{ fontSize: "14px", color: "#555" }}>/ {activeStage.totalLaps}</span>
            </div>
            <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "1px" }}>
              Engine Speed
            </div>
            <div id="hud-speed" style={{ fontSize: "22px", fontWeight: "900", color: "#ffcc00", margin: "2px 0 8px" }}>
              0 <span style={{ fontSize: "12px", color: "#888" }}>KM/H</span>
            </div>
            <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "1px" }}>
              Score Points
            </div>
            <div id="hud-score" style={{ fontSize: "22px", fontWeight: "900", color: "#ffaa00" }}>
              0
            </div>
          </div>

          {/* Leaderboard Standing Panel */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "rgba(10, 11, 20, 0.85)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(0, 255, 204, 0.3)",
              borderRadius: "10px",
              padding: "15px",
              color: "#fff",
              fontFamily: "monospace",
              width: "220px",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <div style={{ fontSize: "12px", color: "#00ffcc", fontWeight: "bold", borderBottom: "1px solid rgba(0,255,204,0.2)", paddingBottom: "5px", marginBottom: "8px" }}>
              🏁 POSITION STANDINGS
            </div>
            <div id="hud-standings">
              {/* Managed in useFrame */}
            </div>
          </div>

          {/* Authentic F1 Style Horizontal 5-Light Gantry Overlay */}
          {startLightCount <= 5 && (
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: "50%",
                transform: "translateX(-50%)", 
                background: "#15151c",
                border: "3px solid #33343a",
                padding: "15px 30px",
                borderRadius: "10px",
                display: "flex",
                gap: "15px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
                zIndex: 20,
              }}
            >
              {Array.from({ length: 5 }).map((_, idx) => {
                const active = startLightCount > idx;
                const bulbColor = active ? "#ff0000" : "#222";
                const glow = active ? "0 0 15px #ff0000, 0 0 30px #ff0000" : "none";
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                      background: "#222",
                      padding: "5px",
                      borderRadius: "6px",
                    }}
                  >
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: bulbColor, boxShadow: glow, transition: "background 0.1s" }} />
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: bulbColor, boxShadow: glow, transition: "background 0.1s" }} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Race Over Dialogue Overlay */}
          {gameOver && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "rgba(10, 11, 20, 0.95)",
                backdropFilter: "blur(8px)",
                border: isCrashed ? "2px solid #ff1144" : "2px solid #00ffcc",
                boxShadow: isCrashed ? "0 0 30px rgba(255, 17, 68, 0.3)" : "0 0 30px rgba(0, 255, 204, 0.3)",
                padding: "35px 40px",
                color: "#fff",
                borderRadius: "16px",
                textAlign: "center",
                fontFamily: "system-ui, sans-serif",
                width: "300px",
                zIndex: 30,
              }}
            >
              <h2 style={{ margin: "0 0 10px 0", color: isCrashed ? "#ff1144" : "#00ffcc", fontSize: "24px", fontWeight: "900", letterSpacing: "1px" }}>
                {isCrashed ? "COLLISION DETECTED" : "STAGE COMPLETE"}
              </h2>
              
              {!isCrashed && (
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#fff", margin: "10px 0" }}>
                  Finish Position: <span style={{ color: "#ffcc00" }}>#{playerResultPosition}</span>
                </div>
              )}

              <p style={{ color: "#aaa", fontSize: "13px", margin: "0 0 25px 0" }}>
                {isCrashed 
                  ? "Your vehicle sustained critical damage during an overtaking impact." 
                  : "Congratulations, you crossed the finish line!"}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  style={{
                    padding: "12px 24px",
                    background: isCrashed ? "linear-gradient(45deg, #ff1144, #aa0033)" : "linear-gradient(45deg, #00ffcc, #00aa88)",
                    color: isCrashed ? "#fff" : "#000",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "15px",
                    width: "100%",
                  }}
                  onClick={handleRestart}
                >
                  RETRY STAGE
                </button>

                <button
                  style={{
                    padding: "12px 24px",
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "15px",
                    width: "100%",
                  }}
                  onClick={handleBackToMenu}
                >
                  CHOOSE OTHER STAGE
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Track;