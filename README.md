# DracoBot
A personal discord bot

* https://docs.discord.com/developers/quick-start/getting-started

## Setup

### Requirements

* NPM  
* ngrok
* Node.js

From the project root, run the following:

* `npm install`
* `npm run register`

## Run

From the project root, run the following:

* `npm run start`
* `ngrok http 3000`

## Test

To run unit tests with jest, run the following:

* `npm run test`

## Supported Commands

### test

Simple test command to test basic bot functionality. 

* **input:** `\test` (no arguments)
* **output:** a "hello world" message

### challenge

An extended rock-paper-scissors game from the discord bot tutorial

* **input:** `\challenge <object>`
    * **parameter `<object>`:** the object you choose to play for the game.
* **output** an extended rock-paper-scissors game which you or another user can respond to through the bot's GUI, playing against your input object.