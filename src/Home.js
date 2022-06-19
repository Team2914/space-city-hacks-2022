import React from "react";
import { Link } from "react-router-dom";
import "./scss/Home.scss";
import code from "./assets/code.svg";
import bubbles from "./assets/bubbles.svg";

const Home = () => {
  return (
    <div>
      <div id="join-con">
        <img src={code} alt="" id="code-img"/>
        <div className="title-con">
          <h1 id="home-title" className="title">Telecode</h1>
        </div>
        <div className="center">
          <div id="join-btn">
            <Link to="/play" id="join-btn-text">
              Join
            </Link>
          </div>
        </div>
      </div>
      <div id="lower">
        <div className="main">
          <div id="instructions">
            <h2>How To Play</h2>
            <p>
              Telecode is a game where every player will start out with a prompt,
              and have 3 minutes to code a solution to the prompt.<br/><br/> After the 3 minutes have elapsed, you will
              get 3 minutes to describe someone else's code.<br/><br/> At the end of a few of these rounds you can see 
              a map of all the prompts, the paths they took, and all the interesting ways the code got distorted 
              down the line!
            </p>
          </div>
          <img src={bubbles} alt="" id="bubbles-img"/>
        </div>
      </div>
    </div>
  );
};

export default Home;
