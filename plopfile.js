export default function (plop) {
  plop.setGenerator('exercise', {
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
        path: 'exercises/{{name}}.ts',
        templateFile: 'templates/ex.hbs',
      },
    ],
  })
}
