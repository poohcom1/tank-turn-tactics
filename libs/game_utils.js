/**
 *
 * @param {number} count
 * @param {Object} size
 * @param {number} size.width
 * @param {number} size.height
 * @return {{x: number, y: number}[]}
 */
module.exports.assignLocation = function assignLocation(count, size) {
    let coords = new Set();

    while (coords.size < count) {
        const width = Math.floor(Math.random() * size.width);
        const height = Math.floor(Math.random() * size.height);
        coords.add(JSON.stringify({x: width, y: height})) // Stringify to bypass object shallow equality
    }

    // Reconvert set to array and parse json
    return Array.from(coords).map(strObjects => JSON.parse(strObjects));
}

