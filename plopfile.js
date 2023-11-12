export default function (
  /** @type {import('plop').NodePlopAPI} */
  plop,
) {
  plop.setGenerator('exercise', {
    description: 'new exercise',
    prompts: [
      {
        name: 'name',
        type: 'input',
        message: 'exercise name please',
      },
      {
        name: 'dir',
        type: 'confirm',
        default: false,
        message: 'create directory?',
      },
    ],
    actions: function (data) {
      return [
        {
          type: 'add',
          path: data.dir
            ? 'exercises/{{name}}/{{name}}.ts'
            : 'exercises/{{name}}.ts',
          templateFile: 'templates/ex.hbs',
        },
      ]
    },
  })
}
