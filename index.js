const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cellsHorizontal = 4;
const cellsVerticals = 3;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVerticals;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width,
    height,
    wireframes: false,
  },
});
Render.run(render);
Runner.run(Runner.create(), engine);

//Walls
const wall = [
  Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 2, height, { isStatic: true }),
];
World.add(world, wall);

// Maze Geneartion

const shuffle = (arr) => {
  let counter = arr.length;

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);

    counter--;

    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }

  return arr;
};

const grid = Array(cellsVerticals)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVerticals)
  .fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVerticals - 1)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVerticals);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row, column) => {
  // If i have visited the cell at [row, column] then return
  if (grid[row][column]) {
    return;
  }

  // Mark this cell as visited(T)
  grid[row][column] = true;

  // Assamble randomly-ordered list of neighbours
  const neighbors = shuffle([
    [row - 1, column, 'up'],
    [row, column + 1, 'right'],
    [row + 1, column, 'down'],
    [row, column - 1, 'left'],
  ]);
  // For each neighbor..
  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;

    // See if that neighbour is out of bounds
    if (
      nextRow < 0 ||
      nextRow >= cellsVerticals ||
      nextColumn < 0 ||
      nextColumn >= cellsHorizontal
    ) {
      continue;
    }
    // If we have visited that neighbor, continue to next neighbor
    if (grid[nextRow][nextColumn]) {
      continue;
    }

    // Remove wall from either horizontals or verticals
    if (direction === 'left') {
      verticals[row][column - 1] = true;
    } else if (direction === 'right') {
      verticals[row][column] = true;
    } else if (direction === 'up') {
      horizontals[row - 1][column] = true;
    } else if (direction === 'down') {
      horizontals[row][column] = true;
    }

    // Visit that next cell(Recursion)
    stepThroughCell(nextRow, nextColumn);
  }
};

stepThroughCell(startRow, startColumn);
//stepThroughCell(0,0);

horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }
    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX / 2,
      rowIndex * unitLengthY + unitLengthY,
      unitLengthX,
      10,
      {
        isStatic: true,
        label: 'wall',
        render: {
          fillStyle: ' rgb(31, 119, 235)'
        }
      }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }
    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY / 2,
      10,
      unitLengthY,
      {
        isStatic: true,
        label: 'wall',
        render: {
          fillStyle: ' rgb(31, 119, 235)'
        }
      }
    );
    World.add(world, wall);
  });
});

//Goal
const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * 0.7,
  unitLengthY * 0.7,
  {
    label: 'goal',
    isStatic: true,
    render: {
      fillStyle: ' rgb(54, 185, 72)'
    }
  }
);
World.add(world, goal);

//Ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius , {
  label: 'ball',
  render: {
    fillStyle: ' rgb(224, 95, 44)'
  }
});
World.add(world, ball);

document.addEventListener('keydown', (event) => {
  const { x, y } = ball.velocity;
  //up
  if (event.keyCode === 87) {
    Body.setVelocity(ball, { x, y: y - 5 });
  }
  //right
  if (event.keyCode === 68) {
    Body.setVelocity(ball, { x: x + 5, y });
  }
  //down
  if (event.keyCode === 83) {
    Body.setVelocity(ball, { x, y: y + 5 });
  }
  //left
  if (event.keyCode === 65) {
    Body.setVelocity(ball, { x: x - 5, y });
  }
});

//Win condition
Events.on(engine, 'collisionStart', (event) => {
  event.pairs.forEach((collision) => {
    if (collision.bodyA.label === 'goal' && collision.bodyB.label === 'ball') {
      world.gravity.y = 1;
      document.querySelector('.hidden').classList.remove('hidden');
      world.bodies.forEach(body => {
        if(body.label === 'wall'){
          Body.setStatic(body, false);
        }
      });
    }
  });
});

// const labels = ['ball','goal'];
// if (labels.includes(collision.bodyA.label) &&
// labels.includes(collision.bodyB.label)){
// console.log('Win');
// }
