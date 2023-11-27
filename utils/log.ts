export const log = (...args: any[]) => {
  const date = new Date()
  const timeString = `[${date.toISOString()}]`
  console.log(timeString, ...args)
}
