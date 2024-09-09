import { GameObject, Renderer, Animation, Easing } from 'unrail-engine';

enum ResourcesName {
    Bull = 'bull',
    Ananas = 'ananas',
    Blues = 'blues'
}

type Resources = {
    bull?: number
    ananas?: number,
    blues?: number
}

function getResourceColor(res: ResourcesName | string): string {
    switch (res) {
        case ResourcesName.Bull || 'bull':
            return 'red'
        case ResourcesName.Ananas || 'ananas':
            return 'yellow'
        case ResourcesName.Blues || 'blues':
            return 'blue'
    }
}

interface PointType {
    value: number
    callback(cards: Array<Card>): number
    render(width: number, height: number): void // render the condition on the card
}

class NoPoint implements PointType {
    value: number

    constructor() {
        this.value = 0
    }

    render(_width: number, _height: number): void { }

    callback(_cards: Array<Card>): number {
        return this.value;
    }
}


class StaticPoints implements PointType {
    value: number

    constructor(value: number) {
        this.value = value;
    }

    render(width: number, height: number): void {
        Renderer.text(this.value.toString(), width / 2, height / 2, {
            size: Math.min(width, height) / 3,
            textBaseline: 'middle',
            color: 'white'
        })
    }

    callback(_cards: Array<Card>): number {
        return this.value;
    }
}

class SanctuaryPoints implements PointType {
    value: number

    constructor(value: number) {
        this.value = value;
    }

    render(width: number, height: number): void {
        const percent = Math.min(width, height) / 100
        Renderer.rect(10 * percent, 10 * percent, 80 * percent, 80 * percent, {
            fillStyle: 'yellow',
            strokeStyle: 'yellow',
            globalAlpha: 0.75
        })
        Renderer.centeredText(this.value.toString(), width / 2, height / 2, {
            size: Math.min(width, height) / 3,
            textBaseline: 'middle',
            color: 'black'
        })
    }

    callback(cards: Array<Card>): number {
        const count = cards.filter(card => card.hasSancturay).length
        return count * this.value;
    }
}

class ResourcePoints implements PointType {
    resource: ResourcesName
    value: number

    constructor(resource: ResourcesName, value: number) {
        this.resource = resource;
        this.value = value;
    }

    render(width: number, height: number): void {
        const percent = Math.min(width, height) / 100

        let color = getResourceColor(this.resource)

        Renderer.rect(10 * percent, 10 * percent, 80 * percent, 80 * percent, {
            fillStyle: color,
            globalAlpha: 0.75
        })
        Renderer.centeredText(this.value.toString(), width / 2, height / 2, {
            size: Math.min(width, height) / 3,
            textBaseline: 'middle',
            color: 'black'
        })
    }

    callback(cards: Array<Card>): number {
        const count = cards.reduce((value, card) => value += (card.resources[this.resource] || 0) as number, 0)
        return count * this.value;
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

    render(width: number, height: number): void {
        const percent = Math.min(width, height) / 100
        const rect_size = 20 * percent
        const textOptions = {
            size: Math.min(width, height) / 3,
            color: 'black',
            textBaseline: 'top'
        }
        const margin = 2 * percent
        if (this.colors.length == 1) {
            Renderer.rect(20 * percent, height / 2 - rect_size / 2, rect_size, rect_size, { fillStyle: this.colors[0] })
            Renderer.text(` = ${this.value}`, 20 * percent + rect_size + margin, height / 2 - rect_size, textOptions)
        } else if (this.colors.length == 2) {
            Renderer.rect(10 * percent, height / 2 - rect_size / 2, rect_size, rect_size, { fillStyle: this.colors[0] })
            Renderer.rect(10 * percent + margin + rect_size, height / 2 - rect_size / 2, rect_size, rect_size, { fillStyle: this.colors[1] })
            Renderer.text(` = ${this.value}`, 10 * percent + 2 * rect_size + 2 * margin, height / 2 - rect_size, textOptions)
        } else {
            console.log('Too many colors')
        }
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

    render(width: number, height: number): void {
        const percent = Math.min(width, height) / 100
        Renderer.circle(width / 2, height / 2, 40 * percent, {
            strokeStyle: 'blue',
            lineWidth: 3
        })
        Renderer.centeredText(this.value.toString(), width / 2, height / 2, {
            size: Math.min(width, height) / 3,
            textBaseline: 'middle',
            color: 'blue'
        })
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

    // Refine super attributes, eliminating the null ckeck
    width: number
    height: number

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

    renderResources(res: Resources, resourceInitialX: number, resourceInitialY: number, resourceWidth: number, resourceHeight: number, resourceMargin: number) {
        const resourcesKeys = Object.keys(res)

        for (let i = 0; i < resourcesKeys.length; i++) {
            let color = getResourceColor(resourcesKeys[i])
            for (let amount = 0; amount < res[resourcesKeys[i]]; amount++) {
                Renderer.rect(resourceInitialX - resourceWidth, resourceInitialY, resourceWidth, resourceHeight, {
                    fillStyle: color,
                    lineWidth: 0.5
                })
                resourceInitialX -= resourceWidth + resourceMargin
            }
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
                lineWidth: 1
            })
        } else {
            // Draw the card relative to 0, 0
            Renderer.roundedRect(
                0, 0, this.width!, this.height!, 12, {
                fillStyle: this.color,
                lineWidth: 1
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
                    fillStyle: 'yellow',
                    lineWidth: 1,
                    strokeStyle: 'rgb(226, 188, 116)'
                })
            }

            { // Draw the resources
                const resourceInitialX = 95 * percent;
                const resourceInitialY = 5 * percent;
                const resourceWidth = 10 * percent
                const resourceMargin = 2 * percent
                this.renderResources(this.resources, resourceInitialX, resourceInitialY, resourceWidth, resourceWidth, resourceMargin)

            }
            { // Draw the conditions
                let resourceInitialX = 90 * percent;
                const resourceInitialY = 50 * percent
                const resourceWidth = 6 * percent
                const resourceMargin = 2 * percent
                this.renderResources(this.conditions, resourceInitialX, resourceInitialY, resourceWidth, resourceWidth, resourceMargin)
            }
            // Render the points
            ctx.translate(60 * percent, 60 * percent)
            this.points.render(30 * percent, 30 * percent)
        } // !isHided
        ctx.restore()
    }
}

const CARDS = [
    new Card(7, Color.Red, { ananas: 1, bull: 1 }, {}, new NoPoint()),
    new Card(14, Color.Red, { ananas: 1 }, {}, new NightPoint(2)),
    new Card(26, Color.Red, { bull: 1 }, {}, new ResourcePoints(ResourcesName.Ananas, 3)),
    new Card(38, Color.Green, { blues: 1 }, { ananas: 1, bull: 1 }, new SanctuaryPoints(3)),
    new Card(39, Color.Red, { ananas: 1, blues: 1 }, { bull: 2 }, new StaticPoints(9)),
    new Card(44, Color.Yellow, {}, { blues: 1, ananas: 1 }, new ColorsPoint(2, [Color.Yellow, Color.Blue])),
    new Card(45, Color.Green, { blues: 1 }, { bull: 3 }, new StaticPoints(13)),
    new Card(46, Color.Blue, {}, { bull: 1, blues: 2 }, new StaticPoints(10), true),
    new Card(47, Color.Yellow, {}, { ananas: 1, bull: 1 }, new ColorsPoint(2, [Color.Yellow, Color.Red])),
    new Card(48, Color.Blue, {}, { blues: 2, bull: 1 }, new StaticPoints(10), true),
    new Card(49, Color.Blue, {}, { blues: 2, ananas: 1 }, new StaticPoints(12), true),
    new Card(53, Color.Yellow, { bull: 1 }, { ananas: 2 }, new ColorsPoint(4, [Color.Red])),
    new Card(54, Color.Green, { bull: 1 }, { ananas: 2 }, new SanctuaryPoints(4)),
    new Card(58, Color.Green, {}, { bull: 3 }, new SanctuaryPoints(3), true),
    new Card(61, Color.Green, { ananas: 1 }, { bull: 4 }, new StaticPoints(17)),

    // Sample data
    new Card(7, Color.Red, { ananas: 1, bull: 1 }, {}, new NoPoint()),
    new Card(14, Color.Red, { ananas: 1 }, {}, new NightPoint(2)),
    new Card(26, Color.Red, { bull: 1 }, {}, new ResourcePoints(ResourcesName.Ananas, 3)),
    new Card(38, Color.Green, { blues: 1 }, { ananas: 1, bull: 1 }, new SanctuaryPoints(3)),
    new Card(39, Color.Red, { ananas: 1, blues: 1 }, { bull: 2 }, new StaticPoints(9)),
    new Card(44, Color.Yellow, {}, { blues: 1, ananas: 1 }, new ColorsPoint(2, [Color.Yellow, Color.Blue])),
    new Card(45, Color.Green, { blues: 1 }, { bull: 3 }, new StaticPoints(13)),
    new Card(46, Color.Blue, {}, { bull: 1, blues: 2 }, new StaticPoints(10), true),
    new Card(47, Color.Yellow, {}, { ananas: 1, bull: 1 }, new ColorsPoint(2, [Color.Yellow, Color.Red])),
    new Card(48, Color.Blue, {}, { blues: 2, bull: 1 }, new StaticPoints(10), true),
    new Card(49, Color.Blue, {}, { blues: 2, ananas: 1 }, new StaticPoints(12), true),
    new Card(53, Color.Yellow, { bull: 1 }, { ananas: 2 }, new ColorsPoint(4, [Color.Red])),
    new Card(54, Color.Green, { bull: 1 }, { ananas: 2 }, new SanctuaryPoints(4)),
    new Card(58, Color.Green, {}, { bull: 3 }, new SanctuaryPoints(3), true),
    new Card(61, Color.Green, { ananas: 1 }, { bull: 4 }, new StaticPoints(17)),
    new Card(7, Color.Red, { ananas: 1, bull: 1 }, {}, new NoPoint()),
    new Card(14, Color.Red, { ananas: 1 }, {}, new NightPoint(2)),
    new Card(26, Color.Red, { bull: 1 }, {}, new ResourcePoints(ResourcesName.Ananas, 3)),
    new Card(38, Color.Green, { blues: 1 }, { ananas: 1, bull: 1 }, new SanctuaryPoints(3)),
    new Card(39, Color.Red, { ananas: 1, blues: 1 }, { bull: 2 }, new StaticPoints(9)),
    new Card(44, Color.Yellow, {}, { blues: 1, ananas: 1 }, new ColorsPoint(2, [Color.Yellow, Color.Blue])),
    new Card(45, Color.Green, { blues: 1 }, { bull: 3 }, new StaticPoints(13)),
    new Card(46, Color.Blue, {}, { bull: 1, blues: 2 }, new StaticPoints(10), true),
    new Card(47, Color.Yellow, {}, { ananas: 1, bull: 1 }, new ColorsPoint(2, [Color.Yellow, Color.Red])),
    new Card(48, Color.Blue, {}, { blues: 2, bull: 1 }, new StaticPoints(10), true),
    new Card(49, Color.Blue, {}, { blues: 2, ananas: 1 }, new StaticPoints(12), true),
    new Card(53, Color.Yellow, { bull: 1 }, { ananas: 2 }, new ColorsPoint(4, [Color.Red])),
    new Card(54, Color.Green, { bull: 1 }, { ananas: 2 }, new SanctuaryPoints(4)),
    new Card(58, Color.Green, {}, { bull: 3 }, new SanctuaryPoints(3), true),
    new Card(61, Color.Green, { ananas: 1 }, { bull: 4 }, new StaticPoints(17)),
    new Card(7, Color.Red, { ananas: 1, bull: 1 }, {}, new NoPoint()),
    new Card(14, Color.Red, { ananas: 1 }, {}, new NightPoint(2)),
    new Card(26, Color.Red, { bull: 1 }, {}, new ResourcePoints(ResourcesName.Ananas, 3)),
    new Card(38, Color.Green, { blues: 1 }, { ananas: 1, bull: 1 }, new SanctuaryPoints(3)),
    new Card(39, Color.Red, { ananas: 1, blues: 1 }, { bull: 2 }, new StaticPoints(9)),
    new Card(44, Color.Yellow, {}, { blues: 1, ananas: 1 }, new ColorsPoint(2, [Color.Yellow, Color.Blue])),
    new Card(45, Color.Green, { blues: 1 }, { bull: 3 }, new StaticPoints(13)),
    new Card(46, Color.Blue, {}, { bull: 1, blues: 2 }, new StaticPoints(10), true),
    new Card(47, Color.Yellow, {}, { ananas: 1, bull: 1 }, new ColorsPoint(2, [Color.Yellow, Color.Red])),
    new Card(48, Color.Blue, {}, { blues: 2, bull: 1 }, new StaticPoints(10), true),
    new Card(49, Color.Blue, {}, { blues: 2, ananas: 1 }, new StaticPoints(12), true),
    new Card(53, Color.Yellow, { bull: 1 }, { ananas: 2 }, new ColorsPoint(4, [Color.Red])),
    new Card(54, Color.Green, { bull: 1 }, { ananas: 2 }, new SanctuaryPoints(4)),
    new Card(58, Color.Green, {}, { bull: 3 }, new SanctuaryPoints(3), true),
    new Card(61, Color.Green, { ananas: 1 }, { bull: 4 }, new StaticPoints(17)),

]



export {
    Card,
    CARDS,
}
