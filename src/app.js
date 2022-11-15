import inquirer from 'inquirer';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
import { Game, getGameIds } from './game/game.js';
import { readStream } from './utils/stream.js';
import { getFileRank } from 'fen-chess-board/lib/chess-utils.js';
import myEmitter from './utils/eventEmitter.js';
import { homePrompt } from './prompts/homePrompt.js';
import { helpPrompt } from './prompts/helpPrompt.js'
import { createGamePrompt } from './prompts/createGamePrompt.js';
import { continueGamesPrompt } from './prompts/continueGamesPrompt.js';
import { settingsPrompt } from './prompts/settingsPrompt.js';

dotenv.config();
let { API_TOKEN } = process.env;

const GameObject = {
  gameId: String,
  color: String,
  opponent: String,
  fen: String,
  speed: String,
  isMyTurn: Boolean,
}


let playerId;
while (playerId === undefined) {
  playerId = await checkAPIToken(API_TOKEN);
}

let bc = 'brown'

if (playerId !== undefined) home()



async function home() {
  
  let res = await homePrompt()
  if (res === 'Create Game') {
    let gameId = await createGamePrompt();
    let games = await getGames(API_TOKEN);
    let gameStarted = new Game(playerId, chosenGame(games, gameId), 'home', API_TOKEN, bc);
    gameStarted.startStream();
  }
  else if (res === 'Continue Game(s)') {
    continueGame();
  }
  else if (res === 'Settings') {
    bc = await settingsPrompt()
    // process.env.BOARD_COLOR = 'setting';
    home();
  }
  else if (res === 'Help') {
    await helpPrompt()
    home();
  }
  else if (res === 'Exit') {
    console.clear();
    console.log('Goodbye!');
    process.exit(0);
  }
}

const chosenGame = function(games, continueGameId) {
  for (let i = 0; i < games.length; i++) {
    if (games[i].gameId === continueGameId) {
      return games[i]
    }
  }
}

async function continueGame() {
  let games = await getGames(API_TOKEN);
  let gameIds = games.map(x => x.gameId);
  let continueGameId = await continueGamesPrompt(gameIds);
  if (continueGameId === 'Back') {
    home();
  } else {
    let gameStarted = new Game(playerId, chosenGame(games, continueGameId), 'back', API_TOKEN, bc);
    gameStarted.startStream();
  }
}

myEmitter.on('back', async() => continueGame());
myEmitter.on('home', async() => home());

async function checkConnection(token) {
  try {
    const res = await fetch('https://lichess.org/api/account', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`}
    });
    if (res.status !== 200) return undefined;
    const data = await res.json();
    return data.id;
  } catch {
    console.log('Could not reach server');
    process.exit(1);
  }
}

async function getGames(token) {
  try {
    const res = await fetch('https://lichess.org/api/account/playing', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`}
    })
    if (res.status != 200) {
      console.log("Could not reach server");
      return undefined
    }
    const data = await res.json();
    let games = [];
    for (let i = 0; i < data.nowPlaying.length; i++) {
      let game = Object.create(GameObject);
      game.gameId = data.nowPlaying[i].gameId;
      game.side = data.nowPlaying[i].color;
      game.opponent = data.nowPlaying[i].opponent.username;
      game.fen = data.nowPlaying[i].fen;
      game.speed = data.nowPlaying[i].speed;
      game.isMyTurn = data.nowPlaying[i].isMyTurn;
      games.push(game);
    }
    return games;
  } catch {
    console.log("An Error occured or could not reach server");
    process.exit(1);
  }
}

async function askAPIToken() {
  const answers = await inquirer.prompt({
    name: 'token',
    type: 'input',
    message: 'Please provide a valid API Token:',
    default() {
      return 'undefined';
    },
  });

  return answers.token;
}

async function checkAPIToken(token) {
  let playerId = await checkConnection(token)
  if (!playerId) {
    API_TOKEN = await askAPIToken();
    fs.writeFileSync('./.env', `API_TOKEN='${API_TOKEN}'`);
    playerId = await checkConnection(token)
  }
  return playerId;
}

// function setSetting() {
//   fs.appendFileSync('./.env', `\nBOARD_COLOR='BROWN'`);
// }


