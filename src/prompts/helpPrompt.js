import inquirer from 'inquirer';

async function helpPrompt() {
  console.clear();
	const answers = await inquirer.prompt({
		name: 'help',
		type: 'list',
		prefix: 'Help\n',
		suffix: 'Press Enter to go back',
		message: 
		`\nThis program uses UCI notation, a form of long algebraic notation.\n
		Examples of valid input:
		\t- e2e4
		\t- e7e5
		\t- e1g1 (white short castling)
		\t- e7e8q (for promotion)\n

		To leave a game and go back to previous menu, type 'back'.\n
		`,

    // default: 'back',
		choices: [
			'Back',
		],
	  })
    

	return answers.home;
}

export { helpPrompt }