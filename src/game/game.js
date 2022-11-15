import chalk from 'chalk';
import { createSpinner } from 'nanospinner';
import * as dotenv from 'dotenv'
import fetch from 'node-fetch';
import { readStream } from '../utils/stream.js';
import { asciiDif, unicodeChar } from '../utils/utils.js';
import { askMovePrompt } from '../prompts/askMovePrompt.js';

class Game {
	constructor(playerId, game, event, api_token, bc) {
    this.api_token = api_token
		this.playerId = playerId
		this.gameId = game.gameId;
    this.side = game.side;
    this.opponent = game.opponent;
    this.fen = game.fen;
    this.event = event;
    
    this.getRequestOptions = {
      method: 'GET',
      headers: { Authorization: `Bearer ${this.api_token}`},
    }

    this.postRequestOptions = {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.api_token}`}
    }   

    this.stream = fetch(`https://lichess.org/api/board/game/stream/${this.gameId}` ,this.getRequestOptions);
    this.ply = 0;
    // this.lastMove = '';
    this.spinner = createSpinner('Waiting for opponent...');
    this.spinner.start();
    this.bc = bc
	}

  //board = [...Array(8)].map(e => Array(8).fill('x'));
  board = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
  ]

  resetBoard() {
    this.board = [
      ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
      ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
      ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
    ]
  }

  startStream() {
    console.clear();
    this.stream
    .then(readStream(this.onMessage))
    .then(this.onComplete);   
  }
  
  onMessage = (obj) => {
    let lastMove;
    let lastLastMove;
    if (typeof obj.state !== 'undefined') {  // init state
      let moves = obj.state.moves.split(" ");
      console.log(moves);
      console.log(moves.length);
      lastMove = moves.at(-1);
      lastLastMove = moves.at(-2);
      if (moves[0] === '')
        this.ply = 0;
      else
        this.ply = moves.length;
      while (moves.length > 0)
        this.makeMoveUCI(moves.shift())
    }
    else if (typeof obj.moves !== 'undefined') { // pulling last move, werkt niet als zet wordt teruggenomen
      let moves = obj.moves.split(" ");
      lastMove = moves.at(-1);
      lastLastMove = moves.at(-2);
      if (moves.length < this.ply) { // undo move
        this.resetBoard();
        this.ply = moves.length;
        while (moves.length > 0)
          this.makeMoveUCI(moves.shift())
      }
      else {
        this.ply = moves.length;
        this.makeMoveUCI(moves.pop())
      }  
    }    
    else {
      return;
      console.error("Error: makeMoveUCI");
      process.exit(1);
    }
    
    this.spinner.stop();
    console.clear();
    //console.log("Type 'back' to go back\n");

    if (lastMove)
      // console.log('Last Move: ', lastMove, '(', Math.round(this.ply/2), ')')
      process.stdout.write(`Last Move: ${lastMove}  (#${Math.round(this.ply/2)})\n`);
    if (this.side === 'white') {
      this.printBoardWhite();
    }
    else {
      this.printBoardBlack();
    }

    if ((this.ply % 2 === 0 && this.side === 'white')
      || (this.ply % 2 === 1 && this.side === 'black')) {
      askMovePrompt(this.gameId, this.event);
    }
    else {
      this.spinner.start();
    }
  };

  onComplete = () => console.log('The stream has completed');

  printBoardWhite = () => {
    process.stdout.write(`${chalk.bgBlackBright.italic('                      \n')}`);
    for (let row = 0; row < 8; row++) {
      this.board[row] = this.board[row].map(unicodeChar);
      let rank = 8 - row;
      process.stdout.write(`${chalk.bgBlackBright.italic(' ' + rank +' ')}`);
      for (let column = 0; column < 8; column++) {
        let piece = `${this.board[row][column]} `;
        if ((row % 2 === 0 && column % 2 === 0) || (row % 2 === 1 && column % 2 === 1)) {
          if (this.bc === 'brown')
            process.stdout.write(`${chalk.bgYellowBright.black(piece)}`);
          else
            process.stdout.write(`${chalk.bgCyanBright.black(piece)}`);
        }
        else {
          if (this.bc === 'brown')
            process.stdout.write(`${chalk.bgYellow.black(piece)}`);
          else
            process.stdout.write(`${chalk.bgCyan.black(piece)}`);
        }
      }
      process.stdout.write(`${chalk.bgBlackBright.italic('   \n')}`);
    }
    process.stdout.write(`${chalk.bgGray.italic('   a b c d e f g h    \n')}`);
  }

  printBoardBlack = () => {
    process.stdout.write(`${chalk.bgBlackBright.italic('                      \n')}`);
    for (let row = 7; row >= 0; row--) {
      this.board[row] = this.board[row].map(unicodeChar);
      let rank = 8 - row;
      process.stdout.write(`${chalk.bgBlackBright.italic(' ' + rank +' ')}`);
      for (let column = 7; column >= 0; column--) {
        let piece = `${this.board[row][column]} `;
        if ((row % 2 === 0 && column % 2 === 0) || (row % 2 === 1 && column % 2 === 1)) {
          if (this.bc === 'brown')
            process.stdout.write(`${chalk.bgYellowBright.black(piece)}`);
          else
            process.stdout.write(`${chalk.bgCyanBright.black(piece)}`);
        }
        else {
          if (this.bc === 'brown')
            process.stdout.write(`${chalk.bgYellow.black(piece)}`);
          else
            process.stdout.write(`${chalk.bgCyan.black(piece)}`);
        }
      }
      process.stdout.write(`${chalk.bgBlackBright.italic('   \n')}`);
    }
    process.stdout.write(`${chalk.bgGray.italic('   h g f e d c b a    \n')}`);
  }

  makeMoveUCI(move) {
    if (!move.length || move === 'undefined')
    {
      console.log("error");
      return;
    }
    else if (move === "e1g1") {   // White short castling
      this.board[7][6] = 'K';
      this.board[7][5] = 'R';
      this.board[7][4] = ' ';
      this.board[7][7] = ' ';
    }
    else if (move === "e1c1") {   // White long castling
      this.board[7][2] = 'K';
      this.board[7][4] = 'R';
      this.board[7][4] = ' ';
      this.board[7][0] = ' ';
    }
    else if (move === "e7g7") {   // Black short castling
      this.board[0][6] = 'k';
      this.board[0][5] = 'r';
      this.board[0][4] = ' ';
      this.board[0][7] = ' ';
    }
    else if (move === "e7c7") {   // Black long castling
      this.board[0][2] = 'k';
      this.board[0][4] = 'r';
      this.board[0][4] = ' ';
      this.board[0][0] = ' ';
    }
    else {
      let from = move.substring(0, 2); // e2
      let to = move.substring(2, 4); // e4
    
      let rowFrom = asciiDif('8', from[1]);
      let rowTo = asciiDif('8', to[1]); 
      
      let columnFrom = asciiDif(from[0], 'a');
      let columnTo = asciiDif(to[0], 'a');
    
      if (move.length === 4)
        this.board[rowTo][columnTo] = this.board[rowFrom][columnFrom];
      else if (move.length === 5) { // promotion
        if (rowTo === 0)  // white
          this.board[rowTo][columnTo] = move[4].toUpperCase();
        else              // black
          this.board[rowTo][columnTo] = move[4];
      }
    
      this.board[rowFrom][columnFrom] = ' ' ;
    }
  };


	initBoardFEN() {
		this.board = [...Array(8)].map(e => Array(8).fill('x'));

		let fenSplit = this.fen.split('/');
		fenSplit[7] = fenSplit[7].substring(0, fenSplit[7].indexOf(' '));
	  
		for (let row = 0; row < fenSplit.length; row++) {
		  let column = 0;
		  for (let i = 0; i < fenSplit[row].length; i++) {
        let c = fenSplit[row][i];
        if (Number(c)) {
          let n = Number(c);
          for (let k = 0; k < n; k++) {
            this.board[row][column + k] = ' ';
          } 
          column += n;
        }
        else {
            this.board[row][column] = c;
          column++;
        }
		  }
		}
	}
}

// TODO test for no games available
async function getGameIds() {

	const requestOptions = {
	  method: 'GET',
	  headers: { 'Authorization': `Bearer ${this.api_token}`}
	}
	const res = await fetch('https://lichess.org/api/account/playing', requestOptions)
	const data = await res.json()

	console.log("data: ", data.nowPlaying.length);
	let gameIds = [];
	for (let i = 0; i < data.nowPlaying.length; i++) {
	  gameIds.push(data.nowPlaying[i].gameId);
	}
	return gameIds;
  }

export { getGameIds, Game }
