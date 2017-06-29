const socket = io("http://127.0.0.1:3001");

const wesh = console.log;

const exit = (code = 0) => process.exit(code);

const tileMapSize = 16;

//TODO: make this dynamic
const hubName = decodeURI(gup("hubname")) || "hub1";

const mapWidth = parseInt(gup("width")) || 40;

const mapHeight = parseInt(gup("height")) || 40;

const teams = decodeURI(gup("team")).split("*") || ["ISSOU", "BITE"];

const clientsPerTeam = parseInt(gup("number")) || 1;

//Players and map infos
const players = [];
const createMap = () => {
  let arr = new Array(mapHeight);
  for (let i = 0; i < mapHeight; i++) {
    arr[i] = new Array();
    for (let j = 0; j < mapWidth; j++) {
      arr[i].push({
        food: 0,
        entity: null,
        deraumere: 0,
        linemate: 0,
        mendiane: 0,
        phiras: 0,
        sibur: 0,
        thystame: 0
      });
    }
  }
  return arr;
};
const map = createMap();

socket.on("connect", () => {
  socket.emit("connectFront");
  wesh("I' am connected");
  socket.emit("createHub", {
    hubName: hubName,
    mapWidth: mapWidth,
    mapHeight: mapHeight,
    teams: teams,
    clientsPerTeam: clientsPerTeam
  });
  //socket.emit('join', { hubName: 'hub1', team: 'ISSOU' })
  startGame();
});

socket.on("dead", () => {
  wesh("I' dead");
  //exit();
});

socket.on(`update:${hubName}`, data => {
  wesh("I' m updated");
  wesh(data);
  parseHubData(data.hubInfo);
  parseClientsData(data.clients);
  clearEntities();
});

socket.on("disconnect", () => {
  wesh("I'm out");
  //exit()
});

socket.on("start", () => {
  wesh("Start play ");
  socket.emit("Right");
});

const createPlayer = data => {
  return Crafty.e("2D, Canvas, team1, Controls, Collision, SpriteAnimation")
    .attr({
      x: data.pos.x * tileMapSize,
      y: data.pos.y * tileMapSize,
      w: tileMapSize,
      h: tileMapSize
    })
    .reel("2", 100, [[0, 3], [1, 3], [2, 3]])
    .reel("4", 100, [[0, 1], [1, 1], [2, 1]])
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
    if (
      players.some(function(e) {
        if (e.id == data[i].id) {
          e.pos = data[i].pos;
          e.orientation = data[i].orientation;
          wesh(e.pos, e.orientation);
          e.alive = true;
        }
        return e.id == data[i].id;
      })
    ) {
    } else {
      data[i].entity = createPlayer(data[i]);
      data[i].alive = true;
      players.push(data[i]);
    }
  }
};

const parseHubData = data => {
  for (let i = 0; i < data.map.length; i++) {
    for (let j = 0; j < data.map[i].length; j++) {
      map[i][j].food = data.map[i][j].food;
      map[i][j].deraumere = data.map[i][j].deraumere;
      map[i][j].linemate = data.map[i][j].linemate;
      map[i][j].mendiane = data.map[i][j].mendiane;
      map[i][j].phiras = data.map[i][j].phiras;
      map[i][j].sibur = data.map[i][j].sibur;
      map[i][j].thystame = data.map[i][j].thystame;
      if (map[i][j].food > 0 && !map[i][j].entity) {
        map[i][j].entity = Crafty.e(`2D, Canvas, Mouse, flower, ClickFocus`)
          .attr({
            x: i * tileMapSize,
            y: j * tileMapSize
          })
          .bind("Click", function(data) {
            wesh(data);
            wesh(this.x / tileMapSize, this.y / tileMapSize);
          });
      } else if (map[i][j].food <= 0 && map[i][j].entity) {
        map[i][j].entity.destroy();
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
};

//randomy generate map
const generateWorld = () => {
  for (let i = 0; i < mapHeight; ++i) {
    for (let j = 0; j < mapWidth; ++j) {
      grassType = Math.floor(Math.random() * 4 + 1);
      Crafty.e(`2D, Canvas, Color, grass${grassType}`).attr({
        x: i * tileMapSize,
        y: j * tileMapSize
      });
    }
  }
};

const startGame = () => {
  const WelcomeDiv = document.getElementById("welcome").innerHTML = hubName;
    Crafty.init(window.innerWidth * 0.75, window.innerHeight * 0.75, document.getElementById("game"));
    Crafty.viewport.zoom(1, window.innerWidth * 0.75 / 2, window.innerHeight * 0.75 / 2);
  Crafty.addEvent(this, "mousewheel", Crafty.mouseWheelDispatch);
  //Add audio for Gameplay
  //Crafty.audio.add("PokemonSounds", "/sounds/Bourvil.mp3");
  //Crafty.audio.play("PokemonSounds", 5, 1);

  //turn the sprite map into usable components
  Crafty.sprite(16, "/images/sprite.png", {
    grass1: [0, 0],
    grass2: [1, 0],
    grass3: [2, 0],
    grass4: [3, 0],
    flower: [0, 1]
  });

  Crafty.sprite(33, "/images/Pl.png", {
    team1: [0, 2],
    team2: [3, 2]
  });

  Crafty.sprite(
    28,
    "/images/Object.png",
    {
      //Sprite for Food object.
    }
  );
  generateWorld();
};

Crafty.extend({
  mouseWheelDispatch: function(e) {
    Crafty.trigger("MouseWheel", e);
  }
});

Crafty.bind("MouseWheel", function(e) {
  let delta = (e.wheelDelta ? e.wheelDelta / 120 : e.detail) / 2;
  Crafty.viewport.zoom(
    delta > 0 ? delta + 1 : 1 / (-delta + 1),
    e.clientX,
    e.clientY,
    10
  );
});

window.onresize = function() {
    Crafty.init(window.innerWidth * 0.75, window.innerHeight * 0.75, document.getElementById("game"));
};
/*const zoom = Crafty.e("2D")

zoom.onMouseDown = e => {
  //For CraftyJS Middle === Left, I don't know why
  if (e.buttons === Crafty.mouseButtons.MIDDLE)
    Crafty.viewport.zoom(2, e.clientX, e.clientY, 500);
  else if (e.buttons === Crafty.mouseButtons.RIGHT)
    Crafty.viewport.zoom(0.5, e.clientX, e.clientY, 500);
};*/
