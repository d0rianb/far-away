import { GameObject, Renderer, Animation } from 'unrail-engine'
import { Card } from './card'

class Player extends GameObject {
    hand: Array<Card>
    playedCards: Array<Card>
    orientation: number // angle
    selectedCardIndex: number
    isOwnPlayer: boolean

    constructor(hand: Array<Card>, x: number, y: number, width: number, height: number, orientation: number) {
        super(x, y, width, height)
        this.orientation = orientation
        this.hand = hand
        this.playedCards = []
        this.selectedCardIndex = -1 // negative means no selected card
        this.isOwnPlayer = false // By default, hide all the cards
    }

    onClick(x: number, y: number) {
        for (let i = 0; i < this.hand.length; i++) {
            if (this.hand[i].contains(x, y)) {
                if (this.selectedCardIndex == i) {
                    // the card is already selected
                    this.selectedCardIndex = -1
                } else {
                    this.selectedCardIndex = i
                }
                break;
            }
        }
    }

    getLastCard(): Card | null {
        if (this.playedCards.length > 0) {
            return this.playedCards[this.playedCards.length - 1]
        }
        return null
    }

    updateDeck() {
        const renderVertically: boolean = Math.abs(Math.cos(this.orientation)) > 0.7
        const selectedMargin = 20

        const DECK_CARD_SIZE = 90

        let cardMargin = 5
        let transversalMargin = 10
        let centerOffset = (this.width - this.hand.length * DECK_CARD_SIZE - cardMargin * (this.hand.length - 1)) / 2

        if (renderVertically) {
            centerOffset = (this.height - this.hand.length * DECK_CARD_SIZE - cardMargin * (this.hand.length - 1)) / 2
        }

        for (let i = 0; i < this.hand.length; i++) {
            let card = this.hand[i]
            card.width = DECK_CARD_SIZE
            card.height = DECK_CARD_SIZE
            let x = this.x + (card.width + cardMargin) * i * (renderVertically == 0);
            let y = this.y + (card.width + cardMargin) * i * (renderVertically == 1)
            if (renderVertically) {
                if (Math.cos(this.orientation) > 0) {
                    x += this.width - card.width - transversalMargin
                } else {
                    x += transversalMargin
                }
                y += centerOffset
                if (this.selectedCardIndex == i) {
                    x += selectedMargin * -Math.cos(this.orientation)
                }
            } else {
                x += centerOffset
                if (Math.sin(this.orientation) > 0) {
                    y += this.height - card.width - transversalMargin
                } else {
                    y += transversalMargin
                }
                if (this.selectedCardIndex == i) {
                    y += selectedMargin * -Math.sin(this.orientation)
                }
            }
            card.moveTo(x, y)

            const CARD_ANGLE = 0 // °
            let angle = (i - 1) * CARD_ANGLE * Math.PI / 180
            card.angle = angle
        }
    }

    updatePlayedCards() {
        const renderVertically: boolean = Math.abs(Math.cos(this.orientation)) > 0.7
        let cardMargin = 3
        let playedCardSize = (this.width - 9 * cardMargin) / 8

        if (renderVertically) {
            playedCardSize = (this.height - 9 * cardMargin) / 8
        }

        for (let i = 0; i < this.playedCards.length; i++) {
            let card = this.playedCards[i]
            card.width = playedCardSize
            card.height = playedCardSize
            card.isHided = false
            let x = this.width - cardMargin - i * (playedCardSize + cardMargin) - playedCardSize
            let y = 5

            if (Math.sin(this.orientation) < 0) {
                y = this.height - playedCardSize - 5
                x = this.width - x - playedCardSize
            }

            if (renderVertically) {
                x = 5
                y = 5

                if (Math.cos(this.orientation) < 0) {
                    x = this.width - playedCardSize - 5
                    y = this.height - cardMargin - i * (playedCardSize + cardMargin) - playedCardSize
                }

            }

            card.moveTo(this.x + x, this.y + y)
        }
    }

    update() {
        this.updateDeck()
        this.updatePlayedCards()

        if (this.isOwnPlayer) {
            this.hand.forEach(card => card.isHided = false)
        }
    }

    render(): void {
        Renderer.rect(this.x, this.y, this.width, this.height, {
            fillStyle: '#eee',
            strokeStyle: '#ddd',
            lineWidth: 0
        })

        this.hand.forEach(card => card.render())
        this.playedCards.forEach(card => card.render())
    }
}

export { Player }
