class Driver {
    static MODE_PASSIVE = "passive";
    static MODE_ACTIVE = "active";
    static TRANSPARENT = "TRANSPARENT";

    //component types templates

    static ActiveComponent = class {
        /**
         * @param {Driver} driver
         */
        update(driver) {
        };

        /**
         * @param {Driver} driver
         */
        redraw(driver) {
        }
    }

    static PassiveComponent = class {
        /**
         * @param {Driver} driver
         * @param {MouseEvent} e
         */
        onMouseEvent(driver, e) {
        };

        /**
         * @param {Driver} driver
         * @param {KeyboardEvent} e
         */
        onKeyEvent(driver, e) {
        };

        /**
         * @param {Driver} driver
         */
        redraw(driver) {
        };
    }

    //internal variables ---------------------

    /**
     * @type {CanvasRenderingContext2D}
     */
    canvas_ctx = undefined;

    /**
     * @type {string}
     */
    mode = undefined;

    run_loop_obj = undefined;

    //----------------------------------------

    //event variables ------------------------

    mouse_events = {};
    key_events = {};
    key_pressed = {}

    //----------------------------------------

    //external variables -------------------

    //push your components here
    components = [];

    image_cache = {};
    bg_color = "#000000";
    actively_running = false;

    static overrideMouse = false;
    static overrideKeyboard = false;

    mouseEventConsumed = false;

    constructor(ctx, parent_div, document_handle, mode = Driver.MODE_PASSIVE, bg_color = "#000000") {
        this.canvas_ctx = ctx;
        this.mode = mode;
        this.bg_color = bg_color;

        parent_div.addEventListener("click", this.onMouseEvent);
        parent_div.addEventListener("mousedown", this.onMouseEvent);
        parent_div.addEventListener("mouseup", this.onMouseEvent);
        parent_div.addEventListener("mousemove", this.onMouseEvent);
        parent_div.addEventListener("mouseout", this.onMouseEvent);
        parent_div.addEventListener("wheel", this.onMouseEvent);

        document_handle.addEventListener("keydown", this.onKeyEvent);
        document_handle.addEventListener("keyup", this.onKeyEvent);
    }

    imagePreload = (images_uri_list) => {
        console.log("Preloading images");

        let promises = [];

        images_uri_list.forEach(element => {
            let img = new Image;
            this.image_cache[element] = img;
            img.src = element;

            let promise1 = new Promise((resolve, reject) => {
                img.onload = resolve;
            });
            promises.push(promise1);
        });

        return Promise.all(promises);
    };

    onMouseEvent = (event) => {
        if (Driver.overrideMouse) event.preventDefault()
        this.mouseEventConsumed = false;

        if (this.mode === Driver.MODE_PASSIVE) {
            this.components.forEach((component) => {
                component.onMouseEvent(this, event);
            })
            this.redraw();
        } else {
            this.mouse_events.pressed = false;

            if (event.type === "mousemove") {
                this.mouse_events.x = event.offsetX;
                this.mouse_events.y = event.offsetY;
            } else if (event.type === "mousedown") {
                this.mouse_events.down = true;
                this.mouse_events.pressed = true
            } else if (event.type === "click") {
                this.mouse_events.click = true
            } else if (event.type === "mouseup") {
                this.mouse_events.down = false;
            } else if (event.type === "wheel") {
                if (event.deltaY < 0) {
                    this.mouse_events.scrollUp = true;
                } else if (event.deltaY > 0) {
                    this.mouse_events.scrollDown = true;
                }
            }

        }
    };

    onKeyEvent = (event) => {
        if (this.mode === Driver.MODE_PASSIVE) {
            this.components.forEach((component) => {
                component.onKeyEvent(this, event);
            })
            this.redraw();
        } else {
            if (event.type === "keydown") {
                this.key_events[event.code] = true;
                this.key_pressed[event.code] = true;
            } else if (event.type === "keyup") {
                this.key_events[event.code] = false;
            }
        }

        event.preventDefault();
    };

    redraw = () => {
        if (this.bg_color != Driver.TRANSPARENT) {
            this.canvas_ctx.fillStyle = this.bg_color;
            this.canvas_ctx.fillRect(0, 0, this.canvas_ctx.canvas.width, this.canvas_ctx.canvas.height);
        } else {
            this.canvas_ctx.clearRect(0, 0, this.canvas_ctx.canvas.width, this.canvas_ctx.canvas.height);
        }

        this.components.forEach((component) => {
            component.redraw(this);
        })
    };

    update = () => {
        this.mouseEventConsumed = true;
        this.components.forEach((component) => {
            component.update(this);
        })

        this.redraw();

        if (this.mouseEventConsumed) {
            this.mouse_events.pressed = false;
            this.mouse_events.click = false;
            this.mouse_events.scrollUp = false;
            this.mouse_events.scrollDown = false;
        }
        this.key_pressed = {};

    }

    run = (frame_interval = 16) => {
        if (this.mode === Driver.MODE_ACTIVE && !this.actively_running) {
            this.update();
            this.run_loop_obj = setInterval(this.update, frame_interval);
            this.actively_running = true;
        } else {
            this.redraw();
        }
    }

    stop = () => {
        if (this.mode === Driver.MODE_ACTIVE && this.actively_running) {
            clearInterval(this.run_loop_obj);
            this.actively_running = false;
        }
    }

    drawImageFromCache = (image_uri, dx, dy, width, height) => {
        let img = this.image_cache[image_uri];
        this.canvas_ctx.drawImage(img, dx, dy, width, height);
    }
}


/**
 *
 * @param {HTMLDivElement} div
 * @param {string} mode
 * @param {{width: number, height: number}} dimensions
 * @param {string|null} background
 * @param {number|null} index
 */
function initDriver(div, mode, dimensions, background = Driver.TRANSPARENT, index = null) {
    if (!index) {
        this.zIndex = this.zIndex || 0

        index = this.zIndex++
    }

    div.style.position = 'relative';

    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute'
    canvas.style.top = '0';
    canvas.style.left = '0';

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    canvas.style.zIndex = `${ index }`;

    div.appendChild(canvas)

    return new Driver(canvas.getContext('2d'), div, document, mode, background)
}

/**
 * @param {Object} pos
 * @param {number} pos.x
 * @param {number} pos.y
 * @param {Object} bounds
 * @param {number} bounds.x
 * @param {number} bounds.y
 * @param {number} bounds.width
 * @param {number} bounds.height
 * @return {boolean}
 */
function inBounds(pos, bounds) {
    return pos.x > bounds.x && pos.y > bounds.y && pos.x < bounds.x + bounds.width && pos.y < bounds.y + bounds.height;
}

function inRange(pos, target, range) {
    return Math.sqrt(Math.pow(target.x - pos.x, 2) + Math.pow(target.y - pos.y, 2)) <= range;
}

function center(bounds) {
    return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }
}

function parallelCoords(pos1, pos2) {
    return pos1.x === pos2.x || pos1.y === pos2.y;
}

function connectCoords(pos1, pos2) {
    if (Math.abs(pos1.x - pos2.x) > Math.abs(pos1.y - pos2.y)) {
        return { x: pos2.x, y: pos1.y }
    } else {
        return { x: pos1.x, y: pos2.y }
    }
}

function coordsEquals(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y
}

function getPath(origin, dest) {
    const axis = origin.y === dest.y ? 'x' : 'y'
    const nonAxis = origin.x === dest.x ? 'x' : 'y'
    const direction = dest[axis] - origin[axis] > 0 ? 1 : -1

    const diff = Math.abs(dest[axis] - origin[axis]);

    const coords = []

    for (let i = 1; i <= diff; i++) {
        const coord = {};
        coord[axis] = origin[axis] + direction * i;
        coord[nonAxis] = origin[nonAxis]
        coords.push(coord)
    }

    return coords;
}

function getChar(num) {
    // Thanks, gooostaw: https://stackoverflow.com/questions/8240637/convert-numbers-to-letters-beyond-the-26-character-alphabet
    let letters = ''
    while (num >= 0) {
        letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[num % 26] + letters
        num = Math.floor(num / 26) - 1
    }
    return letters
}

function vecToPoint(distance, angle) {
    return { x: distance * Math.cos(angle), y: distance * Math.sin(angle) }
}

function angleTo(source, target) {
    const dy = target.y - source.y
    const dx = target.x - source.x

    return Math.atan2(dy, dx)
}

function shortenName(name, length = 15) {
    if (name.length > length) name = name.slice(0, length) + '...'

    return name;
}

function dateTimeDiff(dateNow, dateThen) {
    const diffInMs = dateNow - dateThen
    const diffInSeconds = (diffInMs / 1000) % 60;
    const diffInMinutes = (diffInMs / 1000 / 60) % 60;
    const diffInHours = (diffInMs / 1000 / 60 / 60) % 24;
    const diffInDays = diffInMs / 1000 / 60 / 60 / 24;

    const minString = diffInMinutes >= 10 ? Math.floor(diffInMinutes) : "0" + Math.floor(diffInMinutes)
    const secString = diffInSeconds >= 10 ? Math.floor(diffInSeconds) : "0" + Math.floor(diffInSeconds)

    return `${ Math.floor(diffInDays) }D ${ Math.floor(diffInHours) }:${ minString }:${ secString }`
}