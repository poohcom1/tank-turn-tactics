class Driver {
    static MODE_PASSIVE = "passive";
    static MODE_ACTIVE = "active";
    static TRANSPARENT = "TRANSPARENT"

    //internal variables
    canvas_ctx = undefined;
    mode = undefined;
    image_cache = {};
    bg_color = "#000000"

    //event variables
    mouse_events = {};
    key_events = {};
    
    //push your components here
    components = [];

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
            if(event.type === "mousemove"){
                this.mouse_events.x = event.offsetX;
                this.mouse_events.y = event.offsetY;
            } else if (event.type === "mousedown"){
                this.mouse_events.down = true;
            } else if (event.type === "mouseup"){
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
            if(event.type === "keydown"){
                this.key_events[event.code] = true;
            }else if (event.type === "keyup"){
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

    run = (frame_interval) => {
        if(this.mode === Driver.MODE_ACTIVE){
            setInterval(this.update, frame_interval);
        }
    }

    drawImageFromCache = (image_uri, dx, dy, width, height) => {
        let img = this.image_cache[image_uri];
        this.canvas_ctx.drawImage(img, dx, dy, width, height);
    }
};

class TestGameObject {
    picture = "/assets/test2.jpg";
    x = 200;
    y = 0;

    redraw = (driver) => {
        driver.drawImageFromCache(this.picture, this.x, this.y, 200, 200 * 0.700323102);
    };

    update = (driver) => {
        if(driver.mouse_events.down == true){
            this.x = driver.mouse_events.x;
            this.y = driver.mouse_events.y;
            console.log("mouse down!" + parseInt(this.x) +" : "+ parseInt(this.y));
        }

        if(driver.key_events['ArrowRight'] == true){
            this.x = this.x + 10;
        }
        if(driver.key_events['ArrowLeft'] == true){
            this.x = this.x - 10;
        }
        if(driver.key_events['ArrowUp'] == true){
            this.y = this.y - 10;
        }
        if(driver.key_events['ArrowDown'] == true){
            this.y = this.y + 10;
        }
    }
}

class Ball {
    picture = "/assets/ball.jpg";
    x = 300;
    y = 0;
    dy = 10;

    in

    redraw = (driver) => {
        driver.drawImageFromCache(this.picture, this.x, this.y, 100, 100);
    };

    update = (driver) => {
        if(this.y < 0) {
            this.y = 1;
            this.dy = 10;
        }

        if(this.y > 600){
            this.y = 599;
            this.dy = -10;
        }

        this.y = this.y + this.dy;
    }
}

class PassiveYuri {
    picture = "/assets/test.jpg";
    x = 0;
    y = 0;

    redraw = (driver) => {
        let img = driver.image_cache[this.picture];
        let ratio = img.height / img.width;
        driver.drawImageFromCache(this.picture, this.x, this.y, 100, 100 * ratio);
    };

    onMouseEvent = (driver, event) => {
    };

    onKeyEvent = (driver, event) => {
        if(event.type === "keydown" && event.code === "ArrowRight"){
            this.x = this.x + 10;
        }
        if(event.type === "keydown" && event.code === "ArrowLeft"){
            this.x = this.x - 10;
        }
        if(event.type === "keydown" && event.code === "ArrowUp"){
            this.y = this.y - 10;
        }
        if(event.type === "keydown" && event.code === "ArrowDown"){
            this.y = this.y + 10;
        }
    };
}

(async () => {
    let parent_div = document.getElementById("parent_div");


    let canvas = document.getElementById("root_canvas");
    let ctx = canvas.getContext("2d");
    ctx.canvas.width = 1000;
    ctx.canvas.height = 1000;

    let driver = new Driver(ctx, parent_div, document, Driver.MODE_ACTIVE, Driver.TRANSPARENT);

    let images = ['/assets/test.jpg', '/assets/test2.jpg', '/assets/ball.jpg'];

    let promises = driver.imagePreload(images);
    await promises;

    let face = new TestGameObject;
    let ball = new Ball;

    driver.components.push(face);
    driver.components.push(ball);
    driver.run(16);





    let canvas2 = document.getElementById("root_2");
    let ctx2 = canvas2.getContext("2d");
    ctx2.canvas.width = 1000;
    ctx2.canvas.height = 1000;

    let driver2 = new Driver(ctx2, parent_div, document, Driver.MODE_PASSIVE, "#000000");

    promises = driver2.imagePreload(images);
    await promises;

    let yuri = new PassiveYuri;
    driver2.components.push(yuri);
    driver2.redraw();

})();