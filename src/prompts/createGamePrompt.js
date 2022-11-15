import inquirer from 'inquirer';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv'
dotenv.config()
const { API_TOKEN } = process.env;

async function createGamePrompt() {
  console.clear();
	const answers = await inquirer.prompt([
	{
		name: 'color',
		type: 'list',
		message: 'Select Color\n',
		choices: [
		  'white',
		  'black'
		]
	},
	{
	  name: 'level',
	  type: 'input',
	  message: 'Pick a level: 1 - 8',
	  validate(value) {
		if (value > 0 && value <=  8)
		  return true
		else
		  return 'Please select a valid level'
	  },
	}]);
	return challengeAI(answers.level, answers.color);
}
    
async function challengeAI(level, color) {
  const body = {
    level: `${level}`,
    color: `${color}`,
  }

const formBody = Object.keys(body).map(key => 
encodeURIComponent(key) + '=' + encodeURIComponent(body[key])).join('&');

const res = await fetch(`https://lichess.org/api/challenge/ai`, {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
  },
  body: formBody
})
  const data = await res.json();
  console.log("formBody:", data.id);

  return data.id;
};

export { createGamePrompt }