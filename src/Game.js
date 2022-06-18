import React, { useEffect, useState } from "react";
import * as FirebaseService from "./api/firebase";

const Game = () => {
  const [user, setUser] = useState(null);
  const [online, setOnline] = useState([]);
  useEffect(() => {
    FirebaseService.authenticateAnonymously().then((userCredentials) => {
      setUser(userCredentials.user);
      console.log("signed_in");
    });
  }, []);

  useEffect(() => {
    if (user) {
      console.log("Listening");
      FirebaseService.online(user.uid).then(() => {
        FirebaseService.getOnline().then((users) => {
          setOnline(users);
        });
      });
    }
  }, [user]);
  return (
    <div>
      <a href="/">test</a>
      <p>{online.length} users online</p>
    </div>
  );
};

export default Game;
