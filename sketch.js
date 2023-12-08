const scl = 20;
let rows, cols;
let zoff = 0;
let particles = [];
let attractors = [];
let flowfield;
let triangles = [];
let trianglesFlowfield;
let padding;
let pointFillChance = 4;
let weight = 4;

function setup() {
  createCanvas(3000, 4000);
  background(255);

  rows = floor(height / scl);
  cols = floor(width / scl);
  padding = floor(height * 0.04);
  flowfield = new Array(rows * cols);

  //   initFlowField();
  initAttractors();

  for (let i = 0; i < 100; i++) {
    initParticles("triangle");
  }

  initFlowFieldAfterTriangles();
}

function draw() {
  particles.forEach((particle, i) => {
    particle.follow(flowfield);
    particle.followAttractor(attractors, 60);
    particle.update();
    particle.show(0, weight);
  });
}

function initFlowField() {
  let yoff = 0;

  // Init flowfield
  for (let y = 0; y <= rows; y++) {
    let xoff = 0;
    for (let x = 0; x <= cols; x++) {
      const ffIndex = x + y * cols;
      let nse = noise(xoff, yoff, zoff);
      //   const angle = TWO_PI * (sin(x * nse) + cos(y * nse));
      const angle = -TWO_PI * nse;
      let v = p5.Vector.fromAngle(angle);
      flowfield[ffIndex] = v;

      // Draw flowfield for reference
      // push()
      // stroke(200)
      // strokeWeight(2)
      // translate(x * scl, y * scl)
      // rotate(v.heading())
      // line(v.x, v.y, scl, 0);
      // pop()

      xoff += 0.02;
    }
    yoff += 0.035;
    zoff += 0.0;
  }
}

function initAttractors() {
  for (let i = 0; i < 1; i++) {
    attractors.push(new Attractor(random(width), random(height)));
  }
}

function initParticles(type = "random", config = {}) {
  switch (type) {
    case "random":
      for (let i = 0; i < 1000; i++) {
        particles.push(new Particle(random(width), random(height)));
      }
      break;
    case "grid":
      const { gridSize = { x: 10, y: 40 } } = config;
      for (let y = 0; y < height; y += gridSize.y) {
        for (let x = 0; x < width; x += gridSize.x) {
          particles.push(new Particle(x, y));
        }
      }
      break;

    case "triangle":
      // Create triangle points within certain bounds
      //   const a = createVector(
      //     random(padding, width * 0.25),
      //     random(padding, height * 0.25)
      //   );
      //   const b = createVector(
      //     random(width * 0.75, width - padding),
      //     random(height * 0.25, height * 0.75)
      //   );
      //   const c = createVector(
      //     random(width * 0.25, width * 0.75),
      //     random(height * 0.75, height - padding)
      //   );

      const createIsolatedTriangle = () => {
        // Create triangle points randomly
        let isolatedTriangle;

        while (!isolatedTriangle) {
          let a, b, c;

          const attemptToAssignPoint = (point) => {
            const potentialPoint = createVector(
              random(padding, width - padding),
              random(padding, height - padding)
            );

            // If there are no triangles, then set a to potentialA
            if (!triangles.length) {
              point = potentialPoint;
            }

            // If there are triangles, then check if potentialA is within any of the triangles
            else {
              const isWithinTriangle = triangles.some((triangle) => {
                const { a, b, c } = triangle;
                return pointInTriangle(potentialPoint, a, b, c);
              });

              // If potentialA is not within any of the triangles, then set a to potentialA
              if (!isWithinTriangle) {
                point = potentialPoint;
              }
            }

            return point;
          };

          while (!a || !b || !c) {
            if (!a) {
              a = attemptToAssignPoint(a);
            }

            if (!b) {
              b = attemptToAssignPoint(b);
            }

            if (!c) {
              c = attemptToAssignPoint(c);
            }

            if (a && b && c) {
              const area = calculateTriangleArea(a, b, c);
              if (area > width * height * 0.05) {
                a = b = c = undefined;
              }
            }
          }

          return { a, b, c };
        }
      };

      // Add first triangle to triangles array
      let potentialTriangle;
      let foundIsolatedTriangle = false;

      while (!foundIsolatedTriangle) {
        potentialTriangle = createIsolatedTriangle();

        if (!triangles.length) {
          foundIsolatedTriangle = true;
        }

        // Check if potentialTriangle intersects with any of the existing triangles
        else {
          foundIsolatedTriangle = triangles.every(
            (triangle) => !trianglesIntersect(potentialTriangle, triangle)
          );
        }
      }

      triangles.push(potentialTriangle);
      const { a, b, c } = potentialTriangle;

      const points = getPointsInsideTriangle(a, b, c);
      points.forEach((point, i) => {
        // if (i % floor(random(6, 10)) === 0) {
        //   particles.push(new Particle(point.x, point.y));
        // }
        if (i % pointFillChance === 0) {
          particles.push(new Particle(point.x, point.y));
        }
      });
  }
}

function initFlowFieldAfterTriangles() {
  for (let y = 0; y <= rows; y++) {
    for (let x = 0; x <= cols; x++) {
      const ffIndex = x + y * cols;
      const vectorPoint = createVector(x * scl, y * scl);
      const isWithinTriangle = triangles.some((triangle) =>
        pointInTriangle(vectorPoint, triangle.a, triangle.b, triangle.c)
      );

      if (isWithinTriangle) {
        let nse = noise(x * 0.05, y * 0.05);

        let angle = TWO_PI * nse;

        if (chance(0.01)) {
          angle = TWO_PI * (sin(x * nse) + cos(y * nse));
        }

        let v = p5.Vector.fromAngle(angle);
        flowfield[ffIndex] = v;

        // Draw flowfield for reference
        // push();
        // stroke(0);
        // strokeWeight(2);
        // translate(x * scl, y * scl);
        // rotate(v.heading());
        // line(v.x, v.y, scl, 0);
        // pop();
      }
    }
  }
}

function keyPressed() {
  if (key === "s") {
    save("triangle_flowfield.tiff");
  }
}
