const { assignLocation } = require('../libs/game_utils.js')

describe("game_utils", () => {
    describe("assignLocation", () => {
        it("should assign random, unique coordinates", () => {
            const count = 1000;
            const size = {
                width: 200,
                height: 200
            }

            // Using stringify to make Set work with objects
            const locations = assignLocation(count, size).map(location => JSON.stringify(location));

            expect(new Set(locations).size).toBe(locations.length)
        })

        it("should assign coordinates within the given bounds", () => {
            const count = 1000;
            const size = {
                width: 200,
                height: 200
            }

            const locations = assignLocation(count, size);

            expect(locations.every(location => location.x >= 0 && location.y >= 0
                && location.x <= size.width && location.y <= size.height)).toBeTruthy()
        })
    })

})