const Ship = (size, orientation) => {
    let hits = 0; 
    const hit = () => {
        hits += 1;
    }
    const isSunk = () => {
        return hits >= length;
    }
    let sunk = isSunk();
    return {size, hits, hit, sunk, orientation};
}

const Gameboard = () => {
    
    const createBoard = () => {
        const board = [];
        for (let i = 0; i < 10; i++) {
            board.push(Array(10).fill('_').map((el) => ({display: 'O', ship: null })));
        }
        return board;
    }
    let board = createBoard();
    let liveShip = 0;
    const getBoardValue = () => {
        let value = '';
        board.forEach((row) => (value += row.map((cell) => cell.display).join('') + '\n'));
        return value;
    }
    
    const addShip = (x, y, ship) => {
        if (ship.orientation === 'horizontal') {
            //border check
            (x > 9 || y > 9 || x < 0 || y < 0 || ship.size > 10 - y) ? false : true;
            //empty cells check
            for (let i = 0; i < ship.size; i++) {
                (board[x][y + i].display !== 'O') ? false: true;
            }
            //check neighboring cells
            for(let i = y; i < y + ship.size; i++) {
                //check top row
                //skip for first row
                if (x !== 0) {
                    //top left
                    if (i !== 0 && board[x - 1][i - 1].display !== 'O') return false;
                    //top right
                    if (i !== 9 && board[x - 1][i + 1].display !== 'O') return false;
                    //top
                    if (board[x - 1][i].display !== 'O') return false;
                }
        
                //check low row
                //skip for last row
                if (x !== 9) {
                    //low left
                    if (i !== 0 && board[x + 1][i - 1].display !== 'O') return false;
                    //low right
                    if (i !== 9 && board[x + 1][i + 1].display !== 'O') return false;
                    //low
                    if (board[x + 1][i].display !== 'O') return false;
                }
            }
            //check left-right
            if (y !== 0 && board[x][y - 1].display !== 'O') return false;
            if (y + ship.size < 10 && board[x][y + ship.size].display !== 'O') return false;

            for (let i = 0; i < ship.size; i++) {
                board[x][y + i].display = 'S';
                board[x][y + i].ship = ship;
            }
        } else {
            //Vertical
            //check border
            if (x > 9 || y > 9 || x < 0 || y < 0 || ship.size > 10 - x) return false;
      
            //check empty cells
            for (let i = 0; i < ship.size; i++) {
              if (board[x + i][y].display !== 'O') return false;
            }
      
            //check neighboring cells
            for (let i = x; i < x + ship.size; i++) {
              //check left col
              //skip for first col
              if (y !== 0) {
                //top left
                if (i !== 0 && board[i - 1][y - 1].display !== 'O') return false;
                //low right
                if (i !== 9 && board[i + 1][y - 1].display !== 'O') return false;
                //left
                if (board[i][y - 1].display !== 'O') return false;
              }
      
              //check right col
              //skip for last col
              if (y !== 9) {
                //top right
                if (i !== 0 && board[i - 1][y + 1].display !== 'O') return false;
                //low right
                if (i !== 9 && board[i + 1][y + 1].display !== 'O') return false;
                //right
                if (board[i][y + 1].display !== 'O') return false;
              }
            }
      
            //check top - low
            if (x !== 0 && board[x - 1][y].display !== 'O') return false;
            if (x + ship.size < 10 && board[x + ship.size][y].display !== 'O') return false;
      
            for (let i = 0; i < ship.size; i++) {
              board[x + i][y].display = 'S';
              board[x + i][y].ship = ship;
            }
          }
      
          liveShip += 1;
          return true;
    }

    const receiveAttack = (x,y) => {
        // check border
        if (x > 9 || y > 9 || x < 0 || y < 0) return false;
        // zero living ships
        if (liveShip <= 0) return false;

        // miss
        if (board[x][y].display === 'O') {
        board[x][y].display = 'X';
        return true;
        // hit
        } else if (board[x][y].display === 'S') {
        board[x][y].display = 'H';
        board[x][y].ship.hit();
        // hit around if sunk
        if (board[x][y].ship.sunk) {
            const shipSize = board[x][y].ship.size;
            //for horizontal
            if (board[x][y].ship.orientation === 'horizontal') {
            //find start cell ship ( y )
            let start;
            for (let i = 0; i < 10; i++) {
                if (board[x][i].ship === board[x][y].ship) {
                start = i;
                break;
                }
            }

            for (let i = start; i < start + shipSize; i++) {
                // hit top row
                // skip for first row
                if (x !== 0) {
                //top left
                if (i !== 0 && i === start) board[x - 1][i - 1].display = 'X';
                //top right
                if (i !== 9 && i === start + shipSize - 1) board[x - 1][i + 1].display = 'X';
                //top
                board[x - 1][i].display = 'X';
                }
                // hit low row
                // skip for last row
                if (x !== 9) {
                //low left
                if (i !== 0 && i === start) board[x + 1][i - 1].display = 'X';
                // low right
                if (i !== 9 && i === start + shipSize - 1) board[x + 1][i + 1].display = 'X';
                //low
                board[x + 1][i].display = 'X';
                }
            }

            // hit left-right
            if (start !== 0) board[x][start - 1].display = 'X';
            if (start + shipSize < 10) board[x][start + shipSize].display = 'X';
            } else {
            // for vertical
            // find start cell ship ( x )
            let start;
            for (let i = 0; i < 10; i++) {
                if (board[i][y].ship === board[x][y].ship) {
                start = i;
                break;
                }
            }
            for (let i = start; i < start + shipSize; i++) {
                // hit left col
                // skip for first col
                if (y !== 0) {
                //left top
                if (i !== 0 && i === start) board[i - 1][y - 1].display = 'X';
                //left bottom
                if (i !== 9 && i === start + shipSize - 1) board[i + 1][y - 1].display = 'X';
                // left
                board[i][y - 1].display = 'X';
                }
                // hit right col
                // skip for last col
                if (y !== 9) {
                //low left
                if (i !== 0 && i === start) board[i - 1][y + 1].display = 'X';
                // low right
                if (i !== 9 && i === start + shipSize - 1) board[i + 1][y + 1].display = 'X';
                //low
                board[i][y + 1].display = 'X';
                }
                // hit top - bottom
                if (start !== 0) board[start - 1][y].display = 'X';
                if (start + shipSize < 10) board[start + shipSize][y].display = 'X';
            }
            }
            liveShip -= 1;
        }
        return true;
        } else {
        return false;
        }
    }
    return {board, liveShip, getBoardValue, addShip, receiveAttack};
}

const Player = (name ,type, gameboard) => {
    return {name, type, gameboard};
}

export {Ship, Gameboard, Player};