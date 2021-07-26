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
        coords.add({x: width, y: height})
    }

    return Array.from(coords);
}