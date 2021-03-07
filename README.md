# Postman Sync CLI

A CLI tool to sync a Postman workspace with a local directory.

This is mostly useful when using individual, personal workspaces with a free Postman account.
It's an alternative approach to the sharing capabilities of the commercial Postman service.

ATTENTION: this is work-in-progress and not meant to deal with precious data!

## Installation

Node version 12.x or higher is required.

## Configuration

Run `postman-sync setup` within the root directory of your project to setup a Postman CLI config.

You'll be promted for a Postman API key. See the Postman Learning Center for [details on creating an API key](https://learning.getpostman.com/docs/postman/postman-api/intro-api/).

## Usage

Run the `postman-sync` command from the root directory of your repo.

### `postman-sync pull`

Pulls collections and environments from the Postman API and merges the items into the local copy.
The synchronized collections and environments are saved locally as JSON files as one would export them from the Postman app.

The process is interactive and the user can confirm each new or updated item to be saved into the local copy.

### `postman-sync push`

Uploads the local copies of collections and environments to the Postman API and thus makes them immediately available in the Postman app.

### `postman-sync add <filename>`

Adds the given local file to the sync directory in order to upload it to the Postman worskpace on the next push.


## Other

Use `pms` instead of `postman-sync` for faster typing.

Use `pms --help` to see all commands.


## Example workflow

In a project checkout...

### Connect the local checkout with your Postman worksapce

1. Install `postman-sync` via npm:  
`npm install thomascube/postman-sync`  
`export PATH=./node_modules/.bin:$PATH`  

2. Select collections and environments:  
`postman-sync setup`  

3. Fetch collections and environments:  
`postman-sync pull`  

4. Store Postman files in your Git repository:  
   `git add <postman-directory>/*.json`  
   `git commit`  

### Synchronize your Postman worksapce with the Git repository

1. Fetch from Git:  
`git pull`  

2. Pull and merge your Postman worksapce:  
`postman-sync pull`  

3. Commit Postman changed to your Git repository:  
`git add <postman-directory>/*.json`  
`git commit`  

4. Push collections and environemtns from Git to your Postman worksapce:
`postman-sync push`  

### Import files from Git to your Postman workspace

1. Connect Git checkout with your Postman workspace:  
`postman-sync setup`  

2. Add collection or environment file to sync:  
`postman-sync add <file>`  

4. Push collections and environments from Git to your Postman worksapce:
`postman-sync push`  

## Thanks

... to [Postman CLI](https://github.com/matt-ball/postman-cli) by Matt Ball for the inspiration and some bootstrapping code!
