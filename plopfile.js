export default function (plop) {
  plop.setGenerator('ex', {
    description: 'new exercise',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'exercise name please',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'ex/{{name}}.ts',
        templateFile: 'templates/ex.hbs',
      },
    ],
  })
}
