import logo from "./logo.svg";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import Signin from "./Signin";
import Game from "./Game";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>
          Codeaphone
        </h1>
        <button>
          Join
        </button>
      </header>
    </div>
  );
}

export default App;
