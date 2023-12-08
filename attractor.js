// Vector which attracts particles based on gravitational pull
class Attractor {
  constructor(x, y, m = 4) {
    this.pos = createVector(x, y);
    this.mass = m;
    this.r = sqrt(this.mass) * 2;

    // push()
    // fill(255)
    // ellipse(this.pos.x, this.pos.y, 20)
    // pop()
  }

  update(x, y) {
    this.pos.x = x;
    this.pos.y = y;
  }

  attract(mover) {
    let G = 3;
    let distance = dist(this.pos.x, this.pos.y, mover.pos.x, mover.pos.y);
    if (mouseIsPressed & (distance < 450)) {
      G = 200;
    }
    _calculateAtrraction(this, mover, G, 1);
  }

  _calculateAtrraction(mover, G = 0.5, mod = 1) {
    // To apply force
    let force = p5.Vector.sub(this.pos, mover.pos);
    let distanceSq = constrain(force.magSq(), pow(50, 2), pow(225, 2));

    // "Universal" gravitational force
    //   let G = 0.5;

    // Calculated strength F = (m1 * m2) * G / r²
    let strength = ((G * (this.mass * mover.mass)) / distanceSq) * mod;
    // * sin(TWO_PI);

    force.setMag(strength);

    mover.applyForce(force);
  }
}
