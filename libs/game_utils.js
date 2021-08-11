/**
 *
 * @param {number} count
 * @param {Object} size
 * @param {number} size.width
 * @param {number} size.height
 * @param {{x: number, y: number}[]} takenLocations
 * @return {{x: number, y: number}[]}
 */
module.exports.assignLocation = function (count, size, takenLocations=[]) {
    const takenLocationStrings = takenLocations.map(p => JSON.stringify(p))
    let coords = new Set(takenLocationStrings);

    while (coords.size < count + takenLocationStrings.length) {
        const width = Math.floor(Math.random() * size.width);
        const height = Math.floor(Math.random() * size.height);
        coords.add(JSON.stringify({x: width, y: height})) // Stringify to bypass object shallow equality
    }

    let coordsArray = Array.from(coords)
    coordsArray = coordsArray.slice(takenLocationStrings.length, coords.size)

    // Reconvert set to array and parse json
    return coordsArray.map(strObjects => JSON.parse(strObjects));
}

/**
 * Must match the function in public/js/game-engine/Game.js
 * @param position
 * @param target
 * @param range
 * @return {boolean}
 */
module.exports.checkRange = function (position, target, range) {
    return Math.sqrt(Math.pow(target.x - position.x, 2) + Math.pow(target.y - position.y, 2)) <= range;
}

module.exports.checkGrid = function (position, game) {
    return position.x >= 0 && position.y >= 0 && position.x < game.size.width && position.y < game.size.height
}