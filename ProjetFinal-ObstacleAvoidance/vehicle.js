class Vehicle {
  constructor(x, y) {
    // Propriétés physiques
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 6;
    this.maxForce = 0.25;
    this.r = 25;

    // Propriétés de comportement
    this.mode = "NORMAL";
    this.leaderIndex = 0;
    this.lastShot = 0;
    this.shootingInterval = 1000;

    // Pour le mode SNAKE
    this.history = [];
    this.historySize = 100;
    this.snakeSpacing = 35;

    this.isLeader = false;
  }

  setMode(mode) {
    this.mode = mode;
  }

  setLeaderIndex(index) {
    this.leaderIndex = index;
  }

  applyBehaviors(obstacles, vehicles) {
    let force = createVector(0, 0);

    // Force d'évitement d'obstacles (toujours active)
    let avoidForce = this.avoidObstacles(obstacles);
    force.add(avoidForce.mult(1.5));

    switch (this.mode) {
      case "NORMAL":
        // Suivre la souris
        force.add(this.seek(createVector(mouseX, mouseY)));
        break;

      case "SNAKE":
        if (this.leaderIndex === 0) {
          // Le premier suit la souris
          force.add(this.seek(createVector(mouseX, mouseY)));
        } else {
          // Les autres suivent un point dans l'historique du véhicule précédent
          let leader = vehicles[this.leaderIndex - 1];
          if (leader.history.length > this.snakeSpacing) {
            let target = leader.history[leader.history.length - this.snakeSpacing];
            force.add(this.seek(target));
          }
        }
        break;

      case "LEADER":
        if (this.leaderIndex === 0) {
          // Le premier vaisseau (leader) suit la souris
          force.add(this.seek(createVector(mouseX, mouseY)));
        } else {
          // Les autres vaisseaux suivent le leader en formation V
          let leader = vehicles[0];
          let leaderVel = leader.vel.copy().normalize();
          
          // Calculer un décalage latéral (perpendiculaire à la direction du leader)
          let perpendicular = createVector(-leaderVel.y, leaderVel.x);
          // Alterner le côté gauche/droite selon l'index
          let side = (this.leaderIndex % 2 === 0) ? 1 : -1;
          
          // Position cible avec décalage latéral et arrière
          let offset = p5.Vector.add(
              leaderVel.mult(-this.snakeSpacing),  // décalage arrière
              perpendicular.mult(this.snakeSpacing * side * 0.5)  // décalage latéral
          );
          let targetPos = p5.Vector.add(leader.pos, offset);
          
          force.add(this.seek(targetPos));
        }
        break;

      case "COMBAT":
        if (enemy) {
          // S'arrêter et tirer
          this.vel.mult(0.95);
          this.shootAtEnemy();
        }
        break;
    }

    this.applyForce(force);
  }

  avoidObstacles(obstacles) {
    let ahead = p5.Vector.add(this.pos, p5.Vector.mult(this.vel.copy().normalize(), 50));
    let mostDangerous = null;
    let minDistance = Infinity;

    for (let obstacle of obstacles) {
      if (obstacle.contains(ahead)) {
        let d = p5.Vector.dist(this.pos, obstacle.pos);
        if (d < minDistance) {
          minDistance = d;
          mostDangerous = obstacle;
        }
      }
    }

    if (mostDangerous) {
      let avoidanceForce = p5.Vector.sub(this.pos, mostDangerous.pos);
      avoidanceForce.setMag(this.maxForce * 2);
      return avoidanceForce;
    }
    return createVector(0, 0);
  }

  seek(target) {
    let desired = p5.Vector.sub(target, this.pos);
    desired.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  }

  flee(target) {
    let desired = p5.Vector.sub(this.pos, target);
    let d = desired.mag();
    
    if (d < 150) { // Distance de fuite
      desired.setMag(this.maxSpeed);
      let steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxForce);
      return steer;
    }
    return createVector(0, 0);
  }

  shootAtEnemy() {
    let now = millis();
    if (now - this.lastShot > this.shootingInterval) {
      missiles.push(new Missile(this.pos.x, this.pos.y, enemy));
      this.lastShot = now;
    }
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);

    if (this.mode === "SNAKE") {
      this.history.push(this.pos.copy());
      if (this.history.length > this.historySize) {
        this.history.splice(0, 1);
      }
    } else {
      this.history = [];
    }

    this.edges();
  }

  edges() {
    if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
    } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
    }
    if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
    } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
    }
  }

  show() {
    // Afficher la ligne en mode SNAKE
    if (this.mode === "SNAKE" && this.history.length > 2) {
      beginShape();
      noFill();
      stroke(0, 255, 255, 100);
      strokeWeight(2);
      for (let pos of this.history) {
        vertex(pos.x, pos.y);
      }
      endShape();
    }

    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());

    if (vehicleImg) {
      imageMode(CENTER);
      
      switch (this.mode) {
        case "NORMAL":
          tint(0, 255, 0);
          break;
        case "SNAKE":
          tint(0, 255, 255);
          break;
        case "LEADER":
          tint(this.leaderIndex === 0 ? 255 : 200, 150, 0);
          break;
        case "COMBAT":
          tint(255, 0, 0);
          break;
      }
      
      image(vehicleImg, 0, 0, this.r * 2.5, this.r * 2);
    } else {
      stroke(255);
      strokeWeight(2);
      
      switch (this.mode) {
        case "NORMAL":
          fill(0, 255, 0);
          break;
        case "SNAKE":
          fill(0, 255, 255);
          break;
        case "LEADER":
          fill(this.leaderIndex === 0 ? 255 : 200, 150, 0);
          break;
        case "COMBAT":
          fill(255, 0, 0);
          break;
      }
      
      triangle(-this.r, -this.r/2, -this.r, this.r/2, this.r, 0);
    }
    pop();
  }

  // Méthode pour suivre le leader
  followLeader(leader) {
    let desired = p5.Vector.sub(leader.pos, this.pos);
    let d = desired.mag();
    
    // Distance minimale pour éviter la collision
    let minDistance = 30;
    
    if (d < minDistance) {
      // Trop proche du leader, s'éloigner
      return this.flee(leader.pos);
    } else {
      // Suivre le leader avec une distance de sécurité
      let targetPos = p5.Vector.sub(leader.pos, leader.vel.copy().normalize().mult(minDistance));
      return this.arrive(targetPos);
    }
  }

  arrive(target) {
    let desired = p5.Vector.sub(target, this.pos);
    let d = desired.mag();
    
    // Vitesse variable selon la distance
    let speed = this.maxSpeed;
    let slowRadius = 100;
    if (d < slowRadius) {
        speed = map(d, 0, slowRadius, 0, this.maxSpeed);
    }
    
    desired.setMag(speed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  }
} 