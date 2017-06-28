function gup(name, url) {
  if (!url) url = location.href;
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(url);
  return results == null ? null : results[1];
}

const socket = io("http://127.0.0.1:3001");

const wesh = console.log;

const exit = (code = 0) => process.exit(code);

const tileMapSize = 16;
const size = 40;
const windowSize = size * tileMapSize;

//TODO: make this dynamic
const hubName = gup("hubname") || "hub1";

const mapWidth = parseInt(gup("width")) || 40;

const mapHeight = parseInt(gup("height")) || 40;

const teams = gup("team") || ["ISSOU", "BITE"];

//Players and map infos
const players = [];
const map = [];

socket.on("connect", () => {
  socket.emit("connectFront");
  wesh("I' am connected");
  socket.emit("createHub", {
    hubName,
    mapWidth: mapWidth,
    mapHeight: mapHeight,
    teams: teams,
    clientsPerTeam: 1
  });
  //socket.emit('join', { hubName: 'hub1', team: 'ISSOU' })
  startGame();
});

socket.on("dead", () => {
  wesh("I' dead");
  //exit();
});

socket.on(`update:${hubName}`, data => {
  wesh("I' m updated")
  wesh(data)
  parseHubData(data.hubInfo)
  parseClientsData(data.clients)
  clearEntities()
});

socket.on("disconnect", () => {
  wesh("I'm out");
  //exit()
})

socket.on('start', () => {
    wesh('Start play ')
    socket.emit('Right')
})

const createPlayer = data => {
  return Crafty.e("2D, Canvas, team1, Controls, Collision, SpriteAnimation")
    .attr({
      x: data.pos.x * tileMapSize,
      y: data.pos.y * tileMapSize,
      w: tileMapSize,
      h: tileMapSize
    })
    .reel("4", 100, [[0, 3], [1, 3], [2, 3]])
    .reel("2", 100, [[0, 1], [1, 1], [2, 1]])
    .reel("3", 100, [[0, 2], [1, 2], [2, 2]])
    .reel("1", 100, [[0, 0], [1, 0], [2, 0]])
    .bind("Update", function(data) {
      this.animate(data.orientation.toString());
      this.x = data.pos.x * tileMapSize;
      this.y = data.pos.y * tileMapSize;
    });
};

const parseClientsData = data => {
  for (let i = 0; i < data.length; i++) {
    if (players.some(function(e) {
        if (e.id == data[i].id) {
          e.pos = data[i].pos;
          e.orientation = data[i].orientation;
            wesh(e.pos, e.orientation)
            e.alive = true;
        }
        return e.id == data[i].id;
      })) {} else {
      data[i].entity = createPlayer(data[i]);
      data[i].alive = true;
      players.push(data[i]);
    }
  }
};

const parseHubData = data => {
  for (let i = 0; i < data.map.length; i++) {
    for (let j = 0; j < data.map[i].length; j++) {
      let item =
        data.map[i][j].food +
        data.map[i][j].deraumere +
        data.map[i][j].linemate +
        data.map[i][j].mendiane +
        data.map[i][j].phiras +
        data.map[i][j].sibur +
        data.map[i][j].thystame;
      if (item > 0) {
          data.map[i][j].x = i
          data.map[i][j].y = j
          data.map[i][j].draw = true
          if (map.some(function(e) {
                  if (e.x == i && e.y == j) {
                      e = data.map[i][j]
                  }
                  return (e.x == i && e.y == j);
              })) {} else {
              data.map[i][j].entity = Crafty.e(`2D, Canvas, flower`).attr({
                  x: i * tileMapSize,
                  y: j * tileMapSize
              });
              map.push(data.map[i][j])
          }
      }
    }
  }
};

const clearEntities = () => {
    for (let i = 0; i < players.length; i++) {
        if (players[i].alive) {
            players[i].entity.trigger("Update", players[i]);
            players[i].alive = false;
        } else {
            players[i].entity.destroy();
            players.slice(i, 1);
        }
    }
    for (let i = 0; i < map.length; i++) {
        if (!map[i].draw) {
            map[i].entity.destroy();
            map.slice(i, 1);
        }
    }
}

//randomy generate map
const generateWorld = () => {
  for (let i = 0; i < size; ++i) {
    for (let j = 0; j < size; ++j) {
      grassType = Math.floor(Math.random() * 4 + 1);
      Crafty.e(`2D, Canvas, grass${grassType}`).attr({
        x: i * tileMapSize,
        y: j * tileMapSize
      });
    }
  }
  for (let i = 0; i < size; ++i) {
    Crafty.e(
      "2D, Canvas, wall_top, bush" + Math.floor(Math.random() * 2 + 1)
    ).attr({ x: i * tileMapSize, y: 0, z: 2 });
    Crafty.e(
      "2D, DOM, wall_bottom, bush" + Math.floor(Math.random() * 2 + 1)
    ).attr({ x: i * tileMapSize, y: (size - 1) * tileMapSize, z: 2 });
  }
  //we need to start one more and one less to not overlap the previous bushes
  for (let i = 1; i < size; i++) {
    Crafty.e(
      "2D, DOM, wall_left, bush" + Math.floor(Math.random() * 2 + 1)
    ).attr({ x: 0, y: i * tileMapSize, z: 2 });
    Crafty.e(
      "2D, Canvas, wall_right, bush" + Math.floor(Math.random() * 2 + 1)
    ).attr({ x: (size - 1) * tileMapSize, y: i * tileMapSize, z: 2 });
  }
};

const startGame = () => {
    const WelcomeDiv = document.getElementById("welcome");
    WelcomeDiv.innerHTML = hubName;
    Crafty.init(windowSize, windowSize, document.getElementById("game"));
    Crafty.addEvent(zoom, Crafty.stage.elem, "mousedown", zoom.onMouseDown);

    //Add audio for Gameplay
    //Crafty.audio.add("PokemonSounds", "/sounds/Bourvil.mp3");
    //Crafty.audio.play("PokemonSounds", 5, 1);

    //turn the sprite map into usable components
    Crafty.sprite(16, "/images/sprite.png", {
        grass1: [0, 0],
        grass2: [1, 0],
        grass3: [2, 0],
        grass4: [3, 0],
        flower: [0, 1],
    });

    Crafty.sprite(33, "/images/Pl.png" , {
        team1: [0, 2],
        team2: [3, 2]
    });

    Crafty.sprite(28, "/images/Object.png", {
      //Sprite for Food object.
    });
    generateWorld();
}

const zoom = Crafty.e("2D")

zoom.onMouseDown = e => {
  //For CraftyJS Middle === Left, I don't know why
  if (e.buttons === Crafty.mouseButtons.MIDDLE)
    Crafty.viewport.zoom(2, e.clientX, e.clientY, 500);
  else if (e.buttons === Crafty.mouseButtons.RIGHT)
    Crafty.viewport.zoom(0.5, e.clientX, e.clientY, 500);
};

