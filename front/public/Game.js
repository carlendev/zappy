window.onload = () => {
    //start crafty
    var _this;

    Crafty.init(400,320, document.getElementById('game'));
    //turn the sprite map into usable components
    Crafty.sprite(16, "/images/sprite.png", {
        grass1: [0,0],
        grass2: [1,0],
        grass3: [2,0],
        grass4: [3,0],
        flower: [0,1],
        bush1:  [0,2],
        bush2:  [1,2],
        player: [0,3]
    });

    //method to randomy generate the map
    function generateWorld() {
        //generate the grass along the x-axis
        for(var i = 0; i < 25; i++) {
            //generate the grass along the y-axis
            for(var j = 0; j < 20; j++) {
                grassType = Math.floor((Math.random() * 4) + 1);
                Crafty.e("2D, Canvas, grass"+grassType)
                    .attr({x: i * 16, y: j * 16});
                
                //1/50 chance of drawing a flower and only within the bushes
                if(i > 0 && i < 24 && j > 0 && j < 19 && (Math.floor((Math.random() * 50) + 0)) > 49) {
                    Crafty.e("2D, DOM, flower, SpriteAnimation")
                        .attr({x: i * 16, y: j * 16})
                        .animate("wind", 0, 1, 3)
                        .bind("enterframe", function() {
                            if(!this.isPlaying())
                                this.animate("wind", 80);
                        });
                }
            }
        }
        
        //create the bushes along the x-axis which will form the boundaries
        for(var i = 0; i < 25; i++) {
            Crafty.e("2D, Canvas, wall_top, bush"+Math.floor((Math.random() * 2) + 1))
                .attr({x: i * 16, y: 0, z: 2});
            Crafty.e("2D, DOM, wall_bottom, bush"+Math.floor((Math.random() * 2) + 1))
                .attr({x: i * 16, y: 304, z: 2});
        }
        
        //create the bushes along the y-axis
        //we need to start one more and one less to not overlap the previous bushes
        for(var i = 1; i < 19; i++) {
            Crafty.e("2D, DOM, wall_left, bush"+Math.floor((Math.random() * 2) + 1))
                .attr({x: 0, y: i * 16, z: 2});
            Crafty.e("2D, Canvas, wall_right, bush"+Math.floor((Math.random() * 2) + 1))
                .attr({x: 384, y: i * 16, z: 2});
        }
    }

    //the loading screen that will display while our assets load
    Crafty.scene("loading", function() {
        //load takes an array of assets and a callback when complete
        const sprite =  {
            "sprites": {
                "/images/sprite.png": {}
            }
        }
        Crafty.load(sprite, function() {
            Crafty.scene("main"); //when everything is loaded, run the main scene
        });
        
        //black background with some loading text
        Crafty.background("#000");
        Crafty.e("2D, DOM, Text").attr({w: 100, h: 20, x: 150, y: 120})
            .text("Loading")
            .css({"text-align": "center"});
    });

    Crafty.scene("main", function() {
        generateWorld();
        
        Crafty.e("2D, Canvas, player, Controls, Collision")
            .attr({x: 10, y: 10, w: 30, h: 30})
            .bind('KeyDown', function(e) {
                if(e.key == Crafty.keys.LEFT_ARROW) {
                this.x = this.x - 1;
                } else if (e.key == Crafty.keys.RIGHT_ARROW) {
                this.x = this.x + 1;
                } else if (e.key == Crafty.keys.UP_ARROW) {
                this.y = this.y - 1;
                } else if (e.key == Crafty.keys.DOWN_ARROW) {
                this.y = this.y + 1;
                }
            })
            .collision()
                .onHit("wall_left", function() {
                    this.x += 1;
                }).onHit("wall_right", function() {
                    this.x -= 1;
                }).onHit("wall_bottom", function() {
                    this.y -= 1;
                }).onHit("wall_top", function() {
                    this.y += 1;
                });
});

    //automatically play the loading scene
    Crafty.scene("loading");
}