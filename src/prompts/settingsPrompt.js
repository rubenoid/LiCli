import inquirer from 'inquirer';

async function settingsPrompt() {
	console.clear();
	const answers = await inquirer.prompt({
	  name: 'color',
	  type: 'list',
	  message: 'Choose Board Color\n',
	  choices: [
		'brown',
		'cyan'
	  ]
	});
	return answers.color;
}

export { settingsPrompt }
