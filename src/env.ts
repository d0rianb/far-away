import { clamp, GameEnvironement, getWindowDimensions, Renderer, Event } from 'unrail-engine'

import { Card, CARDS } from './card.ts'
import { Player } from './player.ts';
import { shuffle, all } from './utils.ts';

const CARD_PER_PLAYER: number = 3

enum State {
    /// Each player should pay one card
    Play = 0,
    /// If some players have santury, they should pick one of them
    Sanctuary = 1,
    /// Each player pick a new card 
    Pick = 2
}

class Env extends GameEnvironement {
    visibleCards: Array<Card>
    deck: Array<Card> // the first index is the top of the deck
    discard: Array<Card>

    players: Array<Player>
    state: State
    rounds: number

    // Refine super attributes, eliminating the null ckeck
    width: number
    height: number

    constructor(playerNumber: number, ownPlayerIndex: number) {
        if (ownPlayerIndex >= playerNumber) {
            throw "Error: the own player index should be less than the total number of players"
        }

        const { width, height } = getWindowDimensions()
        super(width, height)

        this.deck = CARDS
        shuffle(this.deck)
        this.visibleCards = this.deck.splice(0, playerNumber + 1)
        this.state = State.Play
        this.rounds = 1


        // Dimension of each players
        const nonOwnPlayerWidth = this.width * 2 / 3
        const nonOwnPlayerHeight = this.height / 6
        const ownPlayerWidth = this.width - 2 * nonOwnPlayerHeight
        const ownPlayerHeight = 2 * nonOwnPlayerHeight

        this.players = []
        for (let i = 0; i < playerNumber; i++) {
            const orientation = -Math.PI / 2 + i * 2 * Math.PI / playerNumber
            const isVertical = Math.abs(Math.cos(orientation)) > 0.7

            let playerWidth = ownPlayerWidth
            let playerHeight = ownPlayerHeight

            // The main player should be larger than the others
            if (i != ownPlayerIndex) {
                playerWidth = nonOwnPlayerWidth
                playerHeight = nonOwnPlayerHeight
            }

            if (isVertical) { // Switch both axis
                [playerWidth, playerHeight] = [playerHeight, playerWidth * this.height / this.width]
            }

            let x = this.width / 2 + this.width / 2 * Math.cos(orientation) - playerWidth / 2
            let y = this.height / 2 + this.height / 2 * Math.sin(orientation) - playerHeight / 2
            x = clamp(0, x, this.width - playerWidth)
            y = clamp(0, y, this.height - playerHeight)

            this.players.push(new Player(
                this.deck.splice(0, CARD_PER_PLAYER),
                x, y,
                playerWidth, playerHeight,
                orientation
            ))
        }

        this.players[ownPlayerIndex].isOwnPlayer = true

        this.initEvents()
        Renderer.create()
        this.update()
    }

    initEvents(): void {
        Event.onClick(mouseEvent => {
            const { x, y } = mouseEvent
            switch (this.state) {
                case State.Play:
                    this.players.forEach(player => {
                        if (player.contains(x, y)) {
                            player.onClick(x, y)
                        }
                    })
                    break
                case State.Pick:
                    let sortedPlayers = this.players
                        .slice()
                        .filter(player => player.hand.length == 2 && player.playedCards.length > 0)
                        .sort((playerA, playerB) => playerA.getLastCard()!.index - playerB.getLastCard()!.index)
                    if (sortedPlayers.length > 0) {
                        let playerToChoose = sortedPlayers[0]
                        for (let i = 0; i < this.visibleCards.length; i++) {
                            let card = this.visibleCards[i]
                            if (card.contains(x, y)) {
                                Event.emit('cardChoosen', { cardIndex: i, player: playerToChoose })
                                break
                            }
                        }
                    }
                    break
            }
            this.update()
        })

        Event.on('cardChoosen', ({ cardIndex, player }) => {
            if (this.state != State.Pick) return
            // TODO: check that the player is the one to choose
            let clickedCard = this.visibleCards.splice(cardIndex, 1)[0]
            if (!player.isOwnPlayer) {
                clickedCard.isHided = true
            }
            player.hand.push(clickedCard)
            this.update()
        })
    }

    checkState() {
        switch (this.state) {
            case State.Play:
                // If all player have choose their cards
                if (all(this.players, player => player.selectedCardIndex >= 0)) {
                    this.players.forEach(player => {
                        player.playedCards.push(player.hand.splice(player.selectedCardIndex, 1)[0])
                        player.selectedCardIndex = -1
                    })
                    this.changeState()
                }
                break

            case State.Sanctuary:
                // Not Implemeneted yet
                if (this.rounds == 8) {
                    // End of the game
                } else {
                }
                this.changeState()
                break
            case State.Pick:
                if (all(this.players, player => player.hand.length === 3)) {
                    // Discard the lasting cards
                    this.visibleCards = this.deck.splice(0, this.players.length + 1)
                    this.rounds += 1
                    this.changeState()
                }
                break
        }
    }

    changeState() {
        // Update the state and emit the change for the bot to konw when to play
        this.state = (this.state + 1) % 3
        Event.emit('gameStateChanged', this)
    }

    update(): void {
        // Should manually get called after every event succeptible to chnage the game state
        this.checkState() // has to be called at the begining & the end of the update method
        const cardMargin = 5

        for (let i = 0; i < this.visibleCards.length; i++) {
            let card = this.visibleCards[i]
            card.isHided = false

            let x = (this.width - this.visibleCards.length * (card.width + cardMargin)) / 2 + i * (card.width + cardMargin)
            let y = (this.height - card.height) / 2 - this.height / 12 // offset by nonOwnPlayerHeight / 2

            card.moveTo(x, y)
        }

        this.players.forEach(player => player.update())
        this.checkState() // has to be called at the begining & the end of the update method
    }


    render(): void {
        Renderer.beginFrame('#fefefe')

        this.visibleCards.forEach(card => card.render())

        this.players.forEach(player => {
            player.render()
        })

        // DEBUG
        if (false) {
            let card = this.deck[0]
            card.moveTo(100, 100)
            card.width = 200
            card.height = 200
            card.isHided = false
            card.render()
        }

        Renderer.endFrame()
    }

}

export { Env, State }
