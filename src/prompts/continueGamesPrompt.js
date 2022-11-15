import inquirer from 'inquirer';

async function continueGamesPrompt(gameIds) {

	let choicesList = gameIds;
	choicesList.push(new inquirer.Separator())
	choicesList.push('Back')
	// choicesList.push(new inquirer.Separator())

	console.clear();
	const answers = await inquirer.prompt({
	  name: 'continue',
	  type: 'list',
	  message: 'Choose Game Id\n',
	//   choices: choicesList,
	  choices: gameIds,
	});
	console.log("continueGamesPrompt", answers.continue);
	return answers.continue;
}

export { continueGamesPrompt }
  