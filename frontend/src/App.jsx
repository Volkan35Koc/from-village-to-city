import React, { useContext, useState } from 'react';
import { GameContext } from './context/GameContext';
import Lobby from './components/Lobby';
import Game from './components/Game';
import MainMenu from './components/MainMenu';
import BotSetup from './components/BotSetup';
import HelpModal from './components/HelpModal';
import './App.css';

function App() {
  const { gameState, createGameWithBots } = useContext(GameContext); // Need to add createGameWithBots to context
  const [view, setView] = useState('menu'); // menu, lobby, botSetup
  const [showHelp, setShowHelp] = useState(false);

  // If we are in a game (gameState exists), show Game component
  if (gameState) {
    return (
      <div className="App">
        <Game />
      </div>
    );
  }

  const handleCreateBotGame = (playerName, botCount) => {
    if (createGameWithBots) {
      createGameWithBots(playerName, botCount);
    } else {
      console.error("createGameWithBots not implemented in Context yet");
    }
  };

  return (
    <div className="App">
      {view === 'menu' && (
        <MainMenu
          onPlayBots={() => setView('botSetup')}
          onPlayOnline={() => setView('lobby')}
          onShowHelp={() => setShowHelp(true)}
        />
      )}

      {view === 'lobby' && (
        <div>
          <button
            onClick={() => setView('menu')}
            style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100, padding: '10px' }}
          >
            ← Back to Menu
          </button>
          <Lobby />
        </div>
      )}

      {view === 'botSetup' && (
        <BotSetup
          onCreateGame={handleCreateBotGame}
          onBack={() => setView('menu')}
        />
      )}

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}

export default App;
