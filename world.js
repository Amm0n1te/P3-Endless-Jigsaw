"use strict";

/* global XXH */
/* exported --
    p3_preload
    p3_setup
    p3_worldKeyChanged
    p3_tileWidth
    p3_tileHeight
    p3_tileClicked
    p3_drawBefore
    p3_drawTile
    p3_drawSelectedTile
    p3_drawAfter
*/

let orange = '#FB8500';
let blue = '#219EBC';
let white = '#EBF5DF';

function p3_preload() {}

function p3_setup() {}

let worldSeed;

function p3_worldKeyChanged(key) {
  worldSeed = XXH.h32(key, 0);
  noiseSeed(worldSeed);  
  randomSeed(worldSeed);
}

function p3_tileWidth() {
  return 64;
}
function p3_tileHeight() {
  return 64;
}

let [tw, th] = [p3_tileWidth(), p3_tileHeight()];

let clicks = {};

function p3_tileClicked(i, j) {
  let key = [i, j];
  clicks[key] = 1 + (clicks[key] | 0);
  console.log(i, j);
}

function p3_drawBefore() {}

function p3_drawTile(i, j) {
  let rand = noise(i, j);
  let fillcolor;
  if (rand < 0.33) fillcolor = blue;
  else if (rand < 0.5) fillcolor = orange;
  else fillcolor = white;
  fill(fillcolor);

  push();
  beginShape();
  vertex(0, 0);
  vertex(0, tw);
  vertex(th, tw);
  vertex(th, 0);
  endShape(CLOSE);

  let n = clicks[[i, j]] | 0;
  if (n % 2 == 1) {
    //fill(255, 255, 0, 180);
    fill(0);
    circle(th/2, tw/2, tile_width/2);
  }

  pop();
  return fillcolor;
}

function p3_drawSelectedTile(i, j) {
  noFill();
  stroke(0);

  circle(tile_width/2, tile_height/2, tile_width/2);

  noStroke();
  fill(0);
  text("(" + [i, j] + ")", 0, 0);
}

function p3_drawAfter() {}
