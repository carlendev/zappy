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

const join = gup("join") || 0;

if (gup("join")) {
  document.getElementById("beginButton").style.display = "none";
}

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
    wesh("Update", data)
  parseHubData(data.hubInfo);
  parseClientsData(data.clients);

  //TOTO : afficher par équipe
  players.sort(function(a, b) {
    var x = a.team.toLowerCase();
    var y = b.team.toLowerCase();
    return x < y ? -1 : x > y ? 1 : 0;
  });

  displayPlayers();
  clearEntities();
});

const displayPlayers = () => {
  const node = document.getElementById("playersName");
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
  for (let i = 0; i < players.length; i++) {
    const div = document.createElement("div");
    div.classList.add("box");
      div.classList.remove("is-danger");
      div.classList.remove("is-primary");
      div.classList.remove("is-success");
      div.classList.remove("is-warning");
      div.classList.remove("is-dark");
      if (players[i].dead) {
          div.classList.add("is-dark");
      } else {
          for (let j = 0; j < teams.length; j++) {
              if (players[i].team === teams[j]) {
                  let tmp = j % 4
                  if (tmp == 0) div.classList.add("is-danger");
                  if (tmp == 1) div.classList.add("is-primary");
                  if (tmp == 2) div.classList.add("is-success");
                  if (tmp == 3) div.classList.add("is-warning");
              }
          }
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
    const beforeTitle = document.createElement("span");
    beforeTitle.innerHTML = "Team : ";
    para.appendChild(beforeTitle);
    para.appendChild(title);

    const br = document.createElement("br");
    para.appendChild(br);

    const strong = document.createElement("strong");
    strong.innerHTML = players[i].id + " ";
    const beforeStrong = document.createElement("span");
    beforeStrong.innerHTML = "Nom : ";
    para.appendChild(beforeStrong);
    para.appendChild(strong);

    const br2 = document.createElement("br");
    para.appendChild(br2);
    const small = document.createElement("small");
    small.innerHTML = "niveau : " + players[i].lvl;
    para.appendChild(small);
  }
};

socket.on("disconnect", () => {
  wesh("I'm out");
  //exit()
});

socket.on("start", () => {
  wesh("Start play ");
  socket.emit("Right");
});

socket.on("err", err => {
  alert(err.msg);
  console.error(err);
});

document.getElementById("beginButton").addEventListener("click", () => {
  socket.emit("begin", {
    hubName: hubName
  });
});

const createPlayer = data => {
    let offset;
    for (let i = 0; i < teams.length; i++) {
        if (teams[i] === data.team) {
            let tmp = i % 4
            offset = tmp * 3
        }
    }
    return Crafty.e("2D, Canvas, team1, Mouse, SpriteAnimation")
        .attr({
            x: data.pos.x * tileMapSize,
            y: data.pos.y * tileMapSize
        }).bind("Click", function (data) {
            displayItem(this.x, this.y);
            isPlayer(this.x / tileMapSize, this.y / tileMapSize);
        }).bind("Update", function (data) {
            this.animate(data.orientation.toString(), -1);
            this.x = data.pos.x * tileMapSize;
            this.y = data.pos.y * tileMapSize;
        })
        .reel("2", 1000, [[offset, 3], [offset+1, 3], [offset+2, 3]])
        .reel("4", 1000, [[offset, 1], [offset+1, 1], [offset+2, 1]])
        .reel("3", 1000, [[offset, 2], [offset+1, 2], [offset+2, 2]])
        .reel("1", 1000, [[offset, 0], [offset+1, 0], [offset+2, 0]])
        .reel("dead", 1000, [[0, 12], [1, 12], [2, 12], [3, 12],
            [4, 12], [5, 12], [6, 12], [1, 13]]);
};

const createAnimation = data => {
    return Crafty.e("2D, Canvas, Mouse, nothing, SpriteAnimation")
        .attr({
            x: data.pos.x * tileMapSize,
            y: data.pos.y * tileMapSize
        })
        .bind("Update", function(data) {
            this.x = data.pos.x * tileMapSize;
            this.y = data.pos.y * tileMapSize;
        })
        .bind("Click", function(data) {
            displayItem(this.x, this.y);
            isPlayer(this.x / tileMapSize, this.y / tileMapSize);
        })
        .reel("lvlUp", 1000, [[0, 14], [1, 14], [2, 14], [3, 14],
            [4, 14], [5, 14], [6, 14], [7, 14], [8, 14], [9, 14]])
        .reel("eat", 800, [[0, 15], [1, 15], [2, 15], [3, 15],
            [4, 15], [5, 16]])
        .reel("fork", 1000, [[0, 16], [1, 16], [2, 16], [3, 16],
            [4, 16], [5, 16], [6, 16], [7, 16], [8, 16], [9, 16], [10, 16]]);

};

const parseClientsData = data => {
  for (let i = 0; i < data.length; i++) {
    if (players.some(function(e) {
        if (e.id == data[i].id) {
            if (e.pos !== data[i].pos || e.orientation != data[i].pos) {
                e.pos = data[i].pos
                e.orientation = data[i].orientation;
                e.entity.trigger("Update", e)
                e.animation.trigger("Update", e)
            }
            if ((!e.eat && data[i].eat === true) || (!e.take && data[i].take === true)) {
                e.animation.animate("eat", 2)
            }
            if (!e.fork && data[i].fork === true) {
                e.animation.animate("fork", 42 / freq)
            }
            if (e.lvl < data[i].lvl)
                e.animation.animate("lvlUp", 2)
            e.alive = true;
            e.lvl = data[i].lvl
            e.eat = data[i].eat
            e.take = data[i].take
            e.fork = data[i].fork
        }
        return e.id == data[i].id;
      })
    ) {
    } else {
        data[i].animation = createAnimation(data[i])
        data[i].entity = createPlayer(data[i]);
      data[i].alive = true;
      players.push(data[i]);
    }
  }
};

const parseHubData = data => {
  for (let i = 0; i < data.map.length; i++) {
    for (let j = 0; j < data.map[i].length; j++) {
      let item = data.map[i][j].food  + data.map[i][j].deraumere +
          data.map[i][j].linemate + data.map[i][j].mendiane +
          data.map[i][j].phiras + data.map[i][j].sibur + data.map[i][j].thystame;
        let itemBefore = map[i][j].food  + map[i][j].deraumere +
            map[i][j].linemate + map[i][j].mendiane +
            map[i][j].phiras + map[i][j].sibur + map[i][j].thystame;
        map[i][j].food = data.map[i][j].food;
        map[i][j].deraumere = data.map[i][j].deraumere;
        map[i][j].linemate = data.map[i][j].linemate;
        map[i][j].mendiane = data.map[i][j].mendiane;
        map[i][j].phiras = data.map[i][j].phiras;
        map[i][j].sibur = data.map[i][j].sibur;
        map[i][j].thystame = data.map[i][j].thystame;
        if (map[i][j].entity && !map[i][j].entity.isPlaying("item_break")) {
            if (item == 0 && itemBefore > 0)
                map[i][j].entity.animate("item_break")
        }
        if (item > 0 && !map[i][j].entity) {
        map[i][j].entity = Crafty.e(
          `2D, Canvas, Mouse, item, ClickFocus, SpriteAnimation`
        )
          .attr({
            x: j * tileMapSize,
            y: i * tileMapSize
          })
          .bind("Click", function(data) {
            displayItem(this.x, this.y);
            isPlayer(this.x / tileMapSize, this.y / tileMapSize);
            if (!isReallyPlayer(this.x / tileMapSize, this.y / tileMapSize)) {
              const elem = document.getElementById("playerResources");
              while (elem.firstChild) {
                elem.removeChild(elem.firstChild);
              }
            }
          })
          .bind("Focus", function() {
            this.sprite("itemHover");
          })
          .bind("Blur", function() {
            this.sprite(`item`);
          })
          .reel("item_break", 1000, [
            [0, 0],
            [1, 0],
            [2, 0],
            [3, 0],
            [4, 0],
            [5, 0],
            [6, 0],
            [7, 0],
            [8, 0],
            [9, 0],
            [10, 0],
            [11, 0],
            [12, 0],
            [13, 0],
            [14, 0],
            [15, 0],
            [16, 0],
            [17, 0],
            [18, 0],
            [19, 0],
            [20, 0],
            [21, 0],
            [22, 0],
            [23, 0],
            [24, 0],
            [25, 0],
            [26, 0],
            [27, 0],
            [28, 0],
            [29, 0],
            [30, 0],
            [31, 0],
            [32, 0],
            [33, 0],
            [34, 0],
            [35, 0],
            [36, 0],
            [37, 0],
            [38, 0],
            [39, 0],
            [40, 0],
            [41, 0],
            [42, 0],
            [43, 0],
            [44, 0],
            [45, 0],
            [46, 0],
            [47, 0],
            [48, 0]
          ]);
      } else if (item <= 0 && itemBefore == 0 && map[i][j].entity) {
              map[i][j].entity.destroy();
      }
    }
  }
};

const isPlayer = (x, y) => {
  for (let i = 0; i < players.length; i++) {

    if (players[i].pos.x === x && players[i].pos.y === y) {
      displayPlayerResources(players[i]);
    }
  }
};

const isReallyPlayer = (x, y) => {
  let player = 0;

  for (let i = 0; i < players.length; i++) {
    if (players[i].pos.x === x && players[i].pos.y === y) {
      player++;
    }
  }
  if (player > 0) {
    return true;
  }
  return false;
};

const displayPlayerResources = player => {
  const elem = document.getElementById("playerResources");
  const div = document.getElementById("playerColor");
    div.classList.remove("is-danger");
    div.classList.remove("is-primary");
    div.classList.remove("is-success");
    div.classList.remove("is-warning");
    div.classList.remove("is-dark");
    if (player.dead) {
        div.classList.add("is-dark");
    } else {
        for (let j = 0; j < teams.length; j++) {
            if (player.team === teams[j]) {
                let tmp = j % 4
                if (tmp == 0) div.classList.add("is-danger");
                if (tmp == 1) div.classList.add("is-primary");
                if (tmp == 2) div.classList.add("is-success");
                if (tmp == 3) div.classList.add("is-warning");
            }
        }
    }
  while (elem.firstChild) {
    elem.removeChild(elem.firstChild);
  }

  const spanTeam = document.createElement("span");
  spanTeam.innerHTML = "Team : " + player.team;
  elem.appendChild(spanTeam);

  const spanName = document.createElement("span");
  spanName.innerHTML = " Nom : " + player.id;
  elem.appendChild(spanName);

  const spanLevel = document.createElement("span");
  spanLevel.innerHTML = " Niveau : " + player.lvl;
  elem.appendChild(spanLevel);

  elem.appendChild(document.createElement("br"));

  const resourcesDiv = document.createElement("div");
  resourcesDiv.id = "playerResourcesTag";
  elem.appendChild(resourcesDiv);

  for (item in player.inventory) {
    createTagForPlayersResources(item, player.inventory[item]);
  }

  //parcourir l'inventaire du player
};

const createTagForPlayersResources = (name, value) => {
  if (value != 0) {
    const block = document.getElementById("playerResourcesTag");
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

const clearEntities = () => {
    var end = true;
    for (let i = 0; i < players.length; i++) {
      if (!players[i].dead)
          end = false
    if (players[i].alive) {
      players[i].alive = false;
    } else if (!players[i].entity.isPlaying("dead") && !players[i].dead) {
        wesh("Dead", players[i])
      players[i].entity.animate("dead", 0);
      players[i].dead = true;
    }
  }
  if (end)
      endMessage("Défaite")
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
  const item = map[y / tileMapSize][x / tileMapSize];
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
  for (let i = 0; i < mapWidth; ++i) {
    for (let j = 0; j < mapHeight; ++j) {
      let groundType = Math.floor(Math.random() * 9 + 1);
      Crafty.e(`2D, Canvas, ClickFocus, ground${groundType}`)
        .attr({
          x: i * tileMapSize,
          y: j * tileMapSize
        })
        .bind("Click", function(data) {
          displayItem(this.x, this.y);
          isPlayer(this.x / tileMapSize, this.y / tileMapSize);
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
  //display the name of the hub
  document.getElementById("welcome").innerHTML = hubName;

  //init the game
  Crafty.init(
    window.innerWidth * 0.75,
    window.innerHeight * 0.84,
    document.getElementById("game")
  );
  initSprites();
  //Add audio for Gameplay
  //Crafty.audio.add("PokemonSounds", "/sounds/Bourvil.mp3");
  //Crafty.audio.play("PokemonSounds", 5, 1);
  generateWorld();
};

const endMessage = (data) => {
    Crafty.e("2D, DOM, Text").attr({ x: (mapWidth - 5) * tileMapSize / 2, y: (mapHeight - 1) * tileMapSize / 2 })
        .text(data)
        .textFont({ size:`${150}px`, weight: 'bold'})
        .textColor('red');
}

const initSprites = () => {
  //turn the sprite map into usable components
  Crafty.sprite(64, "/images/Player.png", {
    team1: [0, 2],
    blood: [0, 12],
    tomb: [1, 13],
  nothing: [18, 18]
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
  Crafty.sprite(64, "/images/item.png", {
    item: [0, 0],
    itemHover: [0, 1]
  });
};

let realX = Crafty.viewport._width / 2,
  realY = Crafty.viewport._height / 2;

// Can zoom or dezoom with Up and Down, and move camera with arrow
Crafty.bind("KeyDown", function(e) {
  if (e.key === Crafty.keys.RIGHT_ARROW) Crafty.viewport.x += tileMapSize;
  else if (e.key === Crafty.keys.LEFT_ARROW) Crafty.viewport.x -= tileMapSize;
  else if (e.key === Crafty.keys.DOWN_ARROW) Crafty.viewport.y += tileMapSize;
  else if (e.key === Crafty.keys.UP_ARROW) Crafty.viewport.y -= tileMapSize;
  else if (e.key === Crafty.keys.PAGE_UP)
    Crafty.viewport.zoom(2, realX, realY, 250);
  else if (e.key === Crafty.keys.PAGE_DOWN)
    Crafty.viewport.zoom(0.5, realX, realY, 250);
});

window.onresize = function() {
    Crafty.init(
        window.innerWidth * 0.75,
        window.innerHeight * 0.84,
        document.getElementById("game")
    );
};

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
        Crafty.addEvent(this, Crafty.stage.elem, "mousemove", function(e) {
          realX = e.realX;
          realY = e.realY;
        });
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
