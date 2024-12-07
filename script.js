import { Gameboard, Player, Ship } from './model.js';

let gameFinish = false;

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function generateDeskWithRandomShips(shipsArr) {
  const board = Gameboard();
  shipsArr.sort((a, b) => a - b);
  while (shipsArr.length > 0) {
    const shipSize = shipsArr.at(-1);
    const random = Math.random();
    let orientation;
    if (random > 0.5) {
      orientation = 'horizontal';
    } else {
      orientation = 'vertical';
    }
    if (board.addShip(randomIntFromInterval(0, 9), randomIntFromInterval(0, 9), Ship(shipSize, orientation))) {
      shipsArr.pop();
    }
  }

  return board;
}

function computerAttack() {
  if (gameFinish) return;
  if (player1.gameboard.receiveAttack(randomIntFromInterval(0, 9), randomIntFromInterval(0, 9))) {
    renderBoards();
    if (player1.gameboard.liveShip === 0) {
      document.querySelector('.winner').innerText = `Winner - ${player2.type}`;
      return;
    }
    currentPlayer = player1;
    return;
  }
  computerAttack();
}

function createHtmlBoard(gameboard, isHide) {
  const container = document.createElement('div');
  if (isHide) {
    for (let i = 0; i < 10; i++) {
      const row = document.createElement('div');
      row.className = 'row';
      for (let j = 0; j < 10; j++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = i;
        cell.dataset.col = j;
        //cell.innerText = gameboard.board[i][j].display;
        if (gameboard.board[i][j].display === 'H') {
          cell.classList.add('hit');
          cell.innerText = 'X';
        } else if (gameboard.board[i][j].display === 'X') {
          cell.classList.add('miss');
          cell.innerText = 'X';
        } else {
          cell.classList.add('free');
        }
        cell.addEventListener('click', (event) => {
          if (currentPlayer !== player1 || gameFinish) return;
          if (player2.gameboard.receiveAttack(i, j)) {
            renderBoards();
            if (player2.gameboard.liveShip === 0) {
              document.querySelector('.winner').innerText = `Winner - ${player1.type}`;
              return;
            }
            currentPlayer = player2;
            computerAttack();
          }
        });
        row.appendChild(cell);
      }
      container.appendChild(row);
    }
  } else {
    for (let i = 0; i < 10; i++) {
      const row = document.createElement('div');
      row.className = 'row';
      for (let j = 0; j < 10; j++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = i;
        cell.dataset.col = j;
        //cell.innerText = gameboard.board[i][j].display;
        if (gameboard.board[i][j].display === 'O') {
          cell.classList.add('free');
        } else if (gameboard.board[i][j].display === 'H') {
          cell.classList.add('hit');
          cell.innerText = 'X';
        } else if (gameboard.board[i][j].display === 'S') {
          cell.classList.add('ship');
        } else if (gameboard.board[i][j].display === 'X') {
          cell.classList.add('miss');
          cell.innerText = 'X';
        }
        row.appendChild(cell);
      }
      container.appendChild(row);
    }
  }

  return container;
}

function renderBoard(board, node, hide) {
  node.innerHTML = '';
  node.appendChild(createHtmlBoard(board, hide));
}

// Arrangement of ships
const firstBoard = Gameboard();
document.querySelector('.desk-for-ship').appendChild(createHtmlBoard(firstBoard));

const checkbox = document.querySelector('#oriental-checkbox');
checkbox.onchange = (event) => {
  if (event.target.checked) {
    verticalOrientation = true;
    document.querySelectorAll('.ship-horizontal').forEach((el) => (el.className = 'ship-vertical'));
  } else {
    verticalOrientation = false;
    document.querySelectorAll('.ship-vertical').forEach((el) => (el.className = 'ship-horizontal'));
  }
};

let verticalOrientation = false;

function generateShipForDrag(cell, orientation) {
  const div = document.createElement('div');
  div.draggable = true;
  if (orientation === 'vertical') {
    div.className = 'ship-vertical';
  } else {
    div.className = 'ship-horizontal';
  }

  for (let i = 0; i < cell; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.classList.add('ship');
    div.appendChild(cell);
  }

  generateShipForDrag.shipId += 1;
  div.id = `id${generateShipForDrag.shipId}-${cell}`;
  return div;
}

generateShipForDrag.shipId = 0;

// Generate ships

let shipCount = 6;

document.querySelector('.ship-container').appendChild(generateShipForDrag(4, 'horizontal'));
document.querySelector('.ship-container').appendChild(generateShipForDrag(3, 'horizontal'));
document.querySelector('.ship-container').appendChild(generateShipForDrag(3, 'horizontal'));
document.querySelector('.ship-container').appendChild(generateShipForDrag(2, 'horizontal'));
document.querySelector('.ship-container').appendChild(generateShipForDrag(2, 'horizontal'));
document.querySelector('.ship-container').appendChild(generateShipForDrag(2, 'horizontal'));

// Drag'n'Drop
function dragstart_handler(ev) {
  ev.dataTransfer.setData('text/plain', ev.target.id);
}

function dragover_handler(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData('text/plain');
  const [, cell] = data.split('-');
  let orientation;
  if (verticalOrientation) {
    orientation = 'vertical';
  } else {
    orientation = 'horizontal';
  }
  const row = Number(ev.target.dataset.row);
  const col = Number(ev.target.dataset.col);

  if (firstBoard.addShip(row, col, Ship(Number(cell), orientation))) {
    const root = document.querySelector('.desk-for-ship');
    renderBoard(firstBoard, root, false);
    addDragOverEvent();
    document.querySelector(`#${data}`).remove();
    shipCount -= 1;
    if (shipCount === 0) {
      startGame();
    }
  }
}

function addDragOverEvent() {
  document.querySelectorAll('.desk-for-ship .cell').forEach((el) => {
    el.addEventListener('dragover', (event) => event.preventDefault());
    el.ondrop = dragover_handler;
  });
}

function addOnDragStart() {
  document.querySelectorAll('.ship-vertical').forEach((el) => (el.ondragstart = dragstart_handler));
  document.querySelectorAll('.ship-horizontal').forEach((el) => (el.ondragstart = dragstart_handler));
}

addDragOverEvent();
addOnDragStart();

// Start game
const humanPlayer = Player(prompt('What is your name?'),'you', firstBoard);
const computerPlayer = Player(prompt('Enter Computer name'),'computer', generateDeskWithRandomShips([2, 2, 2, 4, 3, 3]));
const player1 = humanPlayer;
const player2 = computerPlayer;
let currentPlayer = player1;

function renderBoards() {
  document.querySelector('.first-player-desk').innerHTML = '';
  document.querySelector('.second-player-desk').innerHTML = '';
  document.querySelector('.first-player-desk').appendChild(createHtmlBoard(humanPlayer.gameboard, false));
  document.querySelector('.second-player-desk').appendChild(createHtmlBoard(computerPlayer.gameboard, true));
}

function startGame() {
  document.querySelector('.container').style.visibility = 'visible';
  document.querySelector('.before-game').remove();
  renderBoards();
}