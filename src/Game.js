import React, { useEffect, useState } from "react";
import * as FirebaseService from "./api/firebase";
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import "./scss/Game.scss";
import { SAMLAuthProvider } from "@firebase/auth";

const Game = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [online, setOnline] = useState([]);
  const [games, setGames] = useState([]);
  const [creating, setCreating] = useState(false);
  const [gameState, setGameState] = useState();
  const [currentGame, setCurrentGame] = useState(null);

  useEffect(() => {
    FirebaseService.authenticateAnonymously().then((userCredentials) => {
      setUser(userCredentials.user);
    });
  }, []);

  useEffect(() => {
    if (user) {
      var onlineListener;
      var gamesListener;
      var userListener = FirebaseService.trackUser(user.uid, (data) =>
        setUserData(data)
      );
      FirebaseService.online(user.uid).then(() => {
        onlineListener = FirebaseService.getOnline((users) => {
          setOnline(users);
        });
        gamesListener = FirebaseService.getGameListener((snaps) => {
          let gs = [];
          snaps.forEach((snap) => gs.push({ ...snap.data(), id: snap.id }));
          setGames(gs);
          setLoading(false);
        });
      });
      return () => {
        try {
          onlineListener();
          gamesListener();
          userListener();
        } catch (err) {
          console.log(err);
        }
      };
    }
  }, [user]);

  useEffect(() => {
    if (userData) {
      setCurrentGame(games.find((g) => g.id === userData.game));
    }
  }, [userData, games]);

  useEffect(() => {
    if (currentGame) {
      if (currentGame.prompts.length >= currentGame.code.length) {
        setGameState(0);
      } else {
        setGameState(1);
      }
    }
  }, [currentGame]);

  const onCreateGame = () => {
    setCreating(true);
    let onlineUsers = [...online];
    let gamePromises = onlineUsers.map((u, i) =>
      FirebaseService.createGame(onlineUsers, i)
    );
    Promise.all(gamePromises).then((gs) => {
      let userPromises = gs.map((g, i) =>
        FirebaseService.setUserGame(onlineUsers[i], g.id)
      );
      Promise.all(userPromises).then(() => setCreating(false));
    });
  };

  const rotateGames = () => {
    var updatedGames = [];
    var updatedUserAssigments = [];
    games.forEach((g) => {
      g.index = (g.index + 1) % games.length;
      updatedUserAssigments.push({ user: g.players[g.index], game: g.id });
      updatedGames.push(g);
    });

    let gamePromises = updatedGames.map((g) =>
      FirebaseService.updateGame(g.id, g)
    );
    let userPromises = updatedUserAssigments.map((u) =>
      FirebaseService.setUserGame(u.user, u.game)
    );
    Promise.all([gamePromises, userPromises]);
  };

  // default code
  const [code, setCode] = React.useState(`// place your code here\n`);

  return (
    <div className="main gradient-2">
      <a href="/">test</a>
      {!loading && games.length == 0 && (
        <button onClick={() => onCreateGame()}>Create Game</button>
      )}
      {creating && <p>creating...</p>}
      {currentGame && gameState == 0 && (
        <p>{currentGame.prompts[currentGame.prompts.length - 1]}</p>
      )}
      {currentGame && gameState == 1 && (
        <p>{currentGame.code[currentGame.code.length - 1]}</p>
      )}
      <button onClick={() => rotateGames()}>Next</button>
      <div className="game-con">
        <div className="prompt-con">
            <h4 className="center bold">You have to code:</h4>
            <h5 className="center">Something super cool and amazing</h5>
        </div>
        <Editor
          value={code}
          onValueChange={code => setCode(code)}
          highlight={code => highlight(code, languages.js)}
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 12,
            border: '1px solid #e5e5e5',
            background: '#e5e5e5',
            minHeight: '250px'
          }}
        />
        <div className="status-panel">
          <h5 id="round" className="flex-item">Round 1</h5>
          <h5 id="timer" className="flex-item">Time left: 0:30s</h5>
          <button id="done" className="flex-item shaded-button">
            <h5>Done!</h5>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Game;
