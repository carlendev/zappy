window.onload = () => {
    //start crafty
    var _this;

    Crafty.init(400,320, document.getElementById('game'));
    //	Crafty.init(400, 320);
    //	Crafty.canvas();

    //turn the sprite map into usable components
    Crafty.sprite(16, "/images/sprite.png", {
        grass1: [0,0],
        grass2: [1,0],
        grass3: [2,0],
        grass4: [3,0],
        flower: [0,1],
        bush1: [0,2],
        bush2: [1,2],
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
        
        Crafty.c('CustomControls', {
            __move: {left: false, right: false, up: false, down: false},	
            _speed: 3,
            
            CustomControls: function(speed) {
                if(speed) this._speed = speed;
                var move = this.__move;
                
                this.bind('enterframe', function() {
                    //move the player in a direction depending on the booleans
                    //only move the player in one direction at a time (up/down/left/right)
                    if(Crafty.keydown["ArrowRight"] || Crafty.keydown["Right"]) this.x += this._speed;
                    else if(Crafty.keydown["ArrowLeft"] || Crafty.keydown["Left"]) this.x -= this._speed;
                    else if(Crafty.keydown["ArrowUp"] || Crafty.keydown["Up"]) this.y -= this._speed;
                    else if(Crafty.keydown["ArrowDown"] || Crafty.keydown["Down"]) this.y += this._speed;
                });
                
                return this;
            }
        });


        //create our player entity with some premade components
        _this = player = Crafty.e("2D, Canvas, player, Controls, CustomControls, SpriteAnimation, Collision")
            .attr({x: 160, y: 144, z: 1})
            .CustomControls(1)
            .reel("walk_left", 6, 3, 8)
            .reel("walk_right", 9, 3, 11)
            .reel("walk_up", 3, 3, 5)
            .reel("walk_down", 0, 3, 2)
            .bind("enterframe", function(e) {
                if(Crafty.keydown["ArrowLeft"] || Crafty.keydown["Left"]) {
                    if(!this.isPlaying("walk_left"))
                        this.stop().animate("walk_left", 10);
                } else if(Crafty.keydown["ArrowRight"] || Crafty.keydown["Right"]) {
                    if(!this.isPlaying("walk_right"))
                        this.stop().animate("walk_right", 10);
                } else if(Crafty.keydown["ArrowUp"] || Crafty.keydown["Up"]) {
                    if(!this.isPlaying("walk_up"))
                        this.stop().animate("walk_up", 10);
                } else if(Crafty.keydown["ArrowDown"] || Crafty.keydown["Down"]) {
                    if(!this.isPlaying("walk_down"))
                        this.stop().animate("walk_down", 10);
                }
            }).bind("keyup", function(e) {
                this.stop();
            })
            .collision()
            .onHit("wall_left", function() {
                this.x += this._speed;
                this.stop();
            }).onHit("wall_right", function() {
                this.x -= this._speed;
                this.stop();
            }).onHit("wall_bottom", function() {
                this.y -= this._speed;
                this.stop();
            }).onHit("wall_top", function() {
                this.y += this._speed;
                this.stop();
            });
    });

    //automatically play the loading scene
    Crafty.scene("loading");


    setTimeout(() => {
        setInterval(() => { _this.x += _this._speed }, 10)
    }, 2000)
}