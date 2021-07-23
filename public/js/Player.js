
export default class Player {
    /**
     * @param {string} name
     * @param {number} health
     * @param {number} action
     * @param {number} range
     */
    constructor(name, health, action, range) {
        this.name = name;
        this.health = health;
        this.action = action;
        this.range = range;
    }

    /**
     * Is dead
     * @return {boolean}
     */
    isDead() {
        return this.health <= 0
    }
}