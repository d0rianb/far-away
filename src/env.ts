import { clamp, GameEnvironement, getWindowDimensions, Renderer, Event } from 'unrail-engine';

import { Card, CARDS } from './card.ts'
import { Player } from './player.ts';
import { shuffle } from './utils.ts';

const CARD_PER_PLAYER: number = 3

enum State {
    Play = 0,
    Stacuary = 1,
    Pick = 2
}

class Env extends GameEnvironement {
    visibleCards: Array<Card>
    deck: Array<Card> // the first index is the top of the deck
    discard: Array<Card>

    players: Array<Player>

    constructor(playerNumber: number) {
        const { width, height } = getWindowDimensions()
        super(width, height)

        this.deck = CARDS
        shuffle(this.deck)
        this.visibleCards = this.deck.slice(playerNumber + 1)

        this.players = []
        for (let i = 0; i < playerNumber; i++) {
            const orientation = -Math.PI / 2 + i * 2 * Math.PI / playerNumber
            const isVertical = Math.abs(Math.cos(orientation)) > 0.7
            let playerWidth, playerHeight
            if (isVertical) {
                playerHeight = width! / 3
                playerWidth = height! / 4
            } else {
                playerWidth = width! / 3
                playerHeight = height! / 4

            }
            let x = width! / 2 + width! / 2 * Math.cos(orientation) - playerWidth / 2
            let y = height! / 2 + height! / 2 * Math.sin(orientation) - playerHeight / 2
            x = clamp(0, x, width! - playerWidth)
            y = clamp(0, y, height! - playerHeight)

            this.players.push(new Player(
                this.deck.splice(0, CARD_PER_PLAYER),
                x, y,
                playerWidth, playerHeight,
                orientation
            ))
        }
        // for test purpose 
        this.players.forEach(player => player.game = this.deck.splice(0, 8))
        console.log(this.players)
        this.initEvents()
        Renderer.create()
    }

    initEvents(): void {
        Event.onClick(mouseEvent => {
            const { x, y } = mouseEvent
            this.players.forEach(player => {
                if (player.contains(x, y)) {
                    player.onClick(x, y)
                }
            })
        })
    }

    update(): void {
        this.players.forEach(player => player.update())
        this.render()
    }


    render(): void {
        Renderer.beginFrame()
        this.players.forEach(player => {
            player.render()
        })
        // this.deck[0].render(100, 100)
        Renderer.endFrame()
    }

}

export { Env }
