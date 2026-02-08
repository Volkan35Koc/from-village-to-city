import React, { useContext } from 'react';
import { GameContext } from './context/GameContext';
import Lobby from './components/Lobby';
import Game from './components/Game';
import './App.css';

function App() {
  const { gameState } = useContext(GameContext);

  return (
    <div className="App">
      {gameState ? <Game /> : <Lobby />}
    </div>
  );
}

export default App;
