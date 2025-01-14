class Missile {
  constructor(x, y, target) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.target = target;
    this.r = 8;
    this.maxSpeed = 10;
    this.maxForce = 0.5;

    // Paramètres pour l'évitement d'obstacles
    this.whiskerLength = 40;
    this.whiskerAngle = PI / 4;
  }

  update() {
    // Comportement seek vers la cible avec évitement d'obstacles
    let seekForce = this.seek(this.target.pos);
    let avoidForce = this.avoidObstacles(obstacles);
    
    // Priorité à l'évitement d'obstacles
    avoidForce.mult(1.5);
    this.applyForce(avoidForce);
    this.applyForce(seekForce);

    // Mise à jour physique
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  avoidObstacles(obstacles) {
    let ahead = p5.Vector.add(this.pos, p5.Vector.mult(this.vel.copy().normalize(), this.whiskerLength));
    let aheadLeft = p5.Vector.add(this.pos, p5.Vector.mult(this.vel.copy().rotate(-this.whiskerAngle).normalize(), this.whiskerLength));
    let aheadRight = p5.Vector.add(this.pos, p5.Vector.mult(this.vel.copy().rotate(this.whiskerAngle).normalize(), this.whiskerLength));

    let mostDangerousObstacle = null;
    let minDistance = Infinity;

    for (let obstacle of obstacles) {
      if (obstacle.contains(ahead) || 
          obstacle.contains(aheadLeft) || 
          obstacle.contains(aheadRight)) {
        let d = p5.Vector.dist(this.pos, obstacle.pos);
        if (d < minDistance) {
          minDistance = d;
          mostDangerousObstacle = obstacle;
        }
      }
    }

    if (mostDangerousObstacle) {
      let avoidanceForce = p5.Vector.sub(this.pos, mostDangerousObstacle.pos);
      avoidanceForce.setMag(this.maxForce * 2);
      return avoidanceForce;
    }

    return createVector(0, 0);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  seek(target) {
    let desired = p5.Vector.sub(target, this.pos);
    desired.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    
    if (missileImg) {
      // Utiliser l'image du missile
      imageMode(CENTER);
      image(missileImg, 0, 0, this.r * 4, this.r * 2);
      
      // Effet de propulsion (particules)
      for (let i = 0; i < 3; i++) {
        fill(255, random(100, 200), 0, random(100, 200));
        noStroke();
        let size = random(5, 10);
        ellipse(-this.r * 2, random(-3, 3), size, size);
      }
    } else {
      // Fallback à la forme géométrique si l'image n'est pas chargée
      // Corps du missile
      fill(255, 200, 0);
      noStroke();
      rect(-this.r, -this.r/4, this.r*2, this.r/2);
      
      // Pointe du missile
      triangle(this.r*2, 0, this.r, -this.r/2, this.r, this.r/2);
      
      // Effet de propulsion
      fill(255, 100, 0);
      triangle(-this.r, 0, -this.r*2, -this.r/2, -this.r*2, this.r/2);
    }
    pop();
  }

  hits(enemy) {
    let d = p5.Vector.dist(this.pos, enemy.pos);
    return d < this.r + enemy.r;
  }
} 