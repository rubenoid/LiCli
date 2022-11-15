import inquirer from 'inquirer';

async function homePrompt() {
	console.clear();
	const answers = await inquirer.prompt([{
	  name: 'home',
	  type: 'list',
	  prefix: '',
	  message: 'Home\n',
	  choices: [
		'Create Game',
		'Continue Game(s)',
		'Settings',
		'Help',
		new inquirer.Separator(),
		'Exit'
	  ],
	}])
  
	return answers.home;
}

export { homePrompt }
