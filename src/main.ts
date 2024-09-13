import { Game, Event } from 'unrail-engine';
import { Env } from './env';
import { BotManager } from './bot-manager'

const NUMBER_OF_PLAYERS = 4
const env = new Env(NUMBER_OF_PLAYERS, 2)

let game = new Game('Far Away', env)
let botManager = new BotManager(game)

Event.emit('gameStateChanged', env); // initial dispatch of the state

// for debugging purpose
(window as any).game = game;
(window as any).botManager = botManager;

game.setMainLoop(() => env.render()) // register a main loop
game.start()
