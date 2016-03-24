var dt = 1.0;
var blur = 2;
var score = 0;
var startTime = Date.now();
var Timer
var highscore = getCookie("highscore");

//Load required
require("./scripts/objects/bullet.js");
require("./scripts/2dVector.js");
require("./scripts/physics.js");
require("./settings.js");
require("./scripts/objects/player.js");
require("./scripts/input.js");
require("./scripts/objects/asteroid.js");

console.debug("Running Main Script...");
//Load Sounds
fireSound = new Howl({
  urls: ["./sounds/fireEffect.ogg"],
  loop: false,
  buffer: true,
  volume: 0.5
});
musicBackground = new Howl({
  urls: ["./sounds/Moist Mechas.ogg"],
  loop: true,
  buffer: true,
  volume: 1
});
musicBackground.play();


function reset(){
  //Asteroid
  var ASTEROID_SPEED = 1.3; //0.8
  var spawnTimer = 1;
  asteroids = [];
  //Player
  player.Location = [SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2];
  player.Velocity = [0, 0];
  player.rotation = 0;
  player.direction = [0, 0];
  player.VectorRotation = [0, 0];
  player.ForwardThrust = 15;
  player.TurnSpeed = 4;
  //Bullets
  bullets = [];
  BULLET_SPEED = 10;
  //Reset inputs
  KeysDown = [];
  startTime = Date.now();
  score = 0;
};

/**Tick**/
function run() {
    //Handel Delta
    var now = Date.now();
    dt = (now - lastTime) / 1000.0;
    lastTime = now;

    InputHandeler(dt);

    if (c_filesLoading > 0){
      //Draw Loading
      context.fillStyle = "rgb(209, 209, 209)"
      context.font = "38px Arial";
      var txt = "Loading... ";
      context.fillText(txt, (15), (SCREEN_HEIGHT - 40));

      //To stop the game from running while loading
      return;
    };

    switch(state) {
      case 'Game':
          GameRun();
          break;
      case 'Death':
          DeathRun();
          break;
      case 'Splash':
          SplashRun();
          break;
      default:
          DeathRun();
  }
}

function SplashRun(){
  //Rem Text Measure

  //Draw Background
  context.fillStyle = "rgb(0, 0, 0)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  //Draw Title
  context.fillStyle = "rgb(209, 209, 209)"
  context.font = "38px Arial";
  var txt = "Welcome to Asteroids"
  context.fillText(txt, (SCREEN_WIDTH / 2 - context.measureText(txt).width / 2), (SCREEN_HEIGHT /2 - 150));

  //Draw Author
  context.fillStyle = "rgb(247, 245, 40)"
  context.font = "14px Arial";
  var txt = 'By: Ajani James Bilby'
  context.fillText(txt, (SCREEN_WIDTH / 2 - context.measureText(txt).width / 2), (SCREEN_HEIGHT /2 - 100));

  //Draw COntrols
  context.fillStyle = "rgb(255, 255, 255)"
  context.font = "18px Arial";
  var txt = 'Controls'
  context.fillText(txt, (SCREEN_WIDTH / 2 - context.measureText(txt).width / 2), (SCREEN_HEIGHT /2 - 5));
  context.fillStyle = "rgb(255, 255, 255)"
  context.font = "14px Arial";
  var txt = 'Movement: Arrow Keys'
  context.fillText(txt, (SCREEN_WIDTH / 2 - context.measureText(txt).width / 2), (SCREEN_HEIGHT /2 + 15));
  context.fillStyle = "rgb(255, 255, 255)"
  context.font = "14px Arial";
  var txt = 'Shoot: Space'
  context.fillText(txt, (SCREEN_WIDTH / 2 - context.measureText(txt).width / 2), (SCREEN_HEIGHT /2 + 30));

  //Draw Press Start Text
  context.fillStyle = "rgb(255, 255, 255)"
  context.font = "14px Arial";
  var txt = 'Press Any Key To Start'
  context.fillText(txt, (SCREEN_WIDTH / 2 - context.measureText(txt).width / 2), (SCREEN_HEIGHT /2 + 80));

  for (i=0; i < KeysDown.length; i++){
    //If any key is down goto game
    if (KeysDown[i] == true){
      state = 'Game';
      reset();
    }
  };
};

function GameRun(){
  //Fill Background
  context.fillStyle = "rgba(0, 0, 0, " +  (1 / (blur * ((Timer + 1) / 5))) + ")";
  context.fillRect(0, 0, canvas.width, canvas.height);

  UpdateBullet(dt);
  UpdatePlayer(dt);
  UpdateAsteroid(dt);

  //Draw Score
  Timer = Math.floor((Date.now() - startTime) / 1000);
  context.fillStyle = "rgb(209, 209, 209)"
  context.font = "15px Arial";
  context.fillText('Time: ' + Timer + ' sec',4,55);
  //Draw Score
  context.fillStyle = "rgb(209, 209, 209)"
  context.font = "28px Arial";
  context.fillText('Score: ' + score,4,32);
  //Draw High Score
  context.fillStyle = "rgb(209, 209, 209)"
  context.font = "20px Arial";
  var txt = 'High Score: ' + highscore
  context.fillText(txt, (SCREEN_WIDTH - (context.measureText(txt).width + 15)), 32);
};

function DeathRun(){

  //Draw Death Message
  context.fillStyle = "rgb(209, 209, 209)"
  context.font = "38px Arial";
  var txt = 'You Lost Your Machine'
  context.fillText(txt, (SCREEN_WIDTH / 2 - context.measureText(txt).width / 2), (SCREEN_HEIGHT /2 - 150));

  if ((score * Timer) >= highscore){
    //Draw Highscore
    context.fillStyle = "rgb(247, 245, 40)"
    context.font = "28px Arial";
    var txt = 'New Highscore'
    context.fillText(txt, (SCREEN_WIDTH / 2 - context.measureText(txt).width / 2), (SCREEN_HEIGHT /2 - 100));
    highscore = (score * Timer);
    setCookie('highscore', highscore, 354);
  }
  //Draw Score
  context.fillStyle = "rgb(209, 209, 209)"
  context.font = "24px Arial";
  var txt = 'Final Score: ' + (score * Timer);
  context.fillText(txt, (SCREEN_WIDTH / 2 - context.measureText(txt).width / 2), (SCREEN_HEIGHT /2 + 75));

  //Draw Restart
  context.fillStyle = "rgb(255, 255, 255)"
  context.font = "14px Arial";
  var txt = 'Press R to Restart'
  context.fillText(txt, (SCREEN_WIDTH / 2 - context.measureText(txt).width / 2), (SCREEN_HEIGHT /2 + 110));

  //If R is pressed reset
  if (KeysDown[82] == true){
    state = 'Game'
    reset();
  }
};

/**On Window Resize**/
function EventResize() {
    SCREEN_WIDTH = window.innerWidth - 0;
    SCREEN_HEIGHT = window.innerHeight - 3.5;
    canvas.height = SCREEN_HEIGHT;
    canvas.width = SCREEN_WIDTH;
};
window.addEventListener("resize", function () { EventResize(); }, false);
EventResize();

//-------------------- Don't modify anything below here
// This code will set up the framework so that the 'run' function is
// called 60 times per second. We have some options to fall back on
// in case the browser doesn't support our preferred method.
(function () {
    var onEachFrame;
    if (window.requestAnimationFrame) {
        onEachFrame = function (cb) {
            var _cb = function () { cb(); window.requestAnimationFrame(_cb); }
            _cb();
        };
    } else if (window.mozRequestAnimationFrame) {
        onEachFrame = function (cb) {
            var _cb = function () { cb(); window.mozRequestAnimationFrame(_cb); }
            _cb();
        };
    } else {
        onEachFrame = function (cb) {
            setInterval(cb, 1000 / MAXFRAMECOUNT);
        }
    }
    window.onEachFrame = onEachFrame;
})();
window.onEachFrame(run);
