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
        <div className="center">
          <h2>How To Play</h2>
        </div>
        <div className="main flex-con">
          <div className="flex-item" id="instructions">
            <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Exercitationem illo, modi ipsam libero expedita facere itaque molestiae quod explicabo incidunt et! Nam tenetur unde inventore nemo, itaque eos repudiandae ipsam!</p>
          </div>
          <img src={bubbles} alt="" id="bubbles-img" className="flex-item"/>
        </div>
      </div>
    </div>
  );
};

export default Home;
