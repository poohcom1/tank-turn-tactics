
class ActionPopup extends Driver.ActiveComponent {
    constructor(text, xOffset, textAlign, state, color = '#fcda6d') {
        super();

        this.userTank = userTank
        this.show = false;
        this.hover = false;
        this.selected = false;

        this.yLevel = 75;
        this.yOffset = 10;
        this.xOffset = xOffset;
        this.height = 20;
        this.color = color

        this.text = text;
        this.textAlign = textAlign;
        this.state = state;

        this.font = `${ this.height }px Uni-Sans`;

        this.bounds = null;
    }

    hide() {
        this.show = false;
        this.hover = false;
        this.selected = false;
    }

    update(driver) {
        this.show = selectedTank.player.user_id === USER_PLAYER.user_id && actionState === ACTION_STATES.BUTTONS;

        if (!this.show) return;

        const ctx = driver.canvas_ctx;

        ctx.textAlign = this.textAlign
        ctx.font = this.font

        this.bounds = {
            x: userTank.x + this.xOffset + userTank.width / 2 - ctx.measureText(this.text).actualBoundingBoxLeft - 10,
            y: userTank.y + this.yLevel - this.yOffset,
            width: ctx.measureText(this.text).width + 18,
            height: this.height + this.yOffset * 2
        }

        this.hover = inBounds(driver.mouse_events, this.bounds)

        if (this.hover && driver.mouse_events.pressed) {
            actionState = this.state;
            actionGuis.forEach(a => a.init())
            this.hover = false;
            driver.mouse_events.pressed = false;
            resetUpgrades()
        }
    }

    redraw(driver) {
        if (!this.show) return;
        const ctx = driver.canvas_ctx;

        const x = userTank.x + this.xOffset + userTank.width / 2;
        const y = userTank.y + this.yLevel;

        ctx.textAlign = this.textAlign
        ctx.textBaseline = 'hanging'
        ctx.font = this.font

        ctx.fillStyle = 'rgba(0,0,0,0.47)'
        ctx.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height)

        if (this.hover) {
            ctx.strokeStyle = this.color
            ctx.strokeText(this.text, x, y)
        }

        ctx.fillStyle = 'white'
        ctx.fillText(this.text, x, y)
    }
}
