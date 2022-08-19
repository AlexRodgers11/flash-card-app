import './App.css';
import DeckList from './components/DeckList';
import Header from './components/Header';
import Router from './components/Router';

function App() {
  return (
    <div className="App">
      <Header />
      {/* <DeckList listType="user" listId="62ec99d239500ed261745172" /> */}
      {/* <DeckList listType="category" listId="62ec99d339500ed261745209" /> */}
      {/* <DeckList listType="group" listId="62ec99d339500ed2617451e6" /> */}
      <Router />
    </div>
  );
}

export default App;
