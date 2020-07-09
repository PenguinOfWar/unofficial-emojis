import React from 'react';

import { Emojis } from '../../lib';

import './App.scss';
import '../../lib/sass/ue.scss';

const App = () => {
  const emojis = new Emojis();

  emojis.scan();

  return (
    <div className="container app">
      <div className="row">
        <div className="col-12">
          Some text <span data-ue-icon="air_quotes"></span> goes on
        </div>
      </div>
    </div>
  );
};

export default App;
