
class Tank extends Driver.ActiveComponent {
    static animInd = 0
    static count = 0
    
    constructor(player) {
        super();
        this.player = player
        this.box = this.player.box

        this.move(player.position)

        Tank.count++;
    }


    move(pos) {
        this.box = grid[pos.x][pos.y];

        this.x = this.box.x;
        this.y = this.box.y;
        this.width = this.box.width;
        this.height = this.box.height;
    }

    update(driver) {
        // Animation

        if (rangeMode === RANGE_MODES.SQUARE) {
            Tank.animInd += 1/Tank.count;
            if (Tank.animInd > 2*(game.size.width + game.size.height)) Tank.animInd = 0;
        }

        // On tank selected
        if (driver.mouse_events.pressed
            && inBounds(driver.mouse_events, this)
            && (actionState === ACTION_STATES.SELECT || actionState === ACTION_STATES.BUTTONS)
            && !gameOver) {

            if (actionState === ACTION_STATES.BUTTONS && actionPopups.some(a => a.hover)) return;

            // Enable/disable upgrades
            if (selectedTank === userTank) {
                enableUpgrades()

                // Toggle
                if (actionState === ACTION_STATES.BUTTONS) {
                    actionState = ACTION_STATES.SELECT
                } else {
                    actionState = ACTION_STATES.BUTTONS
                }

            } else {
                disableUpgrades()
            }

            // Set true if just switched to player
            if (selectedTank !== userTank && this === userTank) {
                actionState = ACTION_STATES.BUTTONS
            }

            if (USER_PLAYER.actions <= 0 || reFetching) actionState = ACTION_STATES.SELECT

            selectedTank = this;

            updateInfo()

            driver.mouse_events.down = false
        }


        if (driver.key_pressed['Escape'] && this === userTank) {
            if (justCancelledActionsGui) {
                justCancelledActionsGui = false
            } else if (actionState === ACTION_STATES.BUTTONS) {
                actionState = ACTION_STATES.SELECT
            }
        }


        if (USER_PLAYER.actions <= 0) {
            actionState = ACTION_STATES.SELECT
        }
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {string} color
     */
    drawTriangle(ctx, color) {
        const padding = this.width / 6;
        const center = { x: this.x + this.width / 2, y: this.y + padding };
        const left = { x: this.x + padding, y: this.y + this.height - padding }
        const right = { x: this.x + this.width - padding, y: this.y + this.height - padding }

        ctx.shadowColor = 'white'
        ctx.shadowBlur = 2;

        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(right.x, right.y)
        ctx.lineTo(left.x, left.y)
        ctx.lineTo(center.x, center.y)
        ctx.closePath();
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.setLineDash([])
        ctx.stroke();
        ctx.lineWidth = 1

        ctx.shadowBlur = 0;
    }

    redraw(driver) {
        const ctx = driver.canvas_ctx;
        let color = this.player.color
        if (!color) {
            color = this.player.user_id === game.user_id ? '#00ffc3' : 'rgb(255,65,65)'
        }
        if (color)

        ctx.shadowColor = 'white'
        ctx.shadowBlur = 5

        this.drawTriangle(ctx, color)

        // Render name

        ctx.fillStyle = selectedTank === this ? 'white' : 'rgba(255,255,255,0.45)'
        ctx.textAlign = 'center'
        ctx.fillText(this.player.name, this.x + this.width / 2, this.y + this.height + 12)
        ctx.fillText(this.player.health, this.x + this.width / 2, this.y - 10)

        if (gameOver) return;

        if (selectedTank === this && (actionState === ACTION_STATES.SELECT || actionState === ACTION_STATES.BUTTONS)) {
            // Selection lines
            ctx.beginPath();
            ctx.moveTo(GRID_PADDING, this.y + this.height / 2)
            ctx.lineTo(this.x, this.y + this.height / 2)
            ctx.moveTo(this.x + this.width, this.y + this.height / 2)
            ctx.lineTo(gameDim.width - RIGHT_PADDING, this.y + this.height / 2)

            ctx.moveTo(this.x + this.width / 2, GRID_PADDING)
            ctx.lineTo(this.x + this.width / 2, this.y)
            ctx.moveTo(this.x + this.width / 2, this.y + this.height)
            ctx.lineTo(this.x + this.width / 2, gameDim.height - FOOTER_PADDING)
            ctx.setLineDash([])
            ctx.strokeStyle = 'rgba(14,255,229,0.55)'
            ctx.stroke()
        }

        let isMoving = false;

        if (selectedTank === this || actionState === ACTION_STATES.MV || rangeDisplay === RANGE_DISPLAY.ALL) {
            let center = this

            if (actionState === ACTION_STATES.MV && this === userTank) {
                center = hoveredBox
                isMoving = true;
            }

            if (actionState === ACTION_STATES.SELECT || actionState === ACTION_STATES.BUTTONS || actionState === ACTION_STATES.MV || actionState === ACTION_STATES.ATK) {
                let color;

                if (this.player === USER_PLAYER) {
                    if (actionState === ACTION_STATES.ATK) {
                        if (attackGui.selectedTarget) {
                            color = c_atkMarkedTarget
                        } else {
                            color = c_atkTarget
                        }
                    } else {
                        color = this.player.color
                    }
                } else {
                    color = this.player.color
                }

                if (actionState === ACTION_STATES.MV) {
                    color = "rgba(255,255,255,0.19)"
                }

                if (rangeMode === RANGE_MODES.CIRCLE) {
                    this.drawCircleRange(ctx, this.player.range , color, [15, 10], center)
                } else {
                    if (!isMoving)
                        this.drawSquareRange(ctx, this.player.range, this.player.color)
                }
            }

            if (actionState === ACTION_STATES.SELECT || actionState === ACTION_STATES.BUTTONS || actionState === ACTION_STATES.GV) {
                // Give range
                if (game.giveRangeOffset && game.giveRangeOffset >= 0) {
                    if (rangeMode === RANGE_MODES.CIRCLE) {
                        this.drawCircleRange(ctx, this.player.range + game.giveRangeOffset, "rgba(88,255,81,0.16)", [5, 2])
                    } else {
                        // this.drawSquareRange(ctx, this.player.range, this.player.color + game.giveRangeOffset)
                    }
                }
            }

            ctx.shadowBlur = 0
        }
    }

    /**
     *
     * @param ctx
     * @param radius
     * @param color
     * @param dash
     * @param center
     */
    drawCircleRange(ctx, radius, color, dash, center = this.x) {
        ctx.beginPath()
        ctx.arc(center.x + this.width / 2, center.y + this.height / 2, radius * this.width + this.width / 2, 0, 2 * Math.PI)
        ctx.strokeStyle = color
        ctx.setLineDash(dash)
        ctx.stroke()
    }

    drawSquareRange(ctx, range, color, centerCoords = this.player.position) {
        const startX = Math.max(centerCoords.x - range, 0);
        const endX = Math.min(centerCoords.x + range + 1, game.size.width)

        const startY = Math.max(centerCoords.y - range, 0);
        const endY = Math.min(centerCoords.y + range + 1, game.size.height)

        for (let x = startX, i = 0; x < endX; x++, i++) {
            for (let y = startY, j = 0; y < endY; y++, j++) {
                if (inRange(this.player.position, { x, y }, range)) {
                    let index = Tank.animInd

                    index += x + y
                    if (index > (game.size.width + game.size.height)) {
                        index = 2 * (game.size.width + game.size.height) - index
                    }

                    if (index < 0) {
                        index = -index
                    }

                    const brightnessPercent = (index)/(game.size.width + game.size.height)

                    const MAX_BRIGHTNESS = 100;
                    const BRIGHTNESS_OFFSET = 15
                    const brightness = Math.floor(brightnessPercent * MAX_BRIGHTNESS) + BRIGHTNESS_OFFSET;

                    ctx.fillStyle = color + brightness.toString(16).padStart(2, '0')

                    const pos = grid[x][y]
                    ctx.fillRect(pos.x, pos.y, GRID_SIZE, GRID_SIZE)
                }
            }
        }
    }
}

