import program from 'commander'
import setup from './setup'
import pull from './pull'
import push from './push'

program
  .command('setup')
  .description('Configure Postman Sync for first use')
  .action(setup)

program
  .command('push')
  .description('Push collection and environments to the Postman app')
  .action(push)

program
  .command('pull')
  .description('Pull collection and environments from Postman to the local copy')
  .action(pull)

program.parse(process.argv)
