const socket = io("http://127.0.0.1:3001");

const wesh = console.log;

const exit = (code = 0) => process.exit(code);

const tileMapSize = 64;

const hubName = decodeURI(gup("hubname"));
const mapWidth = parseInt(gup("width"));
const mapHeight = parseInt(gup("height"));
const teams = decodeURI(gup("team")).split("*");
const clientsPerTeam = parseInt(gup("number"));
const freq = parseInt(gup("freq")) || 2;

noUiSlider.create(stepSlider, {
  start: [freq],
  step: 8,
  range: {
    min: [2],
    max: [100]
  }
});

stepSlider.addEventListener("mouseup", function(res) {
  const freqValue = parseInt(
    document
      .getElementsByClassName("noUi-handle noUi-handle-lower")[0]
      .getAttribute("aria-valuetext")
  );

  socket.emit("sst", {
    hub: hubName,
    freq: freqValue
  });
});

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
    clientsPerTeam: clientsPerTeam,
    freq: freq
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

  //TOTO : afficher par équipe
  players.sort(function(a, b) {
    console.log("aaa", a);
    var x = a.team.toLowerCase();
    var y = b.team.toLowerCase();
    return x < y ? -1 : x > y ? 1 : 0;
  });

  const node = document.getElementById("playersName");
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
  for (let i = 0; i < players.length; i++) {
    const div = document.createElement("div");
    div.classList.add("box");
    if (!players[i].alive) {
      div.classList.add("is-dark");
    }
    node.appendChild(div);

    const article = document.createElement("article");
    article.classList.add("media");
    div.appendChild(article);

    const mediaDiv = document.createElement("div");
    mediaDiv.classList.add("media-content");
    article.appendChild(mediaDiv);

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("content");
    mediaDiv.appendChild(contentDiv);

    const para = document.createElement("p");
    contentDiv.appendChild(para);

    const title = document.createElement("strong");
    title.innerHTML = players[i].team;
    para.appendChild(title);
    const br = document.createElement("br");
    para.appendChild(br);
    const strong = document.createElement("strong");
    strong.innerHTML = players[i].id + " ";
    para.appendChild(strong);

    const small = document.createElement("small");
    small.innerHTML = players[i].lvl;
    para.appendChild(small);
  }
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
      //TODO Count all item not only food
      if (map[i][j].food > 0 && !map[i][j].entity) {
        map[i][j].entity = Crafty.e(`2D, Canvas, Mouse, item, ClickFocus`)
          .attr({
            x: i * tileMapSize,
            y: j * tileMapSize
          })
          .bind("Click", function(data) {
            displayItem(this.x, this.y);
          })
          .bind("Focus", function() {
            this.sprite("itemHover");
          })
          .bind("Blur", function() {
            this.sprite(`item`);
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

//creer tag pour ressources
const createTag = (name, value) => {
  if (value != 0) {
    const block = document.getElementById("foodBlock");
    const span = document.createElement("span");
    span.classList.add("tag");
    span.classList.add(name);
    span.innerHTML = name;
    const button = document.createElement("button");
    button.classList.add("is-small");
    button.innerHTML = value;
    span.appendChild(button);
    block.appendChild(span);
  }
};

// display what is in the case
const displayItem = (x, y) => {
  const node = document.getElementById("foodBlock");
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
  const item = map[x / tileMapSize][y / tileMapSize];
  createTag("food", item.food);
  createTag("linemate", item.linemate);
  createTag("deraumere", item.deraumere);
  createTag("mendiane", item.mendiane);
  createTag("phiras", item.phiras);
  createTag("sibur", item.sibur);
  createTag("thystame", item.thystame);
};

//randomy generate map
const generateWorld = () => {
  for (let i = 0; i < mapHeight; ++i) {
    for (let j = 0; j < mapWidth; ++j) {
      let groundType = Math.floor(Math.random() * 9 + 1);
      Crafty.e(`2D, Canvas, ClickFocus, ground${groundType}`)
        .attr({
          x: i * tileMapSize,
          y: j * tileMapSize
        })
        .bind("Click", function(data) {
          displayItem(this.x, this.y);
        })
        .bind("Focus", function() {
          this.sprite("hover");
        })
        .bind("Blur", function() {
          groundType = Math.floor(Math.random() * 4 + 1);
          this.sprite(`ground${groundType}`);
        });
    }
  }
  for (let i = -1; i <= mapWidth; i++) {
    let wallType = "wallX";
    if (i == -1) wallType = "wall_TL";
    if (i == mapWidth) wallType = "wall_TR";
    Crafty.e(`2D, Canvas, ClickFocus, ${wallType}`).attr({
      x: i * tileMapSize,
      y: -1 * tileMapSize
    });
    if (i == -1) wallType = "wall_BL";
    if (i == mapWidth) wallType = "wall_BR";
    Crafty.e(`2D, Canvas, ClickFocus, ${wallType}`).attr({
      x: i * tileMapSize,
      y: mapHeight * tileMapSize
    });
  }
  for (let i = 0; i < mapHeight; i++) {
    Crafty.e(`2D, Canvas, ClickFocus, wallY`).attr({
      x: -1 * tileMapSize,
      y: i * tileMapSize
    });
    Crafty.e(`2D, Canvas, ClickFocus, wallY`).attr({
      x: mapWidth * tileMapSize,
      y: i * tileMapSize
    });
  }
};

const startGame = () => {
  const WelcomeDiv = (document.getElementById("welcome").innerHTML = hubName);
  Crafty.init(
    window.innerWidth * 0.75,
    window.innerHeight * 0.75,
    document.getElementById("game")
  );
  // Crafty.viewport.zoom(
  //   1,
  //   window.innerWidth * 0.75 / 2,
  //   window.innerHeight * 0.75 / 2
  // );
  Crafty.addEvent(this, "mousewheel", Crafty.mouseWheelDispatch);
  //Add audio for Gameplay
  //Crafty.audio.add("PokemonSounds", "/sounds/Bourvil.mp3");
  //Crafty.audio.play("PokemonSounds", 5, 1);

  //turn the sprite map into usable components
  Crafty.sprite(64, "/images/Player.png", {
    team1: [0, 2],
    team2: [3, 2]
  });
  Crafty.sprite(64, "/images/map.png", {
    ground1: [0, 0],
    ground2: [1, 0],
    ground3: [2, 0],
    ground4: [3, 0],
    ground5: [4, 0],
    ground6: [5, 0],
    ground7: [6, 0],
    ground8: [7, 0],
    ground9: [8, 0],
    wallY: [0, 1],
    wallX: [1, 1],
    wall_TL: [2, 1],
    wall_TR: [3, 1],
    wall_BR: [4, 1],
    wall_BL: [5, 1],
    hover: [6, 1]
  });
  Crafty.sprite(64, "/images/Object.png", {
    item: [6, 20],
    itemHover: [14, 26]
  });
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
  Crafty.init(
    window.innerWidth * 0.75,
    window.innerHeight * 0.75,
    document.getElementById("game")
  );
};
/*const zoom = Crafty.e("2D")

zoom.onMouseDown = e => {
  //For CraftyJS Middle === Left, I don't know why
  if (e.buttons === Crafty.mouseButtons.MIDDLE)
    Crafty.viewport.zoom(2, e.clientX, e.clientY, 500);
  else if (e.buttons === Crafty.mouseButtons.RIGHT)
    Crafty.viewport.zoom(0.5, e.clientX, e.clientY, 500);
};*/

(function() {
  var focus_e = null;
  var entity_clicked = false;
  var init_first_entity = true;

  Crafty.c("ClickFocus", {
    init: function() {
      this.requires("Mouse");
      this.bind("Click", function() {
        if (focus_e) {
          focus_e.trigger("Blur");
        }
        focus_e = this;
        focus_e.trigger("Focus");
        entity_clicked = true;
      });

      if (init_first_entity) {
        init_first_entity = false;
        Crafty.addEvent(this, Crafty.stage.elem, "click", function() {
          if (!entity_clicked) {
            if (focus_e) {
              focus_e.trigger("Blur");
            }
            focus_e = null;
          }
          entity_clicked = false;
        });
      }
    }
  });
})();
