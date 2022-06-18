import React, { useEffect, useState } from "react";
import * as FirebaseService from "./api/firebase";

const Game = () => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    FirebaseService.authenticateAnonymously().then((userCredentials) => {
      setUser(userCredentials.user);
      console.log("signed_in");
    });
  }, []);

  useEffect(() => {
    if (user) {
      console.log("Listening");
      FirebaseService.online(user.uid);
      var listener = FirebaseService.getGameListener((snapshot) =>
        console.log("snap")
      );

      return () => {
        console.log("unmounting");
        FirebaseService.removeOnline(user.uid).then(() => {
          listener();
        });
      };
    }
  }, [user]);
  return <a href="/">test</a>;
};

export default Game;
