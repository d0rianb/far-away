import { Card, Color, ColorsPoint, NoPoint, PointType, Resources } from "./card";

class Sanctuary extends Card {
    constructor(color: Color, resources: Resources, points: PointType, hasSancturay: boolean = false, isNight: boolean = false) {
        super(-1, color, resources, {}, points, hasSancturay)
        this.isNight = isNight
    }

}

const SANCTUARIES = [
    new Sanctuary(Color.None, { ananas: 1 }, new NoPoint(), true),
    new Sanctuary(Color.None, { ananas: 1 }, new NoPoint(), false, true),
    new Sanctuary(Color.None, {}, new ColorsPoint(1, [Color.Red, Color.Blue])),
    new Sanctuary(Color.Red, {}, new ColorsPoint(1, [Color.Red]))
]

export { Sanctuary, SANCTUARIES }
