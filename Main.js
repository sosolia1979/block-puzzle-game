const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 800,
    backgroundColor: '#ffe4b5',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);
let blocks = [];
let queueBlocks = [];
let draggingBlock = null;
let gridSize = 8;
let cellSize = 60;
let animalTypes = ['cat', 'dog', 'rabbit'];

// 🎲 랜덤 블록 모양 (테트리스 스타일)
const blockShapes = [
    [[1, 1], [0, 1]],  
    [[1, 0], [1, 1]],  
    [[1, 1], [1, 1]],  
    [[1, 1, 1], [0, 1, 0]]
];

function preload() {
    this.load.image('cat', 'assets/cat.png');
    this.load.image('dog', 'assets/dog.png');
    this.load.image('rabbit', 'assets/rabbit.png');
}

function create() {
    createBoard();
    createQueue();
}

// 🎲 **8x8 보드 생성**
function createBoard() {
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            let emptyCell = this.add.rectangle(50 + j * cellSize, 100 + i * cellSize, cellSize, cellSize, 0xdedede);
            emptyCell.setStrokeStyle(2, 0xaaaaaa);
        }
    }
}

// 🎲 **랜덤 블록 생성**
function createQueue() {
    queueBlocks = [];
    let shape = Phaser.Math.RND.pick(blockShapes);
    let type = Phaser.Math.RND.pick(animalTypes);

    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
            if (shape[i][j] === 1) {
                let block = this.add.image(150 + j * cellSize, 700 + i * cellSize, type).setInteractive();
                block.animalType = type;

                block.on('pointerdown', function() {
                    draggingBlock = this;
                });

                queueBlocks.push(block);
            }
        }
    }
}

// 🔥 **블록 드래그 & 배치**
this.input.on('pointermove', function (pointer) {
    if (draggingBlock) {
        draggingBlock.x = pointer.x;
        draggingBlock.y = pointer.y;
    }
});

this.input.on('pointerup', function (pointer) {
    if (draggingBlock) {
        placeBlock(draggingBlock.x, draggingBlock.y, draggingBlock.animalType);
        queueBlocks.forEach(b => b.destroy());
        queueBlocks = [];
        draggingBlock = null;
        checkBoardClear();
        createQueue();
    }
});

// 🟦 **블록 배치 & 체크**
function placeBlock(x, y, type) {
    let gridX = Math.floor((x - 50) / cellSize) * cellSize + 50;
    let gridY = Math.floor((y - 100) / cellSize) * cellSize + 100;

    let newBlock = game.scene.scenes[0].add.image(gridX, gridY, type);
    newBlock.animalType = type;
    blocks.push(newBlock);
}

// 🎯 **블록이 가득 찼는지 체크 & 제거**
function checkBoardClear() {
    let groupedBlocks = {};

    blocks.forEach(block => {
        let key = `${block.x},${block.y}`;
        if (!groupedBlocks[block.animalType]) {
            groupedBlocks[block.animalType] = [];
        }
        groupedBlocks[block.animalType].push(block);
    });

    for (let type in groupedBlocks) {
        if (groupedBlocks[type].length >= 3) {
            groupedBlocks[type].forEach(block => block.destroy());
            blocks = blocks.filter(b => !groupedBlocks[type].includes(b));
        }
    }
}
