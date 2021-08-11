class AttackGui extends TargetGui {
    constructor() {
        super(ACTION_STATES.ATK, c_atkMarkedTarget, count => count < this.selectedTarget.player.health);
    }

    update(driver) {
        super.update(driver)
        if (actionState !== this.actionState || !USER_PLAYER) return;
        if (this.confirming) {
            updateHint("Attack", "Engaging...", ".", c_atkMarkedTarget)
            return
        }

        updateInfo()

        deltaActions = 0

        if (driver.key_pressed["Escape"]) this.cancel()

        const ATTACK = {
            CANCEL: -2,
            NONE: -1,
            HOVER: 0,
            ATTACK: 1
        }

        let attackState = ATTACK.NONE

        const hoverTarget = this.targets.find(t => hoveredBox === t.box)

        this.hoverOnSelectedTarget = false;
        if (hoveredBox === userTank.box) {
            updateHint("Attack", "Click to cancel")
            attackState = ATTACK.CANCEL
        } else if (!this.selectedTarget) {
            if (hoverTarget) {

                updateHint("Attack", "Click to mark target", "Press escape to cancel")
                attackState = ATTACK.HOVER

            } else {
                updateHint("Attack", "Click on a tank to mark as target", "Press escape to cancel")
            }
        } else {
            if (this.selectedTarget === hoverTarget) {
                updateHint("Attack", "Click to commence attack on " + this.selectedTarget.player.name + ". Scroll to adjust power", "Press escape to cancel", c_atkMarkedTarget)
                this.hoverOnSelectedTarget = true;
                deltaActions = this.count
                updateInfo()
                attackState = ATTACK.ATTACK
            } else {
                updateHint("Attack", "Click to remove mark", "Press escape to cancel")
                attackState = ATTACK.NONE
            }
        }


        if (driver.mouse_events.pressed) {
            switch (attackState) {
                case ATTACK.CANCEL:
                    this.cancel()
                    break;
                case ATTACK.NONE:
                    this.selectedTarget = null
                    break;
                case ATTACK.HOVER:
                    this.selectedTarget = hoverTarget;
                    break;
                case ATTACK.ATTACK:
                    this.confirm();
                    this.confirming = true;
                    document.body.className = 'waiting'
                    break;
                default:
            }
        }
    }

    markTargets(ctx, box, color = c_atkTarget) {
        if (this.confirming) {
            ctx.fillStyle = c_atkConfirming
            ctx.fillRect(box.x, box.y, box.width, box.height)
            return;
        }

        ctx.strokeStyle = color;
        ctx.shadowColor = 'white'
        ctx.shadowBlur = 3

        const innerRadius = 5;
        const outerRadius = 17;
        const lineLength = 5;

        ctx.beginPath()
        ctx.arc(center(box).x, center(box).y, innerRadius, 0, 2 * Math.PI)
        ctx.closePath();
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(center(box).x, center(box).y, outerRadius, -Math.PI / 4, Math.PI / 4)
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(center(box).x, center(box).y, outerRadius, Math.PI * 3 / 4, -Math.PI * 3 / 4)
        ctx.stroke()

        ctx.moveTo(center(box).x, center(box).y + outerRadius)
        ctx.lineTo(center(box).x, center(box).y + outerRadius + lineLength)
        ctx.moveTo(center(box).x, center(box).y - outerRadius)
        ctx.lineTo(center(box).x, center(box).y - outerRadius - lineLength)

        ctx.moveTo(center(box).x + outerRadius, center(box).y)
        ctx.lineTo(center(box).x + outerRadius + lineLength, center(box).y)
        ctx.moveTo(center(box).x - outerRadius, center(box).y)
        ctx.lineTo(center(box).x - outerRadius - lineLength, center(box).y)
        ctx.stroke()

        ctx.shadowBlur = 0
    }
}
