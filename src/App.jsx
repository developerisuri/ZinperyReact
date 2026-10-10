import Track from "./components/Track";

function App() {
  return (
    <div style={{ background: "#111", minHeight: "100vh", paddingTop: "20px" }}>
      <h1 style={{ textAlign: "center", color: "#fff" }}>
        🏎️ F1 Racing Game
      </h1>
      <Track />
    </div>
  );
}

export default App;