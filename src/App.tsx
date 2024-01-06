import { useEffect, useRef, useState } from "react";

import "./App.css";
import initFlipCard from "./game/flipCard";

function App() {
  const [gameManager, setGameManager] = useState<any>(null);
  useEffect(() => {
    initFlipCard().then((game: any) => {
      setGameManager(game);
    });
    return () => {};
  }, []);

  return (
    <>
      {/* <button
        style={{ zIndex: 100, position: "absolute" }}
        onClick={() => {
          //NAVIGATE
          gameManager?.stop && gameManager.stop();
        }}
      >
        exit game
      </button> */}
    </>
  );
}

export default App;
