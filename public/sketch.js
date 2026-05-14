// --- GAME VARIABLES ---
let gameState = "playing"; // "playing" or "won"
let score = 0;
let streak = 0;
const WIN_SCORE = 30; // Points needed to win!

let fox;
let gems = [];
let particles = [];
let fireflies = [];

// Color categories for the puzzle
const colorOptions = [
  { name: "RED", rgb: [255, 60, 80] },
  { name: "BLUE", rgb: [60, 180, 255] },
  { name: "GREEN", rgb: [80, 255, 100] },
  { name: "YELLOW", rgb: [255, 220, 50] }
];
let targetColor;

// --- MULTI-COLOR PIXEL ART (Fox) ---
const foxColors = {
  'O': [255, 120, 40],
  'W': [255, 240, 230],
  'B': [30, 30, 30]
};

const foxSprite = [
  "  O       O  ",
  " OOO     OOO ",
  "OOOOOOOOOOOOO",
  "OOOOOOOOOOOOO",
  "OOWBOOOOOBWOO",
  "OOWWOOOOOWWOO",
  " OOWWBBBWWOO ",
  "  OOWWWWWOO  ",
  "   OOOOOOO   "
];

// Single color pixel mask for Gems
const gemSprite = [
  "   ███   ",
  "  █████  ",
  " ███████ ",
  "█████████",
  " ███████ ",
  "  █████  ",
  "   ███   "
];

const pixelScale = 5;

// --- SETUP ---
function setup() {
  // FIX: Full screen size for mobile and computer
  createCanvas(windowWidth, windowHeight);
  
  // FIX: Make game fast on mobile screens
  pixelDensity(1); 
  frameRate(60); 
  
  noCursor();
  
  fox = new Fox();
  pickNewTarget();
  
  // Generate background fireflies
  for (let i = 0; i < 30; i++) {
    fireflies.push(new Firefly());
  }
}

// --- MAIN LOOP ---
function draw() {
  drawForestBackground();
  
  // Update and draw Fireflies
  for (let f of fireflies) {
    f.update();
    f.show();
  }

  if (gameState === "playing") {
    playGameLogic();
  } else if (gameState === "won") {
    winScreenLogic();
  }

  // FIX: Limit particles to prevent phone from hanging
  if (particles.length > 50) {
    particles.splice(0, particles.length - 50);
  }

  // Update and draw Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].isFinished()) {
      particles.splice(i, 1);
    }
  }

  // Update and draw Fox
  fox.update();
  fox.show();
}

// --- GAME STATES ---
function playGameLogic() {
  // Spawn Gems randomly
  if (frameCount % 50 === 0) {
    gems.push(new Gem(random(50, width - 50), -40));
  }

  // Update and draw Gems
  for (let i = gems.length - 1; i >= 0; i--) {
    let g = gems[i];
    g.update();
    g.show();
    
    // Check if fox catches the gem
    if (fox.hits(g)) {
      if (g.colorData.name === targetColor.name) {
        // Correct gem!
        createParticles(g.x, g.y, g.colorData.rgb, true);
        score++;
        streak++;
        
        // Check for WIN
        if (score >= WIN_SCORE) {
          gameState = "won";
          gems = []; // Clear remaining gems
          return;
        }
        
        // Change target every 5 correct catches
        if (streak >= 5) {
          pickNewTarget();
          streak = 0;
        }
      } else {
        // Wrong gem! Just a gentle puff of smoke
        createParticles(g.x, g.y, [150, 150, 150], false);
        streak = 0; 
      }
      gems.splice(i, 1);
    } else if (g.y > height + 50) {
      gems.splice(i, 1);
    }
  }
  
  drawHUD();
}

function winScreenLogic() {
  // Draw big celebration text
  textAlign(CENTER, CENTER);
  textSize(min(60, width / 8)); // Responsive text size
  textFont('Arial');
  
  // Glowing text shadow
  fill(255, 255, 255, 50);
  text("YOU WIN!", width / 2 + 3, height / 2 - 27);
  
  // Colorful bouncing text
  let r = map(sin(frameCount * 0.05), -1, 1, 100, 255);
  let g = map(sin(frameCount * 0.06), -1, 1, 100, 255);
  let b = map(sin(frameCount * 0.07), -1, 1, 100, 255);
  fill(r, g, b);
  text("YOU WIN!", width / 2, height / 2 - 30);
  
  textSize(min(30, width / 12)); // Responsive text size
  fill(255);
  text("AMAZING JOB!", width / 2, height / 2 + 20);
  
  // Continuously spawn fireworks
  if (frameCount % 20 === 0) {
    let randomColor = random(colorOptions).rgb;
    createFireworks(random(100, width - 100), random(50, height - 150), randomColor);
  }
}

// --- GAME LOGIC FUNCTIONS ---
function pickNewTarget() {
  let newColor;
  do {
    newColor = random(colorOptions);
  } while (targetColor && newColor.name === targetColor.name);
  
  targetColor = newColor;
}

// --- CLASSES ---
class Fox {
  constructor() {
    this.x = width / 2;
    this.y = height - 60; 
    this.w = foxSprite[0].length * pixelScale;
    this.h = foxSprite.length * pixelScale;
  }

  update() {
    this.x = lerp(this.x, mouseX, 0.15);
    this.x = constrain(this.x, this.w / 2, width - this.w / 2);
  }

  show() {
    let drawX = this.x - this.w / 2;
    let drawY = this.y - this.h / 2;
    
    noStroke();
    for (let i = 0; i < foxSprite.length; i++) {
      let row = foxSprite[i];
      for (let j = 0; j < row.length; j++) {
        let char = row.charAt(j);
        if (char !== ' ') {
          fill(foxColors[char]);
          rect(drawX + j * pixelScale, drawY + i * pixelScale, pixelScale, pixelScale);
        }
      }
    }
  }

  hits(gem) {
    let d = dist(this.x, this.y, gem.x, gem.y);
    return d < (this.w / 2 + gem.size / 2);
  }
}

class Gem {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = gemSprite[0].length * pixelScale;
    this.speed = random(3, 5); // FIX: Slightly faster gems
    this.colorData = random(colorOptions);
  }

  update() {
    this.y += this.speed;
    this.x += sin(frameCount * 0.05 + this.y) * 0.5;
  }

  show() {
    let c = this.colorData.rgb;
    noStroke();
    
    fill(c[0], c[1], c[2], 80);
    circle(this.x, this.y, this.size * 1.5);
    
    fill(c[0], c[1], c[2]);
    let drawX = this.x - this.size / 2;
    let drawY = this.y - this.size / 2;
    
    for (let i = 0; i < gemSprite.length; i++) {
      let row = gemSprite[i];
      for (let j = 0; j < row.length; j++) {
        if (row.charAt(j) === '█') {
          rect(drawX + j * pixelScale, drawY + i * pixelScale, pixelScale, pixelScale);
        }
      }
    }
    
    fill(255, 255, 255, 150);
    rect(drawX + 2 * pixelScale, drawY + 2 * pixelScale, pixelScale * 2, pixelScale);
  }
}

class Particle {
  constructor(x, y, colorRGB, isGood) {
    this.x = x;
    this.y = y;
    let angle = random(TWO_PI);
    let speed = random(1, 5);
    this.vx = cos(angle) * speed;
    this.vy = sin(angle) * speed;
    
    this.life = 255;
    this.c = colorRGB;
    this.isGood = isGood;
    this.size = isGood ? random(6, 12) : random(3, 6);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.isGood ? 8 : 15; 
    this.size *= 0.95;
  }

  show() {
    noStroke();
    fill(this.c[0], this.c[1], this.c[2], this.life);
    if (this.isGood) {
      circle(this.x, this.y, this.size);
    } else {
      rect(this.x, this.y, this.size, this.size);
    }
  }

  isFinished() {
    return this.life <= 0;
  }
}

class Firefly {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.offset = random(1000);
  }

  update() {
    this.x += map(noise(this.offset, frameCount * 0.01), 0, 1, -2, 2);
    this.y += map(noise(this.offset + 100, frameCount * 0.01), 0, 1, -2, 2);
    
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }

  show() {
    let brightness = map(sin(frameCount * 0.05 + this.offset), -1, 1, 50, 255);
    noStroke();
    fill(200, 255, 100, brightness);
    circle(this.x, this.y, 4);
  }
}

// --- HELPER FUNCTIONS ---
function createParticles(x, y, colorRGB, isGood) {
  let amount = isGood ? 20 : 8;
  for (let i = 0; i < amount; i++) {
    particles.push(new Particle(x, y, colorRGB, isGood));
  }
}

function createFireworks(x, y, colorRGB) {
  for (let i = 0; i < 40; i++) {
    particles.push(new Particle(x, y, colorRGB, true));
  }
}

function drawForestBackground() {
  for (let y = 0; y <= height; y += 4) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(10, 20, 40), color(20, 60, 50), inter);
    noStroke();
    fill(c);
    rect(0, y, width, 4);
  }

  // Responsive Trees
  fill(10, 30, 25);
  rect(width * 0.1, height - 150, 40, 150);
  triangle(width * 0.1 - 40, height - 100, width * 0.1 + 20, height - 250, width * 0.1 + 80, height - 100);
  triangle(width * 0.1 - 30, height - 50, width * 0.1 + 20, height - 180, width * 0.1 + 70, height - 50);

  let rx = width * 0.85; // Right tree dynamic position
  rect(rx, height - 120, 30, 120);
  triangle(rx - 30, height - 80, rx + 15, height - 200, rx + 60, height - 80);
}

function drawHUD() {
  fill(255);
  noStroke();
  
  // FIX: Responsive Text Sizes
  let mobileSize = width < 500 ? 16 : 24;
  textSize(mobileSize);
  textFont('Arial'); 
  textAlign(LEFT, TOP);
  text(`⭐ Score: ${score} / ${WIN_SCORE}`, 20, 20);

  textAlign(CENTER, TOP);
  textSize(mobileSize + 8);
  
  fill(0, 0, 0, 150);
  text(`Catch the ${targetColor.name} gems!`, width / 2 + 2, 22);
  
  let c = targetColor.rgb;
  fill(c[0], c[1], c[2]);
  text(`Catch the ${targetColor.name} gems!`, width / 2, 20);
}

// --- NEW FIXES FOR MOBILE ---

// Controls: Play again on Spacebar
function keyPressed() {
  if (gameState === "won" && key === ' ') {
    gameState = "playing";
    score = 0;
    streak = 0;
    gems = [];
    particles = [];
    pickNewTarget();
  }
}

// FIX: Prevents mobile screen from scrolling when swiping
function touchMoved() {
  return false; 
}

// FIX: Automatically resizes game if window changes or phone rotates
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  fox.y = height - 60; // Keep fox at the bottom
}