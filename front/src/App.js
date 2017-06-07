import React, { Component } from "react";
import { Loop, Stage, TileMap } from 'react-game-kit';


class App extends Component {
  render() {
    return (
      <Loop>
          <Stage>
              <TileMap
                  src="../../assets/MegaSprite.png"
                  tileSize={128}
                  columns={24}
                  rows={4}
                  layers={[
                    [
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                    ],
                  ]}
                />
          </Stage>
      </Loop>
    );
  }
}

export default App;
