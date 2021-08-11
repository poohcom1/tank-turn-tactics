
class GridBox extends Driver.PassiveComponent {
    constructor(coords, x, y, width, height, color) {
        super();
        this.borderColor = color;

        this.coords = coords;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    onMouseEvent = (driver, e) => {
        if (gameOver) {
            hoveredBox = { x: -100, y: -100, coords: { x: -1, y: -1 } }
        }

        let mouseX = e.offsetX;
        let mouseY = e.offsetY

        if (inBounds({ x: mouseX, y: mouseY }, this)) {
            hoveredBox = this;
        }
    }

    redraw = driver => {
        const ctx = driver.canvas_ctx;
        ctx.lineWidth = 1;
        ctx.strokeStyle = this.borderColor
        ctx.strokeRect(this.x, this.y, this.width, this.height)
    }
}
