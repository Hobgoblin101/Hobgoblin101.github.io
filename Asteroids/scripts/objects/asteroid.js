//Asteroid
var ASTEROID_SPEED = 1.3; //0.8
var spawnTimer = 1;

var asteroids = [];

spawnAsteroid();
spawnAsteroid();
spawnAsteroid();
spawnAsteroid();

function spawnAsteroid(){
  var type = rand(0, 3);
  var asteroid = {};

  asteroid.image = document.createElement("img");
  asteroid.image.src = "sprites/rock_large.png";
  asteroid.width = 69;
  asteroid.height = 75;

  asteroid.Location = [1, 2]; //Make location a 2D_Vector
  //Spawn asteroid on random side of the screen
  spawnSide = rand(1, 4);
  if (spawnSide == 1){
    //Spawn top
    asteroid.Location[0] = rand(0, SCREEN_WIDTH);
    asteroid.Location[1] = 0 - asteroid.height;
  }else if (spawnSide == 2){
    asteroid.Location[1] = rand(0, SCREEN_HEIGHT);
    asteroid.Location[0] = SCREEN_WIDTH;
  }else if (spawnSide == 3){
    asteroid.Location[0] = rand(0, SCREEN_WIDTH)
    asteroid.Location[1] = SCREEN_HEIGHT;
  }else if (spawnSide == 4){
    asteroid.Location[0] = 0 - asteroid.width;
    asteroid.Location[1] = rand(0, SCREEN_HEIGHT)
  }

  //Random direction
  asteroid.Direction = [rand(-10,10), rand(-10,10)]; //Create randome direction

  var magnitude = (asteroid.Direction[0] * asteroid.Direction[0]) + (asteroid.Direction[1] * asteroid.Direction[1]);
  if (magnitude != 0){
    //Make direction in the correct raito
    var oneOverMag = 1 / Math.sqrt(magnitude);
    asteroid.Direction[0] *= oneOverMag;
    asteroid.Direction[1] *= oneOverMag;
  };

  asteroid.Move = [ asteroid.Direction[0] * SCREEN_WIDTH, asteroid.Direction[1] * SCREEN_HEIGHT ];

  new_AsteroidSpeed = rand(1, 4);

  asteroid.Velocity = [ -asteroid.Direction[0] * new_AsteroidSpeed, -asteroid.Direction[1] * new_AsteroidSpeed ];

  asteroids.push(asteroid);
};

function UpdateAsteroid(deltaTime){
  //Do for each asteroid
  for(var i=0; i < asteroids.length; i++){

    //Velocity Handler
    asteroids[i].Location[0] += asteroids[i].Velocity[0];
    asteroids[i].Location[1] += asteroids[i].Velocity[1];

    //Transpose asteroids
    if (asteroids[i].Location[0] < 1 - asteroids[i].width){
      asteroids[i].Location[0] = SCREEN_WIDTH;
    }else if ((asteroids[i].Location[0] - asteroids[i].width) > SCREEN_WIDTH){
      asteroids[i].Location[0] = 0 - asteroids[i].width;
    }else if (asteroids[i].Location[1] < 1 - asteroids[i].height){
      asteroids[i].Location[1] = SCREEN_HEIGHT;
    }else if (asteroids[i].Location[1] > SCREEN_HEIGHT){
      asteroids[i].Location[1] = 0 - asteroids[i].height;
    }
  }

  for(var i=0; i<asteroids.length; i++){

    //Check if asteroid is colliding with Player
    colliding = Distance( [(player.Location[0]), (player.Location[1])] , [(asteroids[i].Location[0] + asteroids[i].width / 2), (asteroids[i].Location[1] + asteroids[i].height / 2) ]);
    if ((colliding <= player.image.width / 1.5)){
      state = 'Death'
    }

    //After moving is finnished
    //Check if is colliding with bullet
    for (b=0; b < bullets.length; b++){

      colliding = (Distance(bullets[b].Location, [(asteroids[i].Location[0] + asteroids[i].width / 2), asteroids[i].Location[1] + asteroids[i].height /2]) <= asteroids[i].width / 1.5 )
      if (colliding == true){
        bullets.splice(b, 1);
        asteroids.splice(i, 1);
        score += 2;
      };
    }
  }


  //Check if timer has expired and it should spawn a new asteroid
  if (spawnTimer > 0){
    spawnTimer -= deltaTime;
  }else{
    spawnTimer = 1 / ((Timer / 60) + 1);
    spawnAsteroid();
  }

  //Draw all the asteroids
  for (var i=0; i<asteroids.length; i++){
    context.drawImage(asteroids[i].image, asteroids[i].Location[0] , asteroids[i].Location[1]);
  };

  spawnTimer -= deltaTime;

}

//On Finnish
tickEvents.push("UpdateAsteroid")
