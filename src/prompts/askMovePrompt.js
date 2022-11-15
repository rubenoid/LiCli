import inquirer from 'inquirer';
import fetch from 'node-fetch';
import myEmitter from '../utils/eventEmitter.js'
import * as dotenv from 'dotenv'
dotenv.config()
const { API_TOKEN } = process.env;

async function askMovePrompt(gameId, event) {
    const answer = await inquirer.prompt({
      name: 'move',
      type: 'prompt',
      message: "Your next move: ",
      default() {
        return '';
      },
    });
    if (answer.move === 'back') {
      myEmitter.emit(event);
      return;
    }
    const requestOptions = {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_TOKEN}`}
    }
    const res = await fetch(`https://lichess.org/api/board/game/${gameId}/move/${answer.move}`, requestOptions)
    const data = await res.json()
    if (res.status != 200) {
      console.log("Error:", data.error);
      askMovePrompt(gameId, event)
      return;
    }
  }

export { askMovePrompt }
