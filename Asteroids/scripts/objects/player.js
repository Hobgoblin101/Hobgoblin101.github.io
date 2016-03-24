require("./settings.js");
require("./scripts/2dVector.js");
require("./scripts/input.js");
require("./scripts/objects/bullet.js");
require("./scripts/physics.js");

console.debug('Running Player...');

//Player
var player = {
    image: document.createElement("img"),
    Location: [SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2],
    Velocity: [0, 0],
    rotation: 0,
    direction: [0, 0],
    VectorRotation: [0, 0],
    ForwardThrust: 15,
    TurnSpeed: 4,
    s: 0,
    c: 0
};
player.image.src = "sprites/ship.png"

function UpdatePlayer(dt){
  //Get Rotation
  player.direction[0] = (0 * Math.cos(player.rotation)) - (1 * Math.sin(player.rotation));
  player.direction[1] = (0 * Math.cos(player.rotation)) + (1 * Math.cos(player.rotation));

  //Handle Velocity and Movement
  player.Location[0] += player.Velocity[0];
  player.Location[1] += player.Velocity[1];
  player.Velocity[0] = player.Velocity[0] / Friction;
  player.Velocity[1] = player.Velocity[1] / Friction;

  //Transpose Player
  if (player.Location[0] < 1 - player.image.width){
    player.Location[0] = SCREEN_WIDTH;
  }else if ((player.Location[0] - player.image.width) > SCREEN_WIDTH){
    player.Location[0] = 0 - player.image.width;
  }else if (player.Location[1] < 1 - player.image.height){
    player.Location[1] = SCREEN_HEIGHT;
  }else if (player.Location[1] > SCREEN_HEIGHT){
    player.Location[1] = 0 - player.image.height;
  }

  //Draw Player
  context.save();
  context.translate(player.Location[0], player.Location[1]);
  context.rotate(player.rotation);
  context.drawImage(player.image, -player.image.width / 2, -player.image.height / 2);
  context.restore();
};

//On Finnish
tickEvents.push("UpdatePlayer")
