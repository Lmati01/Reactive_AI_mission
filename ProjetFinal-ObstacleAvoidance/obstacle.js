class Obstacle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.r = 50;  // rayon de l'obstacle
    this.angle = random(TWO_PI); // angle de rotation aléatoire
    this.rotationSpeed = random(-0.02, 0.02); // vitesse de rotation aléatoire
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    this.angle += this.rotationSpeed; // fait tourner l'obstacle
    rotate(this.angle);
    
    if (obstacleImg) {
      // Utiliser l'image si elle est chargée
      imageMode(CENTER);
      image(obstacleImg, 0, 0, this.r * 2, this.r * 2);
    } else {
      // Fallback au cercle si l'image n'est pas chargée
      fill(127);
      stroke(255);
      strokeWeight(2);
      circle(0, 0, this.r * 2);
    }
    pop();
  }

  // Méthode pour vérifier si un point est à l'intérieur de l'obstacle
  contains(point) {
    return p5.Vector.dist(this.pos, point) < this.r;
  }
} 