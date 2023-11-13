import inquirer from 'inquirer'

/**
 * E.g. If you get a question you've solved before, skip it.
 */
export async function doYouWantToContinue() {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'continue',
      message: 'Do you want to continue?',
    },
  ])

  if (!answers.continue) {
    console.log('\n✋ Aborting execution...\n')
    process.exit(0)
  }
}
