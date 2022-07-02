"use strict";

/* global p5 */
/* exported preload, setup, draw, mouseClicked */

let tile_height;
let tile_width;
let tile_columns;
let tile_rows;
let camera_velocity;
let camera_offset;


function setup() {
  //frameRate(5);
  camera_offset = new p5.Vector(0, 0);
  camera_velocity = new p5.Vector(0, 0); 

  let canvas = createCanvas(600, 600);
  canvas.parent("container");  

  if (window.p3_setup) {
    window.p3_setup();           
  }

  let label = createP();      
  label.html("World key: ");
  label.parent("container");

  let input = createInput("cm147");
  input.parent(label);
  input.input(() => {
    rebuildWorld(input.value());
  });

  createP("Arrow keys scroll. Clicking changes tiles.").parent("container");

  rebuildWorld(input.value());
}

function rebuildWorld(key) {
  if (window.p3_worldKeyChanged) { 
    window.p3_worldKeyChanged(key);
  }
  tile_width = window.p3_tileWidth ? window.p3_tileWidth() : 32;  
  tile_height = window.p3_tileHeight ? window.p3_tileHeight() : 32;  
  tile_columns = Math.ceil(width / tile_width);
  tile_rows = Math.ceil(height / tile_height);
}

function cameraToWorldOffset([camera_x, camera_y]) {
  let world_x = camera_x / (tile_width);
  let world_y = camera_y / (tile_height);
  return { x: Math.round(world_x), y: Math.round(world_y) };
}



let logged = false;
let colorGrid;
function draw() {
  // Keyboard controls!
  if (keyIsDown(LEFT_ARROW)) {
    camera_velocity.x -= 1;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    camera_velocity.x += 1;
  }
  if (keyIsDown(DOWN_ARROW)) {
    camera_velocity.y += 1;
  }
  if (keyIsDown(UP_ARROW)) {
    camera_velocity.y -= 1;
  }

  let camera_delta = new p5.Vector(0, 0);
  camera_velocity.add(camera_delta);
  camera_offset.add(camera_velocity);
  camera_velocity.mult(0.95); // cheap easing
  if (camera_velocity.mag() < 0.01) {
    camera_velocity.setMag(0);
  }

  let world_pos = screenToWorld(
    [mouseX, mouseY],
    [camera_offset.x, camera_offset.y]
  );
  let world_offset = cameraToWorldOffset([camera_offset.x, camera_offset.y]);

  background(0);

  if (window.p3_drawBefore) {
    window.p3_drawBefore();
  }


colorGrid = [tile_columns];
for (let a=0; a<tile_columns; a++) colorGrid[a] = Array(tile_rows);

  for (let y = 0; y < tile_rows; y++) {
    for (let x = 0; x < tile_columns; x++) {
      //colorGrid[x][y] = drawTile([x + world_offset.x, y + world_offset.y], [camera_offset.x,camera_offset.y], x, y);
      colorGrid[x][y] = drawTile(world_offset.x, world_offset.y, camera_offset.x, camera_offset.y, x, y);
      if (x>0) autoTileLeft(world_offset.x, world_offset.y, camera_offset.x, camera_offset.y, x, y);
      if (y>0) autoTileUp(world_offset.x, world_offset.y, camera_offset.x, camera_offset.y, x, y);
    }
    autoTileLeft(world_offset.x, world_offset.y, camera_offset.x, camera_offset.y, tile_columns, y);
  }
  //world_offset is actually camera position
  //camera_offset is camera offset from origin

  //autotile test 3,1 and 3,2
  fill(colorGrid[3][2]);
  push();
  //translate(world_offset.x * tile_width - camera_offset.x, world_offset.y * tile_height - camera_offset.y);
  translate(world_offset.x+width/2, world_offset.y+height/2);
  //translate(camera_offset.x, camera_offset.y);
  //circle(1.5*tile_width, 1.5*tile_height, 100);
  pop();

  if (!logged) {
    console.log(colorGrid);
    logged = true;
  }
  //throw new Error("debugging colorgrid");
  describeMouseTile(world_pos, [camera_offset.x, camera_offset.y]);

  if (window.p3_drawAfter) {
    window.p3_drawAfter();
  }
}

function autoTileLeft(world_x, world_y, camera_x, camera_y, x, y) {
  push();
  fill(colorGrid[x-1][y]);
  //translate(world_offset.x*tile_width-camera_offset.x, world_offset.y*tile_height-camera_offset.y);
  translate((world_x+x)*tile_width - camera_x, (world_y+y)*tile_height - camera_y);
  circle(-9*tile_width/8, tile_height/2, tile_width/4);
  circle(tile_width/8, tile_height/2, tile_width/4);
  pop();
}

function autoTileUp(world_x, world_y, camera_x, camera_y, x, y) {
  push();
  fill(colorGrid[x][y-1]);
  translate((world_x+x)*tile_width - camera_x, (world_y+y)*tile_height - camera_y);
  circle(tile_width/2, -9*tile_height/8, tile_height/4);
  circle(tile_width/2, tile_height/8, tile_width/4);
  pop();
}

function screenToWorld([mouse_x, mouse_y], [camera_x, camera_y]) {
  mouse_x += camera_x - p3_tileWidth()/2;
  mouse_y += camera_y - p3_tileHeight()/2;
  mouse_x /= tile_width;
  mouse_y /= tile_height;
  return [Math.round(mouse_x), Math.round(mouse_y)];
}

// Display a discription of the tile at world_x, world_y.
function describeMouseTile([world_x, world_y], [camera_x, camera_y]) {
  if (window.p3_drawSelectedTile) {
    push()
    translate(world_x * tile_width - camera_x, world_y * tile_height - camera_y);
    window.p3_drawSelectedTile(world_x, world_y/*, camera_x, camera_y*/);
    pop()
  }
}



// Draw a tile, mostly by calling the user's drawing code.
function drawTile(world_x, world_y, camera_x, camera_y, x, y) {
  push();
  let drewcolor;
  //translate(world_x * tile_width - camera_x, world_y * tile_height - camera_y);//(world_offset.x + x)*tile_width - camera_x
  translate((world_x+x)*tile_width - camera_x, (world_y+y)*tile_height - camera_y);
  //circle(0, 0, 5);
  if (window.p3_drawTile) {
    drewcolor = window.p3_drawTile(world_x+x, world_y+y);
  }
  pop();
  //console.log("drawTile: ", drewcolor);
  return drewcolor;
}



function mouseClicked() {
  let world_pos = screenToWorld(
    [mouseX, mouseY],
    [camera_offset.x, camera_offset.y]
  );

  if (window.p3_tileClicked) {
    window.p3_tileClicked(world_pos[0], world_pos[1]);
  }
  return false;
}
