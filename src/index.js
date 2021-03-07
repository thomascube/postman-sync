import program from 'commander'
import setup from './setup'
import pull from './pull'
import push from './push'
import addFile from './add'

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

program
  .command('add <file>')
  .description('Add a local file to the directory to sync it with the Postman workspace')
  .action(addFile)

program.parse(process.argv)
