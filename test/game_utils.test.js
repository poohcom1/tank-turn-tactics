const { assignLocation } = require('../libs/game_utils.js')

describe("game_utils", () => {
    describe("assignLocation", () => {
        it("should assign random, unique coordinates", () => {
            const count = 1000;
            const size = {
                width: 200,
                height: 200
            }

            const locations = assignLocation(count, size);

            expect(Array.isArray(locations) && new Set(locations).size === locations.length).toBeTruthy()
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