
// Move gui
class MoveGui extends Driver.ActiveComponent {
    constructor() {
        super();

        this.confirming = false;

        if (userTank)
            this.init()
    }

    init() {
        this.boxes = [ userTank.box ]; // Path from selected grid
        this.hintBoxes = [ userTank.box ]; // Show path on hover

        this.destinations = [] // Stop points of selected grid
    }

    confirmMove() {
        if (this.confirming) return;
        actionState = ACTION_STATES.BUTTONS

        // Remove first position (which is the player's current position)
        const positions = this.boxes.slice(1, this.boxes.length).map(box => box.coords)

        USER_PLAYER.position = positions[positions.length - 1]
        userTank.move(positions[positions.length - 1])

        this.init()
        this.confirming = true;


        fetch(`/action/${ game._id }/move`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ positions: positions })
        })
            .then(() => {
                console.log("Success!")
                refetch()
                this.init()
                this.confirming = false;
                actionState = ACTION_STATES.BUTTONS
            })
    }

    cancel() {
        deltaActions = 0

        this.init()
        updateInfo()
        actionState = ACTION_STATES.BUTTONS
        justCancelledActionsGui = true;
    }

    getCurrentBox = () => this.boxes[this.boxes.length - 1]

    update(driver) {
        if (actionState !== ACTION_STATES.MV) return;

        if (this.confirming) return;

        if (driver.key_events["Escape"]) {
            this.cancel()
        }

        const MOVE = {
            CONFIRM: 0,
            REMOVE: 1,
            ADD: 2,
            RESET: 3,
            CANCEL: 4,
            COLLIDE: 5
        }

        let moveType;

        // Existing spot
        if (this.destinations.includes(hoveredBox)) {
            // Final spot
            if (this.destinations.indexOf(hoveredBox) === this.destinations.length - 1) {
                updateHint("Move", `[${ getChar(hoveredBox.coords.x) }${ hoveredBox.coords.y + 1 }] ` + "Press 'Enter' or click again to commit movement", "Press escape to cancel", c_moveLine)
                moveType = MOVE.CONFIRM
            } else {
                updateHint("Move", "Click to remove succeeding waypoints", "Press escape to cancel")
                moveType = MOVE.REMOVE
            }

            // Reset
        } else if (hoveredBox === userTank.box) {
            if (this.boxes.length === 1) {
                updateHint("Move", "Press 'Escape' or click to cancel movement")
                moveType = MOVE.CANCEL
            } else {
                updateHint("Move", "Click to remove succeeding waypoints", "Press escape to cancel")
                moveType = MOVE.RESET
            }
            // New spot
        } else {
            if (!game.players.find(player => coordsEquals(player.position, hoveredBox.coords))) {
                updateHint("Move", `[${ getChar(hoveredBox.coords.x) }${ hoveredBox.coords.y + 1 }] ` + "Click to add waypoint", "Press escape to cancel")
                moveType = MOVE.ADD;
            } else {
                updateHint("Move", "Can't move there!")
                moveType = MOVE.COLLIDE;
            }
        }


        if (driver.mouse_events.pressed || driver.key_pressed["Enter"]) {
            switch (moveType) {
                case MOVE.ADD:
                    // Parallel position
                    if (parallelCoords(this.getCurrentBox().coords, hoveredBox.coords)) {
                        getPath(this.getCurrentBox().coords, hoveredBox.coords).forEach(c => this.boxes.push(grid[c.x][c.y]))
                    } else {
                        // Elbow position
                        const elbowCoords = connectCoords(this.getCurrentBox().coords, hoveredBox.coords);

                        getPath(this.getCurrentBox().coords, elbowCoords).forEach(c => this.boxes.push(grid[c.x][c.y]))
                        getPath(elbowCoords, hoveredBox.coords).forEach(c => this.boxes.push(grid[c.x][c.y]))
                    }

                    // Overflow
                    if (this.boxes.length > USER_PLAYER.actions + 1) {
                        this.boxes = this.boxes.slice(0, USER_PLAYER.actions + 1)
                        if (this.boxes.length > 1)
                            this.destinations.push(this.getCurrentBox())
                    } else {
                        this.destinations.push(hoveredBox)
                    }
                    break;
                case MOVE.RESET:
                    this.init()
                    break;
                case MOVE.CANCEL:
                    this.cancel()
                    break;
                case MOVE.CONFIRM:
                    this.confirmMove();
                    break;
                case MOVE.REMOVE:
                    this.destinations = this.destinations.slice(0, this.destinations.indexOf(hoveredBox) + 1)
                    this.boxes = this.boxes.slice(0, this.boxes.indexOf(this.destinations[this.destinations.length - 1]) + 1)
                    if (this.destinations.length === 0) {
                        this.boxes = [ userTank.box ];
                    }
                    break;
            }

        }

        this.hintBoxes = [];

        const elbowCoords = connectCoords(this.getCurrentBox().coords, hoveredBox.coords);

        getPath(this.getCurrentBox().coords, elbowCoords).forEach(c => this.hintBoxes.push(grid[c.x][c.y]))
        getPath(elbowCoords, hoveredBox.coords).forEach(c => this.hintBoxes.push(grid[c.x][c.y]))
    }

    drawDest(ctx, box) {
        ctx.strokeStyle = 'white'
        ctx.strokeRect(box.x + GRID_SIZE / 4, box.y + GRID_SIZE / 4, box.width - GRID_SIZE / 2, box.height - GRID_SIZE / 2)
    }

    drawCancel(ctx, box) {
        ctx.strokeStyle = 'white'
        ctx.beginPath()
        ctx.moveTo(box.x + GRID_SIZE / 4, box.y + GRID_SIZE / 4)
        ctx.lineTo(box.x + GRID_SIZE / 4 + box.width - GRID_SIZE / 2, box.y + GRID_SIZE / 4 + box.height - GRID_SIZE / 2)
        ctx.moveTo(box.x + GRID_SIZE / 4, box.y + GRID_SIZE / 4 + box.height - GRID_SIZE / 2)
        ctx.lineTo(box.x + GRID_SIZE / 4 + box.width - GRID_SIZE / 2, box.y + GRID_SIZE / 4)

        ctx.stroke()
    }

    drawConfirm(ctx, box) {
        ctx.strokeStyle = c_moveLine
        ctx.beginPath()
        ctx.arc(center(box).x, center(box).y, GRID_SIZE / 4, 0, 2 * Math.PI)
        ctx.closePath()
        ctx.stroke()
    }

    redraw(driver) {
        if (actionState !== ACTION_STATES.MV) return;

        const ctx = driver.canvas_ctx;

        ctx.strokeStyle = '#ffffff'

        const path = [ ...this.boxes, ...this.hintBoxes ]

        let onDest = false;

        for (let i = 0; i < path.length; i++) {
            // Fill path boxes' color
            if (onDest || hoveredBox === userTank.box) {
                ctx.fillStyle = c_moveCancel
            } else if (game.players.find(player => coordsEquals(player.position, hoveredBox.coords))) {
                ctx.fillStyle = c_moveOutOfRange
            } else {
                ctx.fillStyle = i < USER_PLAYER.actions + 1 ? c_moveBlock : c_moveOutOfRange
            }

            ctx.fillRect(path[i].x, path[i].y, path[i].width, path[i].height)

            if (this.destinations.includes(path[i])) {
                // Draw marks for destinations
                if (onDest || hoveredBox === userTank.box) {
                    this.drawCancel(ctx, path[i])
                } else if (i === this.boxes.length - 1 && hoveredBox === this.destinations[this.destinations.length - 1]) {
                    this.drawConfirm(ctx, path[i]);
                } else {
                    this.drawDest(ctx, path[i]);
                }

                // If current box is the hovered box and it's not the final destination (in which we confirm instead of cancel)
                //  or its the first box
                if ((hoveredBox === path[i] && this.destinations.indexOf(path[i]) !== this.destinations.length - 1)
                    || hoveredBox === userTank.box) {
                    onDest = true;
                }
            }

            // Skip hover if cancelling
            if (onDest && i === this.boxes.length - 1) break;
        }

        const arrowHeadLength = 10

        // Mark targets
        const playerToMarks = game.players;

        if (game.giveRangeOffset && game.giveRangeOffset >= 0) {
            playerToMarks.filter(player => inRange(hoveredBox.coords, player.position, USER_PLAYER.range + game.giveRangeOffset))
        }

        const tanks = playerToMarks.filter(p => p !== USER_PLAYER).map(player => tankDriver.components.find(t => coordsEquals(t.box.coords, player.position)))

        tanks.forEach(tank => {
            if (tank.box === hoveredBox) return

            if (inRange(hoveredBox.coords, tank.box.coords, USER_PLAYER.range)) {
                ctx.strokeStyle = c_atkRange
            } else if (game.giveRangeOffset && inRange(hoveredBox.coords, tank.box.coords, USER_PLAYER.range + game.giveRangeOffset)) {
                ctx.strokeStyle = c_giveRange
            } else {
                return;
            }

            const angle = angleTo(hoveredBox, tank.box)
            const origin = vecToPoint(5, angle - Math.PI / 2)
            const arrowHead = vecToPoint(arrowHeadLength, angle - Math.PI / 2 - Math.PI / 4)

            ctx.beginPath()
            ctx.moveTo(center(hoveredBox).x + origin.x, center(hoveredBox).y + origin.y)
            ctx.lineTo(center(tank.box).x + origin.x, center(tank.box).y + origin.y)
            ctx.lineTo(center(tank.box).x + origin.x + arrowHead.x, center(tank.box).y + origin.y + arrowHead.y)
            ctx.stroke();
        })

        // Enemy range warning
        game.players
            .forEach(p => {
                if (p._id === USER_PLAYER._id) return;
                const tank = tankDriver.components.find(t => coordsEquals(t.box.coords, p.position));
                if (tank.box === hoveredBox) return

                if (inRange(tank.box.coords, hoveredBox.coords, p.range)) {
                    ctx.strokeStyle = c_atkRange
                } else if (game.giveRangeOffset && inRange(tank.box.coords, hoveredBox.coords, p.range + game.giveRangeOffset)) {
                    ctx.strokeStyle = c_giveRange
                } else {
                    return
                }

                const angle = angleTo(hoveredBox, tank.box)
                const origin = vecToPoint(2, angle + Math.PI / 2)
                const arrowHead = vecToPoint(arrowHeadLength, angle + Math.PI / 4)

                ctx.beginPath()
                ctx.moveTo(center(tank.box).x + origin.x, center(tank.box).y + origin.y)
                ctx.lineTo(center(hoveredBox).x + origin.x, center(hoveredBox).y + origin.y)
                ctx.lineTo(center(hoveredBox).x + origin.x + arrowHead.x, center(hoveredBox).y + origin.y + arrowHead.y)
                ctx.stroke();
            })

        deltaActions = path.length - 1
        updateInfo()
    }
}
