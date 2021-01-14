var canvas = document.getElementById("map");
var context = canvas.getContext("2d");

var grid = [];
var startPos, goalPos;
var rows = 25;
var columns = 25;

var openList = [];
var closedList = [];
var path = [];

initGrid(grid);

startPos = getRandomPos(grid);
goalPos = getRandomPos(grid);

path = search(grid, startPos, goalPos);

drawGrid(grid, startPos, goalPos, path);

console.log(grid);
console.log(startPos, goalPos);
console.log(path);

function initGrid(grid) {
    for (let x = 0; x < rows; x++) {
        grid.push([]);
        for (let y = 0; y < columns; y++) {
            grid[x].push({x: x, y: y, f: 0, g: 0, h: 0, isWall: Math.random() < 0.2, parent: null});
        }
    }
}

function drawGrid(grid, start, goal, path) {
    let boxWidth = canvas.width / rows;
    let boxHeight = canvas.height / columns;
    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[0].length; y++) {
            let cell = grid[x][y];
            if (cell.isWall) {
                context.fillStyle = "#505050";
            } else if (cell.x == start.x && cell.y == start.y) {
                context.fillStyle = "#4169e1";
            } else if (cell.x == goal.x && cell.y == goal.y) {
                context.fillStyle = "#66ff00";
            } else {
                context.fillStyle = "#cccccc";
            }
            context.fillRect(grid[x][y].x * boxWidth + 1, grid[x][y].y * boxHeight + 1, boxWidth - 2, boxHeight - 2);
        }
    }

    for (let i = 0; i < path.length - 1; i++) {
        context.fillStyle = "yellow";
        context.fillRect(path[i].x * boxWidth + 1, path[i].y * boxHeight + 1, boxWidth - 2, boxHeight - 2);
    }
}

function search(grid, start, goal) {
    openList.push(start);

    while (openList.length > 0) {
        // get lowest F
        let lowestF = 0;
        for (let i = 0; i < openList.length; i++) {
            if (openList[i].f < openList[lowestF].f) lowestF = i;
        }
        let currentNode = openList[lowestF];

        // end case - return successful path
        if (areEqual(currentNode, goal)) {
            let current = currentNode;
            let ret = [];
            while (current.parent) {
                ret.push(current);
                current = current.parent;
            }
            return ret.reverse();
        }

        // normal case - move currentNode from open to closed, process each of its neighbours
        openList.splice(openList.indexOf(currentNode), 1);
        closedList.push(currentNode);
        let neighbours = findNeighbours(grid, currentNode);

        for (let i = 0; i < neighbours.length; i++) {
            let neighbour = neighbours[i];
            if (closedList.indexOf(neighbour) != -1 || neighbour.isWall) {
                continue;
            }

            // g score is the shortest distance from start to current node
            // we need to check id the path we have arrived at this neighbour is the shortest one we have seen yet
            let gScore = currentNode.g + 1;
            let gScoreIsBest = false;

            if (openList.indexOf(neighbour) == -1) {
                // This is the first time we have arrived at this node, so it must be the best
                // Also, we need to take the h (heuristic) score since we haven't done so yet
                gScoreIsBest = true;
                neighbour.h = heuristic(neighbour, goal);
                openList.push(neighbour);
            } else if (gScore < neighbour.g) {
                // We have alread seen the node, but the last time it had a worse g score (distance from start)
                gScoreIsBest = true;
            }

            if (gScoreIsBest) {
                // Found an optimal path (so far) to this node. Store info on how we got here
                neighbour.parent = currentNode;
                neighbour.g = gScore;
                neighbour.f  = neighbour.g + neighbour.h;
            }
        }
    }

    // No result was found
    return [];
}

function getRandomPos(grid) {
    let x, y;

    do {
        x = Math.floor(Math.random() * grid.length);
        y = Math.floor(Math.random() * grid[0].length);
    } while(grid[x][y].isWall);

    return grid[x][y];
}

function areEqual(pos0, pos1) {
    return ((pos0.x == pos1.x) && (pos0.y == pos1.y));
}

function findNeighbours(grid, node) {
    let ret = [];
    let x = node.x;
    let y = node.y;

    if (!(x - 1 < 0)) {
        ret.push(grid[x - 1][y]);
    }
    if (!(y - 1 < 0)) {
        ret.push(grid[x][y - 1]);
    }
    if (!(x + 1 > grid.length - 1)) {
        ret.push(grid[x + 1][y]);
    }
    if (!(y + 1 > grid[0].length - 1)) {
        ret.push(grid[x][y + 1]);
    }

    return ret;
}

function heuristic(pos0, pos1) {
    // Manhattan distance
    let d1 = Math.abs(pos1.x - pos0.x);
    let d2 = Math.abs(pos1.y - pos0.y);
    return d1 + d2;
}