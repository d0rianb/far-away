import { Player } from './player';
import { Env } from './env'
import { Sanctuary } from './sanctuary'

interface Bot {
    name: string
    player: Player

    pickCard(env: Env): number // cardIndex
    playCard(env: Env): number // cardIndex
    pickSanctuary(env: Env, sanctuaries: Sanctuary[]): number // sanctuaryIndex
}

class DumbBot implements Bot {
    name: string
    player: Player

    constructor(playerRef: Player) {
        this.name = 'DumbBot'
        this.player = playerRef
    }

    playCard(env: Env): number {
        return 0 // returns always the first card
    }

    pickCard(env: Env): number {
        return 0;
    }

    pickSanctuary(env: Env, sanctuaries: Sanctuary[]): number {
        // this bot is fucking dumb
        return 0
    }
}

export { Bot, DumbBot }
