class SelectionSquare extends Driver.ActiveComponent {
    constructor() {
        super();
        this.animationIndex = 0;
    }

    update = driver => {
        this.x = hoveredBox.x;
        this.y = hoveredBox.y;
        this.width = GRID_SIZE;
        this.height = GRID_SIZE;

        this.animationIndex += 0.5;
        if (this.animationIndex >= 20) this.animationIndex = 0

        if (actionState === ACTION_STATES.SELECT || actionState === ACTION_STATES.BUTTONS) updateHint("Coordinate:", `${ getChar(hoveredBox.coords.x) }${ hoveredBox.coords.y + 1 }`)

    }

    redraw = driver => {
        if (actionPopups.some(a => a.hover)) return

        const ctx = driver.canvas_ctx;

        ctx.beginPath()
        if (this.animationIndex < 10) {
            ctx.moveTo(this.x, this.y)
            ctx.lineTo(this.x + (this.width / 10) * this.animationIndex, this.y)

            ctx.moveTo(this.x + this.width, this.y + this.height)
            ctx.lineTo(this.x - (this.width / 10) * this.animationIndex + this.width, this.y + this.height)

            // y
            ctx.moveTo(this.x + this.width, this.y + (this.height / 10) * (this.animationIndex))
            ctx.lineTo(this.x + this.width, this.y + this.height)

            ctx.moveTo(this.x, this.y + this.height - (this.width / 10) * (this.animationIndex))
            ctx.lineTo(this.x, this.y)
        } else {
            ctx.moveTo(this.x + (this.width / 10) * (this.animationIndex - 10), this.y)
            ctx.lineTo(this.x + this.width, this.y)

            ctx.moveTo(this.x + this.width - (this.width / 10) * (this.animationIndex - 10), this.y + this.height)
            ctx.lineTo(this.x, this.y + this.height)

            // y
            ctx.moveTo(this.x + this.width, this.y)
            ctx.lineTo(this.x + this.width, this.y + (this.height / 10) * (this.animationIndex - 10))

            ctx.moveTo(this.x, this.y + this.height)
            ctx.lineTo(this.x, this.y + this.height - (this.height / 10) * (this.animationIndex - 10))
        }

        disableUpgrades()

        ctx.lineWidth = 2;
        switch (actionState) {
            case ACTION_STATES.MV:
                ctx.strokeStyle = c_moveLine
                break;
            case ACTION_STATES.ATK:
                if (attackGui.selectedTarget && attackGui.hoverOnSelectedTarget) {
                    ctx.strokeStyle = c_atkMarkedTarget
                } else {
                    ctx.strokeStyle = c_atkTarget
                }
                break;
            case ACTION_STATES.GV:
                ctx.strokeStyle = c_giveLine
                break;
            default:
                ctx.strokeStyle = 'white'
                if (selectedTank === userTank) {
                    if (hoveredBox === userTank.box) {
                        if (USER_PLAYER.actions > 0) {
                            updateHint("Control", "Click to toggle controls")
                        } else {
                            updateHint("Control", "Out of energy!", '.', 'red')
                            actionState = ACTION_STATES.SELECT
                        }
                    }

                    if (!gameOver) enableUpgrades()
                }
        }

        ctx.stroke()
    }
}
