class Driver {
    canvas_ctx = undefined;
    image_cache = {};
    components = [];

    imagePreload = function (images_uri_list){
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

    passiveOnMouseEvent = function (){
        console.log("Mouse Event");
        components.forEach((component) => {
            component.onMouseEvent();
        })

        this.redraw();
    };

    passiveOnKeyEvent = function (){
        console.log("Key Event");
        components.forEach((component) => {
            component.onKeyEvent();
        })

        this.redraw();
    };

    redraw = function (){
        console.log("redrawing");
        components.forEach((component) => {
            component.redraw();
        })
    };

    activeRedraw = function (){
        //game loop...
    }
};

class DriverComponent {

}

(async () => {
    let canvas = document.getElementById("root_canvas");
    let ctx = canvas.getContext("2d");

    ctx.canvas.width = 1000;
    ctx.canvas.height = 1000;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 1000, 1000);

    let driver = new Driver;

    let images = ['/test.jpg', '/test2.jpg'];

    let promises = driver.imagePreload(images);
    await promises;
    
    let test_img = driver.image_cache["/test2.jpg"];
    ctx.drawImage(test_img, 0, 0, 200, 200 * test_img.height / test_img.width);

    test_img = driver.image_cache["/test.jpg"];
    ctx.drawImage(test_img, 200, 0, 200, 200 * test_img.height / test_img.width);
})();



/*
    let test_img = new Image;
    test_img.src = "/test.jpg";

    let promise1 = new Promise((resolve, reject) => {
        test_img.onload = resolve;
    });

    promise1.then(() => {
        ctx.drawImage(test_img, 0, 0, 100, 100 * test_img.height / test_img.width);
    }, null);


    engine.imagePreload();
    */