import React from 'react';

import './App.scss';
import '../../lib/sass/ue.scss';

const App = () => {
  return (
    <div className="app container-fluid">
      <div className="row">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="jumbotron bg-secondary text-white text-center">
                <h1 className="display-5">Unofficial Emojis</h1>
                <p className="lead">
                  An easy to use and lightweight library for awesome unofficial
                  emojis <span data-ue-icon="air_quotes" />
                </p>
                <p className="lead">Comes in two delicious flavours:</p>
                <ul className="lead list-unstyled">
                  <li>
                    Vanilla <span data-ue-icon="ice_cream_parrot" />
                  </li>
                  <li>React</li>
                </ul>
                <hr className="my-4" />
                <p>
                  On this page you will find interactive examples. Please
                  consult the documentation for further details and a tutorial.
                </p>
                <ul className="list-inline">
                  <li className="list-inline-item">
                    <a
                      className="btn btn-dark btn-lg"
                      href="https://github.com/PenguinOfWar/unofficial-emojis"
                      target="_blank"
                      rel="noopener noreferrer"
                      role="button"
                    >
                      Documentation
                    </a>
                  </li>
                  <li className="list-inline-item">
                    <a
                      className="btn btn-dark btn-lg"
                      href="https://github.com/PenguinOfWar/unofficial-emojis/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      role="button"
                    >
                      Support
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="container pb-4">
          <div className="row">
            <div className="col-12">
              <div className="card bg-secondary text-white">
                <div className="card-body">
                  <h2 className="card-title display-4">Demos &amp; Examples</h2>
                  <p className="card-text">
                    The following examples are generic usage examples that
                    assume you have either followed the tutorial to get started,
                    or know enough that this will just make sense.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
