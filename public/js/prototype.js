import { Driver } from '/js/game-engine/Game.js'

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
    other_driver = undefined;

    constructor (other_driver) {
        this.other_driver = other_driver;
    }

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
        if(event.type === "keydown" && event.code === "Enter"){
            if(this.other_driver.actively_running == false){
                this.other_driver.run(16);
            } else {
                this.other_driver.stop();
            }
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
    //driver.run(16);





    let canvas2 = document.getElementById("root_2");
    let ctx2 = canvas2.getContext("2d");
    ctx2.canvas.width = 1000;
    ctx2.canvas.height = 1000;

    let driver2 = new Driver(ctx2, parent_div, document, Driver.MODE_PASSIVE, "#000000");

    promises = driver2.imagePreload(images);
    await promises;

    let yuri = new PassiveYuri(driver);
    driver2.components.push(yuri);
    driver2.run();

})();