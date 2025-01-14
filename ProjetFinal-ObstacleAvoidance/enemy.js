class Enemy {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.r = 30;  // rayon de l'ennemi
    this.health = 100;  // points de vie
    this.maxHealth = 100;
  }

  show() {
    // Dessiner l'ennemi
    push();
    fill(255, 0, 0);
    stroke(255);
    strokeWeight(2);
    circle(this.pos.x, this.pos.y, this.r * 2);

    // Barre de vie
    let healthBarWidth = 60;
    let healthBarHeight = 8;
    let healthPercent = this.health / this.maxHealth;
    
    // Fond de la barre de vie
    fill(255, 0, 0);
    noStroke();
    rect(this.pos.x - healthBarWidth/2, this.pos.y - this.r - 20, 
         healthBarWidth, healthBarHeight);
    
    // Barre de vie actuelle
    fill(0, 255, 0);
    rect(this.pos.x - healthBarWidth/2, this.pos.y - this.r - 20, 
         healthBarWidth * healthPercent, healthBarHeight);
    pop();
  }

  update() {
    // Pour l'instant l'ennemi est statique
  }

  hit() {
    this.health -= 20;  // Chaque missile fait 20 points de dégâts
    if (this.health < 0) this.health = 0;
  }

  isDead() {
    return this.health <= 0;
  }
} 