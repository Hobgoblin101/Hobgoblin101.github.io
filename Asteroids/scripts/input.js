var shootTimer = 0;

/**Input Handler**/
function InputHandeler(dt) {
    if (KeysDown[KEY_UP] == true) {
        player.Velocity[0] += player.direction[0] * player.ForwardThrust * dt;
        player.Velocity[1] += player.direction[1] * player.ForwardThrust * dt;
    };
    if (KeysDown[KEY_LEFT] == true) {
        player.rotation -= player.TurnSpeed * dt;
    };
    if (KeysDown[KEY_RIGHT] == true) {
        player.rotation += player.TurnSpeed * dt;
    };
    if (KeysDown[KEY_SPACE] == true){
      if (shootTimer <= 0 && state == 'Game'){
        shootTimer = 0.3;
        playerShoot();
      }
    };

    //console.log(KeysDown)
};

/**Take RAW input**/
function onKeyDown(event) { KeysDown[event.keyCode] = true };
function onKeyUp(event) { KeysDown[event.keyCode] = false };

/**Add Event Listenter**/
window.addEventListener('keydown', function (evt) { onKeyDown(evt); }, false);
window.addEventListener('keyup', function (evt) { onKeyUp(evt); }, false);
