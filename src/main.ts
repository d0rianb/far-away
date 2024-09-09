import { Game } from 'unrail-engine';
import { Env } from './env';

const env = new Env(4)
let game = new Game('Far Away')

game.setMainLoop(() => env.render()) // register a main loop
game.start()
