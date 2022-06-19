import { arrayUnion } from "firebase/firestore";
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
  const [timeLeft, setTimeLeft] = useState(0);
  const [code, setCode] = React.useState(`// place your code here\n`);


  const NUM_ROUNDS = 6;
  const ROUND_TIME = 10 * 1000;

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
      console.log("userData game idx: " + userData.game);
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
    let startTime = Date.now() + 15 * 1000;
    let rounds = [];
    for (let i = 0; i < NUM_ROUNDS; i++) {
      let round = { start: startTime, end: startTime + ROUND_TIME, index: i };
      rounds.push(round);
      startTime += ROUND_TIME + 3 * 1000;
    }
    console.log(JSON.stringify(rounds));
    let gamePromises = onlineUsers.map((u, i) =>
      FirebaseService.createGame(onlineUsers, i, rounds)
    );

    Promise.all(gamePromises).then((gs) => {
      let userPromises = gs.map((g, i) =>
        FirebaseService.setUserGame(onlineUsers[i], g.id)
      );
      Promise.all(userPromises).then(() => setCreating(false));
    });
  };

  const rotateGame = () => {
    var rounds = currentGame.rounds;
    rounds.splice(0, 1);
    if (!rounds.length) {return}
    var updatedGame = {
      ...currentGame,
      index: (currentGame.index + 1) % games.length,
      rounds: rounds,
    };

    var newGameIndex = (currentGame.index - 1) % games.length;
    if (newGameIndex < 0) {
      newGameIndex = games.length - 1;
    }
    console.log("user index: " + newGameIndex);
    var updatedUser = {
      game: games[newGameIndex].id,
    };

    Promise.all([
      FirebaseService.updateGame(updatedGame.id, updatedGame),
      FirebaseService.setUserGame(user.uid, updatedUser.game),
    ]);
  };


  const addPrompt = (prompt) => {
    FirebaseService.updateGame(currentGame.id, { prompts: arrayUnion(prompt) });
  };

  const addCode = (code) => {
    FirebaseService.updateGame(currentGame.id, { code: arrayUnion(code) });
  };

  useEffect(() => {
    if (currentGame) {
      let timer = setInterval(() => {
        let currentTime = (currentGame.rounds[0].end - Date.now())/1000

        setTimeLeft(currentTime)

        if (currentTime <= 0 && currentGame) {
          rotateGame();
        }
      }, 100);

      return () => {clearInterval(timer)}
    }
  }, [currentGame])


  useEffect(() => {
    
  }, [timeLeft, currentGame])

  return (
    <div className="main gradient-2">
      <a href="/">test</a>
      {!loading && games.length == 0 && (
        <button onClick={() => onCreateGame()}>Create Game</button>
      )}
      {creating && <p>creating...</p>}
      {currentGame != null && gameState == 0 && (
        <p>{currentGame.prompts[currentGame.prompts.length - 1]}</p>
      )}
      {currentGame != null && gameState == 1 && (
        <p>{currentGame.code[currentGame.code.length - 1]}</p>
      )}
      <button onClick={() => FirebaseService.resetGame(games)}>Reset</button>
      <button onClick={() => rotateGame()}>Next</button>
      {currentGame != null && gameState == 0 && (
        <div>
          <div className="topbar">
            <div className="round-info">
              <h5>Round {currentGame.rounds[0].index + 1}</h5>
              <h5>{timeLeft}</h5>
            </div>
            <div className="prompt">
              <h4>You have to code:</h4>
              <h3>test</h3>
            </div>
          </div>
        </div>
      )}
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
