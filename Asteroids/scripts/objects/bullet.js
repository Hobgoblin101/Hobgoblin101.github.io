var bullets = [];
var BULLET_SPEED = 10;

function playerShoot() {
    var bullet = {
      image: document.createElement("img"),
      Location: [player.Location[0], player.Location[1]],
      width: 5,
      height: 5,
      Velocity: [0, 0],
      lifeTime: 10
    };

    bullet.image.src = "./sprites/bullet.png"

    //Rotate velocity to be relative to ship
    var s = Math.sin(player.rotation);
    var c = Math.cos(player.rotation);

    bullet.Velocity[0] = (0 - (1 * s)) * BULLET_SPEED + (player.Velocity[0] / 1.5);
    bullet.Velocity[1] = (0 + (1 * c)) * BULLET_SPEED + (player.Velocity[1] / 1.5);

    bullets.push(bullet);
    score -= 1;
    fireSound.play();
};

function UpdateBullet(deltaTime){
  //update the shoot timer
  if (shootTimer > 0){
    shootTimer -= deltaTime;
  }

  //update all bullets
  for (i = 0; i < bullets.length; i++){

    //Move bullets based on velocity
    bullets[i].Location[0] += bullets[i].Velocity[0];
    bullets[i].Location[1] += bullets[i].Velocity[1];

    //Draw each bullet
    context.drawImage(bullets[i].image, bullets[i].Location[0] - bullets[i].width / 2, bullets[i].Location[1] - bullets[i].height / 2);

    if (bullets[i].Location[0] > SCREEN_WIDTH ||
        bullets[i].Location[0] < 0 ||
        bullets[i].Location[1] > SCREEN_HEIGHT ||
        bullets[i].Location[1] < 0){
      //Remove bullet from array
      bullets.splice(i, 1);
    }

  }
}

//On Finnish
tickEvents.push("UpdateBullet");
