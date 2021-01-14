import chalk from 'chalk'

export default {
  info: (msg) => {
    console.log('💭', chalk.cyan(msg))
  },
  success: (msg) => {
    console.log(chalk.green('✔'), chalk.green(msg))
  },
  error: (msg) => {
    console.log('💥', chalk.red(msg))
  }
}
