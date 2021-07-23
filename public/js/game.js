import Player from "./Player.js";

(async () => {
    const grid = [];

    // Get data
    const sizeRes = await fetch("/grid-size");
    const size = await sizeRes.json();

    const playerRes = await fetch("/players");
    const players = await playerRes.json();
    console.log(players)

    createGrid(document.body, size.width, size.height, 50, 50, grid);

    /**
     * 
     * @param {HTMLElement} element 
     * @param {number} width 
     * @param {number} height
     * @param {number} xSize
     * @param {number} ySize
     * @param {Array} gridArray 
     */
    function createGrid(element, width, height, xSize, ySize, gridArray) {
        let gridElement = element.appendChild(document.createElement("div"));

        gridElement.id = "main";
        gridElement.className = "container";

        for (let row = 0; row < width; ++row) {
            let rowElement = gridElement.appendChild(
                document.createElement("div")
            );
            rowElement.className = "row";
            rowElement.id = "row" + row;
            rowElement.style.height = `${ySize + 2}px`;

            gridArray.push([]);

            for (let col = 0; col < height; ++col) {
                let box = rowElement.appendChild(document.createElement("canvas"));
                box.className = "box";
                box.style.width = `${xSize}px`;
                box.style.height = `${ySize}px`;

                box.position = { x: col, y: row };

                box.addEventListener("click", () => {
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            if (grid[row + i][col + j] && !(i === 0 && j === 0)) {
                                colorCanvas(grid[row + i][col + j], "#ff0000")
                            }
                        }
                    }
                })

                gridArray[row].push(box);
            }
        }
    }

    /**
     * 
     * @param {HTMLCanvasElement} canvasElement
     * @param {string} color
     */
    function colorCanvas(canvasElement, color) {
        const width = canvasElement.width;
        const height = canvasElement.height;

        const ctx = canvasElement.getContext('2d');
        ctx.fillStyle = color
        ctx.fillRect(0, 0, width, height)
    }
})();