function gup(name, url) {
  if (!url) url = location.href;
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(url);
  return results == null ? null : results[1];
}

/*var socket = io("http://127.0.0.1:3001");

const wesh = console.log;

const exit = (code = 0) => process.exit(code);

socket.on("connect", () => {
  socket.emit("connectFront");
  wesh("I' am connected");
  socket.emit("createHub", {
    name: "test",
    properties: {
      hubName: "hub1",
      mapWidth: 8,
      mapHeight: 8,
      teams: ["ISSOU", "BITE"],
      clientsPerTeam: 1
    }
  });
});

socket.on("dead", () => {
  wesh("I' dead");
  exit();
});

socket.on("update", data => {
  wesh("I' m updated");
  wesh(prettyjson.render(data));
});

socket.on("disconnect", () => {
  wesh("I'm out");
  exit();
});*/

window.onload = () => {
  const WelcomeDiv = document.getElementById("welcome");
  const id = gup("id", window.location.href);
  WelcomeDiv.innerHTML = "Vous êtes sur la partie numéro " + id;

  const tileMapSize = 16;
  const size = 40;
  const windowSize = size * tileMapSize;

  Crafty.init(windowSize, windowSize, document.getElementById("game"));

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

  Crafty.scene("loading", () => {
    Crafty.scene("main");
  });

  Crafty.scene("main", () => {
    generateWorld();

    const team1 = Crafty.e(
      "2D, Canvas, team1, Controls, Collision, SpriteAnimation"
    )
      .attr({ x: 60, y: 60, w: tileMapSize, h: tileMapSize })
      .reel("walk_right", 100, [[0, 3], [1, 3], [2, 3]])
      .reel("walk_left", 100, [[0, 1], [1, 1], [2, 1]])
      .reel("walk_down", 100, [[0, 2], [1, 2], [2, 2]])
      .reel("walk_up", 100, [[0, 0], [1, 0], [2, 0]])
      .bind("KeyDown", function(e) {
        if (e.key === Crafty.keys.LEFT_ARROW) {
          this.animate("walk_left");
          this.x -= tileMapSize;
        } else if (e.key === Crafty.keys.RIGHT_ARROW) {
          this.animate("walk_right");
          this.x += tileMapSize;
        } else if (e.key === Crafty.keys.UP_ARROW) {
          this.animate("walk_up");
          this.y -= tileMapSize;
        } else if (e.key === Crafty.keys.DOWN_ARROW) {
          this.animate("walk_down");
          this.y += tileMapSize;
        }
      });

    const team2 = Crafty.e(
      "2D, Canvas, team2, Controls, Collision, SpriteAnimation"
    )
      .attr({ x: 100, y: 100, w: tileMapSize, h: tileMapSize })
      .reel("walk_right", 100, [[3, 3], [4, 3], [5, 3]])
      .reel("walk_left", 100, [[3, 1], [4, 1], [5, 1]])
      .reel("walk_down", 100, [[3, 2], [4, 2], [5, 2]])
      .reel("walk_up", 100, [[3, 0], [4, 0], [5, 0]])
      .bind("KeyDown", function(e) {
        if (e.key === Crafty.keys.LEFT_ARROW) {
          this.animate("walk_left");
          this.x -= tileMapSize;
        } else if (e.key === Crafty.keys.RIGHT_ARROW) {
          this.animate("walk_right");
          this.x += tileMapSize;
        } else if (e.key === Crafty.keys.UP_ARROW) {
          this.animate("walk_up");
          this.y -= tileMapSize;
        } else if (e.key === Crafty.keys.DOWN_ARROW) {
          this.animate("walk_down");
          this.y += tileMapSize;
        }
      });
  });

    var zoom = Crafty.e("2D");
        zoom.onMouseDown = function(e) {
            Crafty.viewport.zoom(2, 100, 100, 500);
        };
    Crafty.addEvent(zoom, Crafty.stage.elem, "mousedown", zoom.onMouseDown);

  Crafty.scene("loading");
};
