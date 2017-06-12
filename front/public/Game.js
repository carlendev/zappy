window.onload = () => {

    const tileMapSize = 16
    const size = 50
    const windowSize = 50 * tileMapSize
    
    Crafty.init(windowSize, windowSize, document.getElementById('game'))

    //Add audio for evolution
    Crafty.audio.add("PokemonSounds", "/sounds/PokemonSounds.mp3")
    Crafty.audio.play("PokemonSounds", 5, 1)

    //turn the sprite map into usable components
    Crafty.sprite(16, '/images/sprite.png', {
        grass1: [0,0],
        grass2: [1,0],
        grass3: [2,0],
        grass4: [3,0],
        flower: [0,1],
        bush1:  [0,2],
        bush2:  [1,2],
        player: [0,3]
    })

    //method to randomy generate the map
    const generateWorld = () => {
        //generate the grass along the x-axis
        for(let i = 0; i < size; ++i) {
            //generate the grass along the y-axis
            for(let j = 0; j < size; ++j) {
                grassType = Math.floor((Math.random() * 4) + 1)
                Crafty.e(`2D, Canvas, grass${grassType}`).attr({ x: i * tileMapSize, y: j * tileMapSize })
            }
        }   
        
        //create the bushes along the x-axis which will form the boundaries
        for(let i = 0; i < size; ++i) {
            Crafty.e('2D, Canvas, wall_top, bush' + Math.floor((Math.random() * 2) + 1))
                .attr({ x: i * tileMapSize, y: 0, z: 2 });
            Crafty.e('2D, DOM, wall_bottom, bush' + Math.floor((Math.random() * 2) + 1))
                .attr({ x: i * tileMapSize, y: (size - 1) * tileMapSize, z: 2 });
        }
        
        //create the bushes along the y-axis
        //we need to start one more and one less to not overlap the previous bushes
        for(let i = 1; i < size; i++) {
            Crafty.e('2D, DOM, wall_left, bush' + Math.floor((Math.random() * 2) + 1))
                .attr({ x: 0, y: i * tileMapSize, z: 2 });
            Crafty.e('2D, Canvas, wall_right, bush' + Math.floor((Math.random() * 2) + 1))
                .attr({ x: (size - 1) * tileMapSize, y: i * tileMapSize, z: 2 });
        }
    }

    //the loading screen that will display while our assets load
    Crafty.scene('loading', () => {
        //load takes an array of assets and a callback when complete
        Crafty.scene('main') //when everything is loaded, run the main scene
        
        //black background with some loading text
        Crafty.background('#000')
        Crafty.e('2D, DOM, Text').attr({ w: 100, h: 20, x: 150, y: 120 })
            .text('Loading')
            .css({ 'text-align': 'center' })
    })

    Crafty.scene('main', () => {
        Crafty.background('#000')
        generateWorld()
        
        Crafty.e('2D, Canvas, player, Controls, Collision, SpriteAnimation')
            .attr({ x: 16, y: 16, w: tileMapSize, h: tileMapSize })
            .reel("walk_right", 100, [ [9, 3], [10, 3], [11, 3] ])
            .reel("walk_left", 100, [ [6, 3], [7, 3], [8, 3] ])
            .reel("walk_down", 100, [ [0, 3], [1, 3], [2, 3] ])
            .reel("walk_up", 100, [ [3, 3], [4, 3], [5, 3] ])
            .bind('KeyDown', function(e) {
                if(e.key === Crafty.keys.LEFT_ARROW) {
                    this.animate('walk_left')
                    this.x -= tileMapSize
                }
                else if (e.key === Crafty.keys.RIGHT_ARROW) {
                    this.animate('walk_right')
                    this.x += tileMapSize
                }
                else if (e.key === Crafty.keys.UP_ARROW) {
                    this.animate('walk_up')
                    this.y -= tileMapSize
                }
                else if (e.key === Crafty.keys.DOWN_ARROW) {
                    this.animate('walk_down')
                    this.y += tileMapSize
                }
            })
            .collision()
            .onHit('wall_left', function() {
                this.x += tileMapSize
            }).onHit('wall_right', function() {
                this.x -= tileMapSize
            }).onHit('wall_bottom', function() {
                this.y -= tileMapSizex
            }).onHit('wall_top', function() {
                this.y += tileMapSize
            })
    })
    Crafty.scene('loading')
}