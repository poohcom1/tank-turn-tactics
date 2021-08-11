class GiveGui extends TargetGui {
    constructor() {
        super(ACTION_STATES.GV, c_giveLine, () => true, game.giveRangeOffset);
    }


    update(driver) {
        super.update(driver)
        if (actionState !== this.actionState) return;
        if (this.confirming) {
            updateHint("Support", "Awaiting response", '.', c_giveLine)
            return;
        }

        updateInfo()

        deltaActions = 0

        if (driver.key_pressed["Escape"]) this.cancel()

        const SUPPORT = {
            CANCEL: -2,
            NONE: -1,
            HOVER: 0,
            ATTACK: 1
        }

        let supportState = SUPPORT.NONE

        const hoverTarget = this.targets.find(t => hoveredBox === t.box)

        this.hoverOnSelectedTarget = false;
        if (hoveredBox === userTank.box) {
            updateHint("Support", "Click to cancel")
            supportState = SUPPORT.CANCEL
        } else if (!this.selectedTarget) {
            if (hoverTarget) {
                updateHint("Support", "Click to select recipient")
                supportState = SUPPORT.HOVER
            } else {
                updateHint("Support", "Click on a tank to set as recipient", "Press escape to cancel")
            }
        } else {
            if (this.selectedTarget === hoverTarget) {
                updateHint("Support", "Click to send energy points. Scroll to adjust amount", "Press escape to cancel", c_giveLine)
                this.hoverOnSelectedTarget = true;
                deltaActions = this.count
                updateInfo()
                supportState = SUPPORT.ATTACK
            } else {
                updateHint("Support", "Click to deselect recipient")
                supportState = SUPPORT.NONE
            }
        }


        if (driver.mouse_events.pressed) {
            switch (supportState) {
                case SUPPORT.CANCEL:
                    this.cancel();
                    break;
                case SUPPORT.NONE:
                    this.selectedTarget = null
                    break;
                case SUPPORT.HOVER:
                    this.selectedTarget = hoverTarget;
                    break;
                case SUPPORT.ATTACK:
                    this.confirm();
                    this.confirming = true;
                    document.body.className = 'waiting'
                    break;
                default:
            }
        }
    }

    markTargets(ctx, box, color = 'white') {
        if (this.confirming) {
            ctx.fillStyle = c_giveConfirming
            ctx.fillRect(box.x, box.y, box.width, box.height)
            return;
        }
        ctx.strokeStyle = color;
        ctx.shadowColor = 'white'
        ctx.shadowBlur = 3

        const innerRadius = 5;
        const outerRadius = 17;

        ctx.beginPath()
        ctx.arc(center(box).x, center(box).y, innerRadius, 0, 2 * Math.PI)
        ctx.closePath();
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(center(box).x, center(box).y, outerRadius, 0, 2 * Math.PI)
        ctx.stroke()


        ctx.shadowBlur = 0
    }

}
