import { Easing } from 'unrail-engine';
import { GameObject, Renderer, Animation } from 'unrail-engine';

type Resources = {
    bull?: number
    ananas?: number,
    blues?: number
};

interface PointType {
    value: number
    callback(cards: Array<Card>): number
    render(): void // render the condition on the card
}

class StaticPoints implements PointType {
    value: number

    constructor(value: number) {
        this.value = value;
    }
    render(): void {
        throw new Error('Method not implemented.')
    }

    callback(cards: Array<Card>): number {
        return this.value;
    }
}

class ColorsPoint implements PointType {
    value: number
    colors: Array<Color>

    constructor(value: number, colors: Array<Color>) {
        this.value = value
        this.colors = colors
    }
    callback(cards: Array<Card>): number {
        const count = cards.filter(card => this.colors.includes(card.color)).length
        return count * this.value;
    }

    render(): void {
        throw new Error('Method not implemented.');
    }
}

class NightPoint implements PointType {
    value: number;

    constructor(value: number) {
        this.value = value
    }

    callback(cards: Array<Card>): number {
        const count = cards.filter(card => card.isNight).length
        return count * this.value
    }

    render(): void {
        throw new Error('Method not implemented.');
    }
}

enum Color {
    Blue = 'rgb(70, 150, 190)',
    Red = 'rgb(205, 100, 75)',
    Green = 'rgb(110, 175, 125)',
    Yellow = 'rgb(220, 200, 90)'
}

const DEFAULT_CARD_SIZE: number = 90

class Card extends GameObject {
    index: number
    color: Color
    isNight: boolean
    resources: Resources
    conditions: Resources
    points: PointType
    hasSancturay: boolean

    animationX: Animation | null;
    animationY: Animation | null;
    angle: number;
    isHided: boolean

    constructor(index: number, color: Color, resources: Resources, conditions: Resources, points: PointType, hasSancturay: boolean = false) {
        // Init the card at 0, 0
        super(0, 0, DEFAULT_CARD_SIZE, DEFAULT_CARD_SIZE)
        this.angle = 0
        this.animationX = null
        this.animationY = null

        // Data
        this.index = index
        this.color = color
        this.isNight = this.index <= 20 && this.index <= 40
        this.resources = resources
        this.conditions = conditions
        this.points = points
        this.hasSancturay = hasSancturay
        this.isHided = true
    }

    moveTo(x: number, y: number) {
        const MOVE_DURATION = 250 // ms
        const EPS = 1e-5
        if (Math.abs(this.x - x) > EPS) {
            if (this.animationX != null) {
                this.animationX.to = x
            } else {
                this.animationX = new Animation(this.x, x, MOVE_DURATION, Easing.easeOut, { autostart: true })
                this.animationX.onFinish = () => { this.animationX = null }
            }
            this.x = x
        }

        if (Math.abs(this.y - y) > EPS) {
            if (this.animationY != null) {
                this.animationY.to = y
            } else {
                this.animationY = new Animation(this.y, y, MOVE_DURATION, Easing.easeOut, { autostart: true })
                this.animationY.onFinish = () => { this.animationY = null }
            }
            this.y = y
        }
    }

    render(): void {
        const ctx = Renderer.getContext()
        ctx.save()
        let x = (this.animationX != null) ? this.animationX.value : this.x
        let y = (this.animationY != null) ? this.animationY.value : this.y
        ctx.translate(x, y)
        if (this.angle != 0) {
            ctx.translate(this.width / 2, this.height)
            ctx.rotate(this.angle)
            ctx.translate(-this.width / 2, -this.height)
        }


        if (this.isHided) {
            Renderer.roundedRect(
                0, 0, this.width!, this.height!, 12, {
                fillStyle: 'grey',
                lineWidth: 0
            })
        } else {
            // Draw the card relative to 0, 0
            Renderer.roundedRect(
                0, 0, this.width!, this.height!, 12, {
                fillStyle: this.color,
                lineWidth: 0
            })
            // Basic unit
            const percent = this.width! / 100;

            // Draw the number
            Renderer.circle(15 * percent, 15 * percent, 12 * percent, {
                strokeStyle: this.isNight ? 'blue' : 'yellow',
                lineWidth: 2
            })
            Renderer.centeredText(this.index.toString(), 15 * percent, 15 * percent, {
                size: 12 * percent,
                color: this.isNight ? 'blue' : 'yellow',
                textBaseline: 'bottom'
            })

            // Draw the sanctuary
            if (this.hasSancturay) {
                Renderer.rectFromCenter(40 * percent, 10 * percent, 7 * percent, 7 * percent, {
                    fillStyle: 'yellow'
                })
            }

            // Draw the resources
            const resourcesKeys = Object.keys(this.resources)
            let resourceX = 95 * percent;
            const resourceWidth = 10 * percent
            const resourceMargin = 2 * percent

            for (let i = 0; i < resourcesKeys.length; i++) {
                let color = 'red'
                switch (resourcesKeys[i]) {
                    case 'bull':
                        color = 'red'
                        break
                    case 'blues':
                        color = 'blue'
                        break
                    case 'ananas':
                        color = 'yellow'
                        break
                }

                for (let amount = 0; amount < this.resources[resourcesKeys[i]]; amount++) {
                    Renderer.rect(resourceX - resourceWidth, 5 * percent, resourceWidth, resourceWidth, {
                        fillStyle: color
                    })
                    resourceX -= resourceWidth + resourceMargin
                }
            }

            // TODO: Draw the conditions
        }
        ctx.restore()
    }
}

const CARDS = [
    new Card(44, Color.Yellow, {}, { blues: 1, ananas: 1 }, new ColorsPoint(2, [Color.Yellow, Color.Blue])),
    new Card(49, Color.Blue, {}, { blues: 2, ananas: 1 }, new StaticPoints(12), true),
    new Card(14, Color.Red, { ananas: 1 }, {}, new NightPoint(2)),
    new Card(45, Color.Green, { blues: 1 }, { bull: 3 }, new StaticPoints(13)),

    // Sample data
    new Card(44, Color.Yellow, {}, { blues: 1, ananas: 1 }, new ColorsPoint(2, [Color.Yellow, Color.Blue])),
    new Card(44, Color.Yellow, {}, { blues: 1, ananas: 1 }, new ColorsPoint(2, [Color.Yellow, Color.Blue])),
    new Card(44, Color.Yellow, {}, { blues: 1, ananas: 1 }, new ColorsPoint(2, [Color.Yellow, Color.Blue])),
    new Card(44, Color.Yellow, {}, { blues: 1, ananas: 1 }, new ColorsPoint(2, [Color.Yellow, Color.Blue])),
    new Card(44, Color.Yellow, {}, { blues: 1, ananas: 1 }, new ColorsPoint(2, [Color.Yellow, Color.Blue])),
    new Card(44, Color.Yellow, {}, { blues: 1, ananas: 1 }, new ColorsPoint(2, [Color.Yellow, Color.Blue])),
    new Card(44, Color.Yellow, {}, { blues: 1, ananas: 1 }, new ColorsPoint(2, [Color.Yellow, Color.Blue])),
    new Card(44, Color.Yellow, {}, { blues: 1, ananas: 1 }, new ColorsPoint(2, [Color.Yellow, Color.Blue])),
    new Card(44, Color.Yellow, {}, { blues: 1, ananas: 1 }, new ColorsPoint(2, [Color.Yellow, Color.Blue])),
    new Card(44, Color.Yellow, {}, { blues: 1, ananas: 1 }, new ColorsPoint(2, [Color.Yellow, Color.Blue])),
    new Card(44, Color.Yellow, {}, { blues: 1, ananas: 1 }, new ColorsPoint(2, [Color.Yellow, Color.Blue])),
    new Card(44, Color.Yellow, {}, { blues: 1, ananas: 1 }, new ColorsPoint(2, [Color.Yellow, Color.Blue])),
    new Card(44, Color.Yellow, {}, { blues: 1, ananas: 1 }, new ColorsPoint(2, [Color.Yellow, Color.Blue])),
    new Card(44, Color.Yellow, {}, { blues: 1, ananas: 1 }, new ColorsPoint(2, [Color.Yellow, Color.Blue])),
    new Card(44, Color.Yellow, {}, { blues: 1, ananas: 1 }, new ColorsPoint(2, [Color.Yellow, Color.Blue])),
    new Card(44, Color.Yellow, {}, { blues: 1, ananas: 1 }, new ColorsPoint(2, [Color.Yellow, Color.Blue])),
    new Card(49, Color.Blue, {}, { blues: 2, ananas: 1 }, new StaticPoints(12), true),
    new Card(14, Color.Red, { ananas: 1 }, {}, new NightPoint(2)),
    new Card(45, Color.Green, { blues: 1 }, { bull: 3 }, new StaticPoints(13)),
    new Card(49, Color.Blue, {}, { blues: 2, ananas: 1 }, new StaticPoints(12), true),
    new Card(14, Color.Red, { ananas: 1 }, {}, new NightPoint(2)),
    new Card(45, Color.Green, { blues: 1 }, { bull: 3 }, new StaticPoints(13)),
    new Card(49, Color.Blue, {}, { blues: 2, ananas: 1 }, new StaticPoints(12), true),
    new Card(14, Color.Red, { ananas: 1 }, {}, new NightPoint(2)),
    new Card(45, Color.Green, { blues: 1 }, { bull: 3 }, new StaticPoints(13)),
    new Card(49, Color.Blue, {}, { blues: 2, ananas: 1 }, new StaticPoints(12), true),
    new Card(14, Color.Red, { ananas: 1 }, {}, new NightPoint(2)),
    new Card(45, Color.Green, { blues: 1 }, { bull: 3 }, new StaticPoints(13)),
    new Card(49, Color.Blue, {}, { blues: 2, ananas: 1 }, new StaticPoints(12), true),
    new Card(14, Color.Red, { ananas: 1 }, {}, new NightPoint(2)),
    new Card(45, Color.Green, { blues: 1 }, { bull: 3 }, new StaticPoints(13)),
    new Card(49, Color.Blue, {}, { blues: 2, ananas: 1 }, new StaticPoints(12), true),
    new Card(14, Color.Red, { ananas: 1 }, {}, new NightPoint(2)),
    new Card(45, Color.Green, { blues: 1 }, { bull: 3 }, new StaticPoints(13)),
    new Card(49, Color.Blue, {}, { blues: 2, ananas: 1 }, new StaticPoints(12), true),
    new Card(14, Color.Red, { ananas: 1 }, {}, new NightPoint(2)),
    new Card(45, Color.Green, { blues: 1 }, { bull: 3 }, new StaticPoints(13)),
    new Card(49, Color.Blue, {}, { blues: 2, ananas: 1 }, new StaticPoints(12), true),
    new Card(14, Color.Red, { ananas: 1 }, {}, new NightPoint(2)),
    new Card(45, Color.Green, { blues: 1 }, { bull: 3 }, new StaticPoints(13)),
    new Card(49, Color.Blue, {}, { blues: 2, ananas: 1 }, new StaticPoints(12), true),
    new Card(14, Color.Red, { ananas: 1 }, {}, new NightPoint(2)),
    new Card(45, Color.Green, { blues: 1 }, { bull: 3 }, new StaticPoints(13)),
    new Card(49, Color.Blue, {}, { blues: 2, ananas: 1 }, new StaticPoints(12), true),
    new Card(14, Color.Red, { ananas: 1 }, {}, new NightPoint(2)),
    new Card(45, Color.Green, { blues: 1 }, { bull: 3 }, new StaticPoints(13)),
    new Card(49, Color.Blue, {}, { blues: 2, ananas: 1 }, new StaticPoints(12), true),
    new Card(14, Color.Red, { ananas: 1 }, {}, new NightPoint(2)),
    new Card(45, Color.Green, { blues: 1 }, { bull: 3 }, new StaticPoints(13)),
    new Card(49, Color.Blue, {}, { blues: 2, ananas: 1 }, new StaticPoints(12), true),
    new Card(14, Color.Red, { ananas: 1 }, {}, new NightPoint(2)),
    new Card(45, Color.Green, { blues: 1 }, { bull: 3 }, new StaticPoints(13)),
    new Card(49, Color.Blue, {}, { blues: 2, ananas: 1 }, new StaticPoints(12), true),
    new Card(14, Color.Red, { ananas: 1 }, {}, new NightPoint(2)),
    new Card(45, Color.Green, { blues: 1 }, { bull: 3 }, new StaticPoints(13)),
    new Card(49, Color.Blue, {}, { blues: 2, ananas: 1 }, new StaticPoints(12), true),
    new Card(14, Color.Red, { ananas: 1 }, {}, new NightPoint(2)),
    new Card(45, Color.Green, { blues: 1 }, { bull: 3 }, new StaticPoints(13)),
    new Card(49, Color.Blue, {}, { blues: 2, ananas: 1 }, new StaticPoints(12), true),
    new Card(14, Color.Red, { ananas: 1 }, {}, new NightPoint(2)),
    new Card(45, Color.Green, { blues: 1 }, { bull: 3 }, new StaticPoints(13)),
    new Card(49, Color.Blue, {}, { blues: 2, ananas: 1 }, new StaticPoints(12), true),
    new Card(14, Color.Red, { ananas: 1 }, {}, new NightPoint(2)),
    new Card(45, Color.Green, { blues: 1 }, { bull: 3 }, new StaticPoints(13)),
]



export {
    Card,
    CARDS,
}
