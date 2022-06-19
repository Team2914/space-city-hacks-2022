import React, { useEffect, useState } from "react";
import * as FirebaseService from "./api/firebase";

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

  return (
    <div>
      <a href="/">test</a>
      <p>{online.length} users online</p>
      <p>{games.length} games</p>
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
    </div>
  );
};

export default Game;
