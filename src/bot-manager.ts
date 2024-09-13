import { Game, Event } from 'unrail-engine'
import { Bot, DumbBot } from './bot'
import { Env, State } from './env'


class BotManager {
    game: Game
    bots: Array<Bot>

    constructor(game: Game) {
        this.game = game

        this.bots = []
        this.game.env.players.forEach(player => {
            if (!player.isOwnPlayer) {
                this.bots.push(new DumbBot(player))
            }
        })

        Event.on('gameStateChanged', (env: Env) => this.update(env))
    }

    update(env: Env) {
        // Update all the bots
        switch (env.state) {
            case State.Play:
                this.bots.forEach(bot => {
                    bot.player.selectedCardIndex = bot.playCard(env)
                })
                break
            case State.Sanctuary:
                this.bots.forEach(bot => bot.pickSanctuary(env, []))
                break
            case State.Pick:
                // TODO: update to order & delay
                this.bots.forEach(bot => {
                    Event.emit('cardChoosen', { cardIndex: bot.pickCard(env), player: bot.player })
                })
                break
        }
    }
}

export { BotManager }
