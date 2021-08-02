class Driver {
    static MODE_PASSIVE = "passive";
    static MODE_ACTIVE = "active";
    static TRANSPARENT = "TRANSPARENT";

    //component types templates

    static ActiveComponent = class {
        /**
         * @param {Driver} driver
         */
        update(driver) {};

        /**
         * @param {Driver} driver
         */
        redraw(driver) {}
    }

    static PassiveComponent = class {
        /**
         * @param {Driver} driver
         * @param {MouseEvent} e
         */
        onMouseEvent(driver, e) {};

        /**
         * @param {Driver} driver
         * @param {KeyboardEvent} e
         */
        onKeyEvent(driver, e) {};

        /**
         * @param {Driver} driver
         */
        redraw(driver) {};
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

    //----------------------------------------
    
    //external variables -------------------

    //push your components here
    components = [];

    image_cache = {};
    bg_color = "#000000";
    actively_running = false;

    constructor(ctx, parent_div, document_handle, mode = Driver.MODE_PASSIVE, bg_color = "#000000"){
        this.canvas_ctx = ctx;
        this.mode = mode;
        this.bg_color = bg_color;

        parent_div.addEventListener("click", this.onMouseEvent);
        parent_div.addEventListener("mousedown", this.onMouseEvent);
        parent_div.addEventListener("mouseup", this.onMouseEvent);
        parent_div.addEventListener("mousemove", this.onMouseEvent);
        parent_div.addEventListener("mouseout", this.onMouseEvent);
        parent_div.addEventListener("mousewheel", this.onMouseEvent);

        document_handle.addEventListener("keydown",  this.onKeyEvent);
        document_handle.addEventListener("keyup",  this.onKeyEvent);
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
        if(this.mode === Driver.MODE_PASSIVE){
            this.components.forEach((component) => {
                component.onMouseEvent(this, event);
            })
            this.redraw();
        } else {
            if(event.type == "mousemove"){
                this.mouse_events.x = event.offsetX;
                this.mouse_events.y = event.offsetY;
            } else if (event.type == "mousedown"){
                this.mouse_events.down = true;
            } else if (event.type == "mouseup"){
                this.mouse_events.down = false;
            }
        }
    };

    onKeyEvent = (event) => {
        console.log("Key Event" + `: ${event.key} , ${event.code}`);

        if(this.mode === Driver.MODE_PASSIVE){
            this.components.forEach((component) => {
                component.onKeyEvent(this, event);
            })
            this.redraw();
        } else {
            if(event.type == "keydown"){
                this.key_events[event.code] = true;
            }else if (event.type == "keyup"){
                this.key_events[event.code] = false;
            }
        }

        event.preventDefault();
    };

    redraw = () => {
        if(this.bg_color != Driver.TRANSPARENT){
            this.canvas_ctx.fillStyle = this.bg_color;
            this.canvas_ctx.fillRect(0, 0, this.canvas_ctx.canvas.width, this.canvas_ctx.canvas.height);
        }else{
            this.canvas_ctx.clearRect(0, 0, this.canvas_ctx.canvas.width, this.canvas_ctx.canvas.height);
        }

        this.components.forEach((component) => {
            component.redraw(this);
        })
    };

    update = () => {
        this.components.forEach((component) => {
            component.update(this);
        })

        this.redraw();
    }

    run = (frame_interval = 16) => {
        if(this.mode === Driver.MODE_ACTIVE && !this.actively_running){
            this.run_loop_obj = setInterval(this.update, frame_interval);
            this.actively_running = true;
        } else {
            this.redraw();
        }
    }

    stop = () => {
        if(this.mode === Driver.MODE_ACTIVE && this.actively_running){
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
function initDriver(div, mode, dimensions, background = Driver.TRANSPARENT, index=null) {
    if (!index) {
        if (initDriver.zIndex) {
            index = initDriver.zIndex++;
        } else {
            initDriver.zIndex = 0;
            index = 0;
        }
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
