import React from "react";
import "./scss/Home.scss"

const Home = () => {
  return (
    <dl>
      <dl id="join-con">
        <dl className="title-con">
          <h1 id="home-title" className="title">Telecode</h1>
        </dl>
        <dl className="center">
          <button id="join-btn">
            <h3>Join</h3>
          </button>
        </dl>
      </dl>
      <dl className="center">
        <h2>How To Play</h2>
      </dl>
      <dl className="main flex-con">
        <dl className="flex-item" id="instructions">
          <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Exercitationem illo, modi ipsam libero expedita facere itaque molestiae quod explicabo incidunt et! Nam tenetur unde inventore nemo, itaque eos repudiandae ipsam!</p>
        </dl>
        <p className="flex-item">[Some image]</p>
      </dl>
    </dl>
  );
};

export default Home;
