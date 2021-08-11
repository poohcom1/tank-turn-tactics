class TargetGui {
    constructor(actionState, color, upperCountLimit, rangeOffset = 0) {
        /**
         * @type {Tank[]}
         */
        this.targets = [];
        this.hoverOnSelectedTarget = false;
        this.confirming = false;

        this.count = 1;

        this.actionState = actionState;
        this.rangeOffset = rangeOffset
        this.color = color

        this.upperCountLimit = upperCountLimit;

        if (userTank)
            this.init();
    }

    init() {
        let playersToMark = game.players

        if (this.rangeOffset >= 0) {
            playersToMark = playersToMark.filter(player => inRange(userTank.box.coords, player.position, USER_PLAYER.range + this.rangeOffset))
        }

        this.targets = playersToMark.filter(p => p !== USER_PLAYER).map(player => tankDriver.components.find(t => coordsEquals(t.box.coords, player.position)))


        /**
         * @type {Tank}
         */
        this.selectedTarget = null;

        this.count = 1;
    }

    confirm() {
        console.log("Sending " + this.actionState)
        reFetching = true;
        selectedTank === userTank
        fetch(`/action/${ game._id }/${ this.actionState }/${ this.selectedTarget.player._id }/actions/${ this.count }`, { method: 'POST' })
            .then(() => {
                console.log("Success")
            })
            .catch(e => {
                console.log(e)
            })
            .finally(() => {
                refetch()
                this.cancel()

            })
    }

    cancel() {
        this.confirming = false;
        Driver.overrideMouse = false;

        this.init();
        updateInfo()

        actionState = ACTION_STATES.BUTTONS
        justCancelledActionsGui = true;
    }

    update(driver) {
        if (actionState === this.actionState) Driver.overrideMouse = this.hoverOnSelectedTarget;

        if (this.selectedTarget && this.hoverOnSelectedTarget) {
            if (driver.mouse_events.scrollUp && this.count < USER_PLAYER.actions && this.upperCountLimit(this.count)) {
                this.count++;
            } else if (driver.mouse_events.scrollDown && this.count > 1) {
                this.count--;
            }
        }
    }

    markTargets(ctx, box, color) {
    }

    redraw(driver) {
        if (actionState !== this.actionState) return;
        const ctx = driver.canvas_ctx;

        this.targets.forEach(t => {
            if (this.selectedTarget && t === this.selectedTarget) {
                this.markTargets(ctx, t.box, this.color)
                ctx.fillStyle = this.color
                ctx.textBaseline = 'top'
                ctx.textAlign = 'center'

                ctx.font = '15px Hollow'
                ctx.fillText(this.count, center(t.box).x, t.box.y - GRID_SIZE * 3 / 4)
            } else {
                this.markTargets(ctx, t.box)
            }
        })
    }
}
