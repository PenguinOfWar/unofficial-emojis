import React from 'react';

import { emojis } from '../../lib';

import './App.scss';

const App = () => {
  emojis();

  return (
    <div className="container app">
      <div className="row">
        <div className="col-12">Hi</div>
      </div>
    </div>
  );
};

export default App;
