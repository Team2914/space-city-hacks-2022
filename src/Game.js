import { arrayUnion } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import * as FirebaseService from "./api/firebase";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css";
import "./scss/Game.scss";

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
  const [code, setCode] = React.useState(``);
  const [update, setUpdate] = useState(false);

  const [updating, setUpdating] = useState(false);

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
      var userListener = FirebaseService.trackUser(user.uid, (data) => {
        setUserData(data);
      });
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
      if (currentGame.prompts.length > currentGame.code.length) {
        setGameState(0);
      } else {
        setGameState(1);
      }
    }
  }, [currentGame]);

  const onCreateGame = () => {
    setCreating(true);
    let onlineUsers = [...online];
    let startTime = Date.now() + 0 * 1000;
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

  const rotateGame = async () => {
    setUpdating(true);

    var rounds = [...currentGame.rounds];
    rounds.splice(0, 1);
    if (!rounds.length) {
      return;
    }
    var updatedGame = {
      ...currentGame,
      index: (currentGame.index + 1) % games.length,
      rounds: rounds,
    };

    console.log("code: " + code);
    if (gameState === 0) {
      updatedGame.code = [...currentGame.code, code];
    } else if (gameState === 1) {
      updatedGame.prompts = [...currentGame.prompts, code];
    }

    console.log(JSON.stringify(updatedGame));

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
    ]).then(() => {
      setCode("");
      setUpdating(false);
    });
  };

  useEffect(() => {
    if (currentGame) {
      let timer = setInterval(() => {
        const currentTime = (currentGame.rounds[0].end - Date.now()) / 1000;
        setTimeLeft(currentTime);

        if (currentTime <= 0 && currentGame && !updating) {
          console.log("rotating " + code);

          setUpdate(true);
        }
      }, 100);

      return () => {
        clearInterval(timer);
      };
    }
  }, [currentGame]);

  useEffect(() => {
    if (update) {
      rotateGame();
      setUpdate(false);
    }
  }, [update]);

  return (
    <div className="main gradient-2">
      <a href="/">test</a>
      {!loading && games.length === 0 && (
        <button onClick={() => onCreateGame()}>Create Game</button>
      )}
      {creating && <p>creating...</p>}
      {currentGame != null && gameState === 1 && (
        <p>{currentGame.code[currentGame.code.length - 1]}</p>
      )}
      <button onClick={() => FirebaseService.resetGame(games)}>Reset</button>
      <button onClick={() => rotateGame()}>Next</button>

      {currentGame != null && (
        <div className="game-con">
          {gameState === 0 && (
            <div>
              <div className="prompt-con">
                <h4 className="center bold">You have to code:</h4>
                <h5 className="center">
                  {currentGame.prompts[currentGame.prompts.length - 1]}
                </h5>
              </div>
              <Editor
                value={code}
                onValueChange={(code) => setCode(code)}
                highlight={(code) => highlight(code, languages.js)}
                padding={10}
                placeholder="// place your code here"
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  fontSize: 12,
                  border: "1px solid #e5e5e5",
                  background: "#e5e5e5",
                  minHeight: "250px",
                }}
              />
            </div>
          )}
          {gameState === 1 && (
            <div>
              <div className="prompt-con">
                <h4 className="center bold">You have to describe:</h4>
              </div>

              <Editor
                value={currentGame.code[currentGame.code.length - 1]}
                contentEditable={false}
                highlight={(code) => highlight(code, languages.js)}
                padding={10}
                id="editor"
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  fontSize: 12,
                  border: "1px solid #e5e5e5",
                  background: "#e5e5e5",
                  margin: "1rem",
                }}
              />
              <textarea
                value={code}
                onChange={(event) => {setCode(event.target.value)}}
                padding={10}
                id="describe-input"
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  fontSize: 12,
                  border: "1px solid #e5e5e5",
                  background: "#e5e5e5",
                  minHeight: "250px",
                  width: "calc(100% - 2rem)z",
                  margin: "1rem",
                }}
                placeholder="Describe the code..."
            />
            </div>
          )}
          {currentGame != null && gameState === 0 && (
            <div className="status-panel">
              <h5 id="round" className="flex-item">
                Round {/*currentGame.rounds[0].index + 1*/}
              </h5>
              <h5 id="timer" className="flex-item">
                Time left: {Math.floor(timeLeft / 60)}:
                {Math.max((timeLeft % 60).toPrecision(2), 0)}s
              </h5>
              {/*<button id="done" className="flex-item shaded-button">
                <h5>Done!</h5>
          </button>*/}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Game;
