let minX = 0;
let maxX = 0;

/**
 * Draws a circle based on a certain divisions and will draw lines between the division points
 */
function drawCircle(x, y, r, config) {
  const {
    divisions = 100,
    angle = 0,
    color = "#fff",
    filled = true,
    stroked = false,
    strokeWeight = 1,
    alphaRnd = [0, 1],
    weightRnd = 5,
    probability = 0.5,
  } = config;

  let theta = TWO_PI / divisions;
  const points = [];

  // push()
  // translate(x, y)
  // rotate(PI/2 * noise(x * 0.005))
  // rotate(angle)

  for (let i = 0; i < divisions; i++) {
    const xCir = cos(theta * i) * r;
    const yCir = sin(theta * i) * r;

    if (!minX || xCir < minX) minX = xCir;
    if (!maxX || xCir > maxX) maxX = xCir;

    points.push({ x: xCir, y: yCir });
  }

  // Every point on the circle should draw a line inwards over a `strokeWeight` length
  if (stroked) {
    const c = createVector(x, y);

    for (let i = 1; i < points.length; i++) {
      const p1 = points[i];

      // Create vectors at the point and center of the circle
      const v = createVector(p1.x, p1.y);
      const a = atan2(v.y - c.y, v.x - c.x) + PI;

      // Calculate the new position based on the angle and distance
      let dx = cos(a) * strokeWeight;
      let dy = sin(a) * strokeWeight;

      // Update the position
      v.add(createVector(dx, dy));

      const p2 = { x: v.x, y: v.y };

      // Get creative with the configuration of drawLine function
      drawLine({
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
        color,
        alphaRnd,
        weightRnd,
        probability,
      });
    }
  }

  if (filled) {
    for (let i = 1; i <= points.length / 2; i++) {
      const p1 = points[i];
      const p2 = points[points.length - i - 1];

      // Get creative with the configuration of drawLine function
      drawLine({
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
        color,
        alphaRnd,
        weightRnd,
        probability,
      });
    }
  }
  // pop()
}

/**
 * Draw line per point, so you can distort individual points
 *
 */
function drawLine(props) {
  let { x1, x2, y1, y2, color, alphaRnd, weightRnd, probability } = props;

  x1 = floor(x1);
  y1 = floor(y1);
  x2 = floor(x2);
  y2 = floor(y2);

  const drawFn = (x, y) => {
    // // Uncomment if you want to weigh the probability of drawing a point at x, y
    // const maxD = dist(-width * 0.5, -height * 0.5, 0, 0)
    // const weightedProb = prob * d / maxD // Linear weighted probability
    // const weightedProb = prob * Math.exp(-a * d / maxD) // Exponential weighted probability
    // const weightedProb = prob * Math.log(1.2 + d) / Math.log(1.1 + maxD); // Logarithmic weighted probability
    // probability = weightedProb

    if (chance(probability)) {
      const clr = colorAlpha(color, random(alphaRnd));

      push();

      translate(x, y);

      noStroke();
      fill(clr);
      circle(0, 0, random(1, weightRnd));
      pop();
    }
  };

  // Line is not vertical
  if (floor(x1) !== floor(x2)) {
    let y = y1; // Y-Coord starting point
    let yInc = (y2 - y1) / abs(x2 - x1);

    // Left to right
    if (x2 > x1) {
      for (let x = x1; x <= x2; x++) {
        drawFn(x, y);
        y += yInc;
      }
    }
    // Right to left
    else {
      for (let x = x1; x >= x2; x--) {
        drawFn(x, y);
        y += yInc;
      }
    }
  }

  // Line is vertical
  else {
    const x = x1; // x will stay the same

    // Top to bottom
    if (y2 > y1) {
      for (let y = y1; y <= y2; y++) {
        drawFn(x, y);
      }
    }
    // Bottom to top
    else {
      for (let y = y1; y >= y2; y--) {
        drawFn(x, y);
      }
    }
  }
}

/**
 * To draw a stroked line, calculate the start and end points of the parallel lines
 */
function drawLineStroked({ weight, ...props }) {
  const { x1, x2, y1, y2, probability } = props;

  // Calculate the slope of the original line
  const slope = (y2 - y1) / (x2 - x1);

  // Calculate the perpendicular slope -- This does not seem to work for horizontal lines
  const perpendicularSlope = slope === Infinity || slope === 0 ? 0 : -1 / slope;

  let probFactor = 0;
  const end = floor(weight * 0.5);
  const start = -end;
  // Loop over every parallel line from -weight/2 to weight/2
  for (let d = start; d <= end; d++) {
    let unitX;
    let unitY;

    // Horizontal line
    if (floor(y2 - y1) === 0) {
      unitX = 0;
      unitY = d;
    }

    // All the rest
    else {
      // Calculate unit vector components
      unitX = d / Math.sqrt(1 + perpendicularSlope ** 2);
      unitY = perpendicularSlope * unitX;
    }

    // Calculate the starting point (x3, y3)
    const x3 = x1 + unitX;
    const y3 = y1 + unitY;

    // Calculate the ending point (x4, y4)
    const x4 = x2 + unitX;
    const y4 = y2 + unitY;

    // Calculate the probability factor based on the distance from the center
    // the factor should be 1 in the center and 0 at the edges
    // const angle = map(d, start, end, 0, TWO_PI)
    // probFactor = map(abs(sin(angle)), 0, 1, 0.2, 1)

    drawLine({ ...props, x1: x3, y1: y3, x2: x4, y2: y4 });
  }
}

/**
 * Simple helper function to providing a probability which returns true or false using random
 * @param {*} probability - Value between 0 and 1
 * @returns
 */
function chance(probability = 1) {
  return random() <= probability;
}

/**
 * Turns a P5 color value (hex, decimal) into an RGBA color value
 * @param {t} P5.Color - P5 color value
 * @param {*} alpha - Alpha value between 0 and 1
 * @returns RGBA color string
 */
function colorAlpha(aColor, alpha) {
  var c = color(aColor);
  return color("rgba(" + [red(c), green(c), blue(c), alpha].join(",") + ")");
}

/**
 * Samples a given array using random index
 * @param {*} array - The array to sample
 * @returns
 */
function sampleArray(array = []) {
  const randIdx = ceil(random(0.0001, array.length)) - 1;
  return array[randIdx];
}

/**
 * Samples an array using 2D perlin noise, expects
 * @param {*} x
 * @param {*} y
 * @param {*} length
 * @returns
 */
function sampleArrayNoise(x = null, y = null, array = []) {
  if (x === null && y === null)
    console.error("Provide at least one dimension for sampling with noise");

  let noiseVal;

  if (x !== null && y !== null) {
    noiseVal = noise(x, y);
  } else if (x !== null) {
    noiseVal = noise(x);
  } else if (y !== null) {
    noiseVal = noise(y);
  }

  const noiseIdx = ceil(noiseVal * array.length) - 1;
  return array[noiseIdx];
}

/**
 * Samples a random point on a given line
 * @param {*} x1
 * @param {*} y1
 * @param {*} x2
 * @param {*} y2
 * @returns p5.Vector with the random point
 */
function getRandomPointOnLine(x1, y1, x2, y2) {
  // Generate a random value between 0 and 1

  let t = random();

  // Use the random value to interpolate between the two points
  let x = lerp(x1, x2, t);
  let y = lerp(y1, y2, t);

  // Return the random point
  return createVector(x, y);
}

/**
 * Function to find the midpoint of a line between two given points
 * @param {p5.Vector} point1
 * @param {p5.Vector} point2
 * @returns
 */
function findMidpoint(point1, point2) {
  // Calculate midpoint using the formula
  let xMid = (point1.x + point2.x) / 2;
  let yMid = (point1.y + point2.y) / 2;

  // Create a vector to represent the midpoint
  let midpoint = createVector(xMid, yMid);

  return midpoint;
}

/**
 * Function to find midpoint of a line with an offset
 * @param {p5.Vector} point1
 * @param {p5.Vector} point2
 * @param {number} offset
 * @returns
 */
function findMidpointWithOffset(point1, point2, offset) {
  // Calculate the distance between the two points
  let distance = dist(point1.x, point1.y, point2.x, point2.y);

  // Ensure maxOffset is within the bounds of the line segment
  offset = constrain(offset, -distance / 2, distance / 2);

  // Calculate the direction vector of the line
  let direction = createVector(point2.x - point1.x, point2.y - point1.y);

  // Normalize the direction vector
  direction.normalize();

  // Scale the direction vector by offset
  // direction.mult(offset * noise(point1.x * 0.005, point1.y * 0.005));
  direction.mult(offset);

  // Calculate the midpoint by adding the offset to the midpoint of the line
  let midpoint = createVector(
    (point1.x + point2.x) / 2 + direction.x,
    (point1.y + point2.y) / 2 + direction.y
  );

  return midpoint;
}

/**
 * Function to offset a given point on a line towards either the starting point or ending point
 * @param {p5.Vector} pointP
 * @param {p5.Vector} point1
 * @param {p5.Vector} point2
 * @param {number} offset
 * @returns
 */
function offsetPointOnLine(pointP, point1, point2, offset) {
  // Calculate the distance between the two points
  let distance = dist(point1.x, point1.y, point2.x, point2.y);

  // Ensure maxOffset is within the bounds of the line segment
  offset = constrain(offset, -distance / 2, distance / 2);

  // Calculate the direction vector of the line
  let direction = createVector(point2.x - point1.x, point2.y - point1.y);

  // Normalize the direction vector
  direction.normalize();

  // Scale the direction vector by offset
  // direction.mult(offset * noise(point1.x * 0.005, point1.y * 0.005));
  direction.mult(offset);

  // Calculate the midpoint by adding the offset to the midpoint of the line
  let offsetPoint = createVector(
    pointP.x + direction.x,
    pointP.y + direction.y
  );

  return offsetPoint;
}

/**
 * Calculates the surface area of a triangle
 * @param {p5.Vector} v1 The first point of the triangle
 * @param {p5.Vector} v2 The second point of the triangle
 * @param {p5.Vector} v3 The third point of the triangle
 * @returns {number} The numeric value of surface area of the triangle
 */
function calculateTriangleArea(v1, v2, v3) {
  // Shoelace Formula
  return abs(
    (v1.x * (v2.y - v3.y) + v2.x * (v3.y - v1.y) + v3.x * (v1.y - v2.y)) / 2
  );
}

// Function to get all points inside a triangle
function getPointsInsideTriangle(p1, p2, p3) {
  let points = [];

  // Find the bounding box of the triangle
  let minX = min(p1.x, p2.x, p3.x);
  let minY = min(p1.y, p2.y, p3.y);
  let maxX = max(p1.x, p2.x, p3.x);
  let maxY = max(p1.y, p2.y, p3.y);

  // Iterate through points only inside the bounding box
  for (let x = minX; x <= maxX; x += 5) {
    for (let y = minY; y <= maxY; y += 5) {
      let point = createVector(x, y);

      // Check if the point is inside the triangle
      if (pointInTriangle(point, p1, p2, p3)) {
        points.push(point.copy());
      }
    }
  }

  return points;
}

// Function to check if a point is inside a triangle
function pointInTriangle(point, p1, p2, p3) {
  let barycentric = getBarycentricCoordinates(point, p1, p2, p3);
  return barycentric.x >= 0 && barycentric.y >= 0 && barycentric.z >= 0;
}

// Function to get the barycentric coordinates of a point in a triangle
function getBarycentricCoordinates(point, p1, p2, p3) {
  let v0 = p5.Vector.sub(p3, p1);
  let v1 = p5.Vector.sub(p2, p1);
  let v2 = p5.Vector.sub(point, p1);

  let dot00 = v0.dot(v0);
  let dot01 = v0.dot(v1);
  let dot02 = v0.dot(v2);
  let dot11 = v1.dot(v1);
  let dot12 = v1.dot(v2);

  let invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
  let u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  let v = (dot00 * dot12 - dot01 * dot02) * invDenom;
  let w = 1 - u - v;

  return createVector(u, v, w);
}

function trianglesIntersect(t1, t2) {
  // Check for intersection between all edges of both triangles
  return (
    lineSegmentsIntersect(t1.a, t1.b, t2.a, t2.b) ||
    lineSegmentsIntersect(t1.a, t1.b, t2.b, t2.c) ||
    lineSegmentsIntersect(t1.a, t1.b, t2.c, t2.a) ||
    lineSegmentsIntersect(t1.b, t1.c, t2.a, t2.b) ||
    lineSegmentsIntersect(t1.b, t1.c, t2.b, t2.c) ||
    lineSegmentsIntersect(t1.b, t1.c, t2.c, t2.a) ||
    lineSegmentsIntersect(t1.c, t1.a, t2.a, t2.b) ||
    lineSegmentsIntersect(t1.c, t1.a, t2.b, t2.c) ||
    lineSegmentsIntersect(t1.c, t1.a, t2.c, t2.a)
  );
}

function lineSegmentsIntersect(p1, p2, p3, p4) {
  // Function to check if two line segments intersect
  let ua =
    ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) /
    ((p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y));
  let ub =
    ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) /
    ((p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y));

  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}
