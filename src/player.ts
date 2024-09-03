import { GameObject, Renderer, Animation } from 'unrail-engine'
import { Card, CARD_SIZE } from './card'
import { Easing } from 'unrail-engine'

class Player extends GameObject {
    hand: Array<Card>
    game: Array<Card>
    orientation: number // angle
    selectedCardIndex: number

    constructor(hand: Array<Card>, x: number, y: number, width: number, height: number, orientation: number) {
        super(x, y, width, height)
        this.orientation = orientation
        this.hand = hand
        this.game = []
        this.selectedCardIndex = -1 // negative means no selected card
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

    update() {
        const renderVertically = Math.abs(Math.cos(this.orientation)) > 0.7
        const selectedMargin = 20

        let cardMargin = Math.max(this.width - this.hand.length * CARD_SIZE, 0) / (this.hand.length + 1)
        let transversalMargin = Math.max(this.height - CARD_SIZE, 0) / 2

        if (renderVertically) {
            cardMargin = Math.max(this.height - this.hand.length * CARD_SIZE, 0) / (this.hand.length + 1)
            transversalMargin = Math.max(this.width - CARD_SIZE, 0) / 2
        }

        for (let i = 0; i < this.hand.length; i++) {
            let card = this.hand[i]
            let x = this.x + (CARD_SIZE + cardMargin) * i * (renderVertically == 0);
            let y = this.y + (CARD_SIZE + cardMargin) * i * (renderVertically == 1)
            if (renderVertically) {
                x += transversalMargin
                y += cardMargin
                if (this.selectedCardIndex == i) {
                    x += selectedMargin * -Math.cos(this.orientation)
                }
            } else {
                x += cardMargin
                y += transversalMargin
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

    render(): void {
        Renderer.rect(this.x, this.y, this.width, this.height, {
            fillStyle: '#eee'
        })

        this.hand.forEach(card => card.render())
    }
}

export { Player }
