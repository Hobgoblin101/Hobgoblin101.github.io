console.debug("Running Physics...");

//Setup variables
var Friction = 1.01; //1.025
var lastTime;
var KeysDown = [];
var dt;
var MAXFRAMECOUNT = 60;

//Tests if two rectangles are intersecting
//Pass in the x,y coordinates, width and height of each rectange.
//Return 'true' if the rectangles are intersecting.
function intersects(x1, y1, w1, h1, x2, y2, w2, h2){

  if (y2 + h2 < y1 || x2 + w2 < x1 || x2 > x1 + w1 || y2 > y1 + h1){
    return false;
  };

  return true;
};
