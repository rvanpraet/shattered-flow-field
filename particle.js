class Particle {
  constructor(xPos = 0, yPos = 0, m = 4) {
    this.prevPos = createVector(xPos, yPos);
    this.pos = createVector(xPos, yPos);
    this.vel = p5.Vector.random2D();
    this.acc = createVector(0, 0);
    this.maxspeed = 4;
    this.mass = m;
    this.grey = random(0, 255);
    this.lifetime = 0;
  }

  /**
   * Update the position of particle by increasing the velocity if there is acceleration.
   * Then adding the velocity to the current position of the particle
   */
  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxspeed);
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.lifetime += 0.1;
  }

  /**
   * Increase particle acceleration
   * @param {number} force
   */
  applyForce(force) {
    this.acc.add(force);
  }

  show(strokeColor, weight = 2) {
    if (this.lifetime > 10) return;

    // Prevent particles from going outside triangles
    const isWithinTriangle = triangles.some((triangle) => {
      const { a, b, c } = triangle;
      return pointInTriangle(this.pos, a, b, c);
    });
    const shouldShow = isWithinTriangle || chance(0.001);
    if (!shouldShow) return;

    this._edges();
    const { x, y } = this.pos;

    push();
    stroke(strokeColor, this.lifetime);
    strokeWeight(weight);
    // translate(x, y)

    // point(x, y);
    // line(0, 0, 2, 0)
    line(this.prevPos.x, this.prevPos.y, this.pos.x, this.pos.y);
    pop();
  }

  follow(vectors) {
    const x = floor(this.pos.x / scl);
    const y = floor(this.pos.y / scl);
    const i = x + y * cols;
    const force = vectors[i];

    if (!force) return;

    force.setMag(0.25);
    this.applyForce(force);
  }

  followAttractor(attractors, G = 0.5, mod = 1) {
    let distance;
    let theOne;
    // Determine closest attractor
    for (const attractor of attractors) {
      const newDist = dist(
        this.pos.x,
        this.pos.y,
        attractor.pos.x,
        attractor.pos.y
      );
      if (!distance || newDist < distance) {
        distance = newDist;
        theOne = attractor;
      }
    }

    // To apply force from selected attractor
    let force = p5.Vector.sub(theOne.pos, this.pos);
    let distanceSq = constrain(force.magSq(), pow(50, 2), pow(225, 2));

    // "Universal" gravitational force
    //   let G = 0.5;

    // Calculated strength F = (m1 * m2) * G / r²
    let strength = ((G * (theOne.mass * this.mass)) / distanceSq) * mod;
    // * sin(TWO_PI);

    force.setMag(strength);
    this.applyForce(force);
  }

  _edges() {
    if (this.pos.x > width) {
      this.pos.x = 0;
      this.prevPos.x = 0;
    }
    if (this.pos.x < 0) {
      this.pos.x = width;
      this.prevPos.x = width;
    }
    if (this.pos.y > height) {
      this.pos.y = 0;
      this.prevPos.y = 0;
    }
    if (this.pos.y < 0) {
      this.pos.y = height;
      this.prevPos.y = height;
    }
  }
}
