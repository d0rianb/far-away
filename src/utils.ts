export function shuffle<T>(array: Array<T>) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}

export function all<T>(arr: Array<T>, predicate: ((val: T) => boolean)): boolean {
    return arr.filter(predicate).length == arr.length
}
