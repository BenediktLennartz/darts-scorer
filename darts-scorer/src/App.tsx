import { useStore } from './store';
import Home from './components/Home';
import PlayerManager from './components/PlayerManager';
import GameSetup from './components/GameSetup';
import ActiveGame from './components/ActiveGame';
import MatchResult from './components/MatchResult';

export default function App() {
  const { state } = useStore();

  switch (state.view) {
    case 'home':
      return <Home />;
    case 'players':
      return <PlayerManager />;
    case 'setup':
      return <GameSetup />;
    case 'game':
      return <ActiveGame />;
    case 'result':
      return <MatchResult />;
    default:
      return <Home />;
  }
}
