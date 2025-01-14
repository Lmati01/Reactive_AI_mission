let vehicles = [];
let obstacles = [];
let missiles = [];
let enemy = null;
let currentMode = "NORMAL";
let backgroundImg;
let obstacleImg;
let vehicleImg;
let missileImg;

function preload() {
  backgroundImg = loadImage('images/space.jpg');
  obstacleImg = loadImage('images/asteroid.png');
  vehicleImg = loadImage('images/spaceship.png');
  missileImg = loadImage('images/missile.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Création des véhicules initiaux
  for (let i = 0; i < 5; i++) {
    vehicles.push(new Vehicle(random(width), random(height)));
  }
  
  // Création des obstacles initiaux
  for (let i = 0; i < 5; i++) {
    obstacles.push(new Obstacle(random(width), random(height)));
  }

  // Création des sliders
  creerSlider(10, 10, "Vitesse Max", 0, 10, 6, 0.1, "maxSpeed");
  creerSlider(10, 40, "Force Max", 0, 1, 0.25, 0.01, "maxForce");
  creerSliderNbVehicules(10, 70, "Nombre de véhicules", 1, 20, 5, 1);
}

function draw() {
  // Fond
  if (backgroundImg) {
    image(backgroundImg, 0, 0, width, height);
  } else {
    background(0);
  }
  
  // Affichage des informations
  fill(255);
  noStroke();
  textSize(16);
  text("Mode: " + currentMode, 10, 120);
  text("Contrôles: 'n' normal, 's' snake, 'l' leader, 'e' combat", 10, 140);
  text("Clic gauche pour ajouter des obstacles", 10, 160);
  
  // Mise à jour et affichage des obstacles
  obstacles.forEach(obstacle => obstacle.show());
  
  // Mise à jour et affichage des véhicules
  vehicles.forEach((vehicle, index) => {
    vehicle.setLeaderIndex(index);
    vehicle.applyBehaviors(obstacles, vehicles);
    vehicle.update();
    vehicle.show();
  });
  
  // Mise à jour et affichage des missiles
  for (let i = missiles.length - 1; i >= 0; i--) {
    missiles[i].update();
    missiles[i].show();
    if (enemy && missiles[i].hits(enemy)) {
      enemy.hit();
      missiles.splice(i, 1);
    }
  }
  
  // Mise à jour et affichage de l'ennemi
  if (enemy) {
    enemy.update();
    enemy.show();
    if (enemy.isDead()) {
      enemy = null;
      currentMode = "NORMAL";
      vehicles.forEach(v => {
        v.pos = createVector(random(width), random(height));
        v.setMode("NORMAL");
      });
    }
  }
}

function creerSlider(x, y, textLabel, min, max, value, step, propriete) {
  let label = createP(textLabel + " : ");
  label.style('color', 'white');
  label.position(x, y);
  
  let slider = createSlider(min, max, value, step);
  slider.position(x + 150, y + 18);
  
  let sliderValue = createP(slider.value());
  sliderValue.style('color', 'white');
  sliderValue.position(x + 300, y + 2);
  
  slider.input(() => {
    sliderValue.html(slider.value());
    vehicles.forEach(vehicle => vehicle[propriete] = slider.value());
  });
}

function creerSliderNbVehicules(x, y, textLabel, min, max, value, step) {
  let label = createP(textLabel + " : ");
  label.style('color', 'white');
  label.position(x, y);
  
  let slider = createSlider(min, max, value, step);
  slider.position(x + 150, y + 18);
  
  let sliderValue = createP(slider.value());
  sliderValue.style('color', 'white');
  sliderValue.position(x + 300, y + 2);
  
  slider.input(() => {
    sliderValue.html(slider.value());
    vehicles = [];
    for (let i = 0; i < slider.value(); i++) {
      vehicles.push(new Vehicle(random(width), random(height)));
    }
  });
}

function keyPressed() {
  switch (key) {
    case 's':
    case 'S':
      currentMode = "SNAKE";
      vehicles.forEach(v => v.setMode("SNAKE"));
      break;
      
    case 'n':
    case 'N':
      currentMode = "NORMAL";
      vehicles.forEach(v => v.setMode("NORMAL"));
      break;
      
    case 'l':
    case 'L':
      currentMode = "LEADER";
      vehicles.forEach(v => v.setMode("LEADER"));
      break;
      
    case 'e':
    case 'E':
      if (!enemy) {
        currentMode = "COMBAT";
        enemy = new Enemy(random(width), random(height));
        missiles.forEach(m => m.target = enemy);
        vehicles.forEach(v => v.setMode("COMBAT"));
      }
      break;
  }
}

function mousePressed() {
  if (mouseY > 150) {
    obstacles.push(new Obstacle(mouseX, mouseY));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function setLeaderMode() {
  // Le premier véhicule devient le leader
  vehicles[0].isLeader = true;
  
  // Les autres véhicules suivent le leader
  for(let i = 1; i < vehicles.length; i++) {
    vehicles[i].isLeader = false;
  }
}

if (leaderMode) {
  // Le leader suit la souris
  vehicles[0].seek(createVector(mouseX, mouseY));
  
  // Les autres véhicules suivent le leader
  for(let i = 1; i < vehicles.length; i++) {
    // Calculer la position cible derrière le leader
    let leaderPos = vehicles[0].pos;
    let leaderVel = vehicles[0].vel;
    
    // Si le leader fait demi-tour (dot product négatif)
    if (p5.Vector.dot(leaderVel, vehicles[i].vel) < 0) {
      vehicles[i].flee(leaderPos);
    } else {
      // Position décalée derrière le leader
      let offset = leaderVel.copy().normalize().mult(-30 * i);
      let targetPos = p5.Vector.add(leaderPos, offset);
      vehicles[i].arrive(targetPos);
    }
  }
} 