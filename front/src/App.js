import React, { Component } from "react";
import { Loop, Stage, TileMap } from 'react-game-kit';

class App extends Component {

render() {
    return (
      <Loop>
        <Stage width={1024} height={576}>
            <TileMap
                src="../assets/Background.jpg"
                tileSize={128}
                columns={24}
                rows={4}
                layers={[
                    [
                    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                    ],
                ]}
            />
        </Stage>
      </Loop>
    )
  }
}

export default App;
