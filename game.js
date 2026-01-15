// 游戏常量配置
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 10;
const MAX_SPEED = 50;

// 游戏状态枚举
const GameState = {
    IDLE: 'idle',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

// 方向枚举
const Direction = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right'
};

// 蛇类
class Snake {
    constructor() {
        this.reset();
    }

    reset() {
        // 初始位置（画布中心）
        const centerX = Math.floor(CANVAS_WIDTH / 2 / GRID_SIZE) * GRID_SIZE;
        const centerY = Math.floor(CANVAS_HEIGHT / 2 / GRID_SIZE) * GRID_SIZE;
        
        this.body = [
            { x: centerX, y: centerY },
            { x: centerX - GRID_SIZE, y: centerY },
            { x: centerX - GRID_SIZE * 2, y: centerY }
        ];
        this.direction = Direction.RIGHT;
        this.nextDirection = Direction.RIGHT;
        this.grow = false;
    }

    // 更新蛇的方向
    setDirection(newDirection) {
        // 防止反向移动
        if (
            (newDirection === Direction.UP && this.direction !== Direction.DOWN) ||
            (newDirection === Direction.DOWN && this.direction !== Direction.UP) ||
            (newDirection === Direction.LEFT && this.direction !== Direction.RIGHT) ||
            (newDirection === Direction.RIGHT && this.direction !== Direction.LEFT)
        ) {
            this.nextDirection = newDirection;
        }
    }

    // 移动蛇
    move() {
        this.direction = this.nextDirection;
        
        const head = { ...this.body[0] };
        
        // 根据方向移动头部
        switch (this.direction) {
            case Direction.UP:
                head.y -= GRID_SIZE;
                break;
            case Direction.DOWN:
                head.y += GRID_SIZE;
                break;
            case Direction.LEFT:
                head.x -= GRID_SIZE;
                break;
            case Direction.RIGHT:
                head.x += GRID_SIZE;
                break;
        }
        
        // 添加新头部
        this.body.unshift(head);
        
        // 如果没有吃到食物，移除尾部
        if (!this.grow) {
            this.body.pop();
        } else {
            this.grow = false;
        }
    }

    // 检查是否碰撞到自身
    checkSelfCollision() {
        const head = this.body[0];
        for (let i = 1; i < this.body.length; i++) {
            if (head.x === this.body[i].x && head.y === this.body[i].y) {
                return true;
            }
        }
        return false;
    }

    // 检查是否碰撞到墙壁
    checkWallCollision() {
        const head = this.body[0];
        return (
            head.x < 0 ||
            head.x >= CANVAS_WIDTH ||
            head.y < 0 ||
            head.y >= CANVAS_HEIGHT
        );
    }

    // 检查是否吃到食物
    checkFoodCollision(food) {
        const head = this.body[0];
        return head.x === food.x && head.y === food.y;
    }

    // 增长蛇身
    growSnake() {
        this.grow = true;
    }

    // 渲染蛇
    render(ctx) {
        // 渲染蛇头
        ctx.fillStyle = '#48bb78';
        ctx.fillRect(this.body[0].x, this.body[0].y, GRID_SIZE, GRID_SIZE);
        
        // 渲染蛇眼
        ctx.fillStyle = 'white';
        const eyeSize = GRID_SIZE / 4;
        const eyeOffset = GRID_SIZE / 4;
        
        if (this.direction === Direction.UP || this.direction === Direction.DOWN) {
            // 垂直方向移动时的眼睛位置
            ctx.fillRect(this.body[0].x + eyeOffset, this.body[0].y + eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(this.body[0].x + GRID_SIZE - eyeOffset - eyeSize, this.body[0].y + eyeOffset, eyeSize, eyeSize);
        } else {
            // 水平方向移动时的眼睛位置
            ctx.fillRect(this.body[0].x + eyeOffset, this.body[0].y + eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(this.body[0].x + eyeOffset, this.body[0].y + GRID_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
        }
        
        // 渲染蛇身
        ctx.fillStyle = '#38a169';
        for (let i = 1; i < this.body.length; i++) {
            ctx.fillRect(this.body[i].x, this.body[i].y, GRID_SIZE, GRID_SIZE);
            
            // 添加身体分段效果
            ctx.strokeStyle = '#2f855a';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.body[i].x + 1, this.body[i].y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
        }
    }
}

// 食物类
class Food {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)) * GRID_SIZE;
        this.y = Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE)) * GRID_SIZE;
        this.color = this.getRandomColor();
        this.spawnTime = Date.now();
    }

    // 确保食物不会生成在蛇身上
    ensureValidPosition(snake) {
        let isValid = false;
        while (!isValid) {
            isValid = true;
            for (const segment of snake.body) {
                if (this.x === segment.x && this.y === segment.y) {
                    this.reset();
                    isValid = false;
                    break;
                }
            }
        }
    }

    // 获取随机食物颜色
    getRandomColor() {
        const colors = [
            '#f56565', // 红色
            '#ed8936', // 橙色
            '#fbbf24', // 黄色
            '#f093fb', // 粉色
            '#9f7aea', // 紫色
            '#63b3ed', // 蓝色
            '#4299e1'  // 深蓝色
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // 渲染食物
    render(ctx) {
        // 添加食物闪烁效果
        const timeSinceSpawn = Date.now() - this.spawnTime;
        const alpha = 0.7 + 0.3 * Math.sin(timeSinceSpawn / 300);
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // 绘制食物主体
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(
            this.x + GRID_SIZE / 2,
            this.y + GRID_SIZE / 2,
            GRID_SIZE / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // 添加高光效果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(
            this.x + GRID_SIZE / 3,
            this.y + GRID_SIZE / 3,
            GRID_SIZE / 6,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        ctx.restore();
    }
}

// 游戏类
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameOverlay = document.getElementById('gameOverlay');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlayMessage = document.getElementById('overlayMessage');
        
        // 初始化游戏对象
        this.snake = new Snake();
        this.food = new Food();
        
        // 游戏状态
        this.gameState = GameState.IDLE;
        this.score = 0;
        this.level = 1;
        this.speed = INITIAL_SPEED;
        this.gameLoop = null;
        
        // 绑定事件监听器
        this.bindEventListeners();
        
        // 更新UI
        this.updateUI();
        
        // 渲染初始画面
        this.render();
    }

    // 绑定事件监听器
    bindEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // 按钮事件
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
    }

    // 处理键盘事件
    handleKeyPress(e) {
        switch (e.key) {
            // 开始/暂停游戏
            case ' ':
                e.preventDefault();
                if (this.gameState === GameState.IDLE) {
                    this.startGame();
                } else if (this.gameState === GameState.PLAYING) {
                    this.togglePause();
                } else if (this.gameState === GameState.PAUSED) {
                    this.togglePause();
                } else if (this.gameState === GameState.GAME_OVER) {
                    this.resetGame();
                    this.startGame();
                }
                break;
            
            // 方向控制（方向键）
            case 'ArrowUp':
                e.preventDefault();
                this.snake.setDirection(Direction.UP);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.snake.setDirection(Direction.DOWN);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.snake.setDirection(Direction.LEFT);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.snake.setDirection(Direction.RIGHT);
                break;
            
            // 方向控制（WASD）
            case 'w':
            case 'W':
                e.preventDefault();
                this.snake.setDirection(Direction.UP);
                break;
            case 's':
            case 'S':
                e.preventDefault();
                this.snake.setDirection(Direction.DOWN);
                break;
            case 'a':
            case 'A':
                e.preventDefault();
                this.snake.setDirection(Direction.LEFT);
                break;
            case 'd':
            case 'D':
                e.preventDefault();
                this.snake.setDirection(Direction.RIGHT);
                break;
        }
    }

    // 开始游戏
    startGame() {
        if (this.gameState === GameState.PLAYING) return;
        
        this.gameState = GameState.PLAYING;
        this.gameOverlay.classList.add('hidden');
        this.startGameLoop();
    }

    // 暂停/继续游戏
    togglePause() {
        if (this.gameState === GameState.PLAYING) {
            this.gameState = GameState.PAUSED;
            this.overlayTitle.textContent = '游戏已暂停';
            this.overlayMessage.textContent = '按空格键继续游戏';
            this.gameOverlay.classList.remove('hidden');
            this.stopGameLoop();
        } else if (this.gameState === GameState.PAUSED) {
            this.gameState = GameState.PLAYING;
            this.gameOverlay.classList.add('hidden');
            this.startGameLoop();
        }
    }

    // 重置游戏
    resetGame() {
        this.stopGameLoop();
        
        // 重置游戏对象
        this.snake.reset();
        this.food.reset();
        this.food.ensureValidPosition(this.snake);
        
        // 重置游戏状态
        this.gameState = GameState.IDLE;
        this.score = 0;
        this.level = 1;
        this.speed = INITIAL_SPEED;
        
        // 更新UI
        this.updateUI();
        
        // 显示初始覆盖层
        this.overlayTitle.textContent = '贪吃蛇游戏';
        this.overlayMessage.textContent = '按空格键开始游戏';
        this.gameOverlay.classList.remove('hidden');
        
        // 渲染初始画面
        this.render();
    }

    // 游戏结束
    gameOver() {
        this.gameState = GameState.GAME_OVER;
        this.stopGameLoop();
        
        this.overlayTitle.textContent = '游戏结束';
        this.overlayMessage.textContent = `最终分数: ${this.score}\n按空格键重新开始`;
        this.gameOverlay.classList.remove('hidden');
    }

    // 开始游戏循环
    startGameLoop() {
        if (this.gameLoop) return;
        
        const gameLoop = () => {
            this.update();
            this.render();
            
            if (this.gameState === GameState.PLAYING) {
                this.gameLoop = setTimeout(gameLoop, this.speed);
            }
        };
        
        gameLoop();
    }

    // 停止游戏循环
    stopGameLoop() {
        if (this.gameLoop) {
            clearTimeout(this.gameLoop);
            this.gameLoop = null;
        }
    }

    // 更新游戏状态
    update() {
        if (this.gameState !== GameState.PLAYING) return;
        
        // 移动蛇
        this.snake.move();
        
        // 检查碰撞
        if (this.snake.checkWallCollision() || this.snake.checkSelfCollision()) {
            this.gameOver();
            return;
        }
        
        // 检查是否吃到食物
        if (this.snake.checkFoodCollision(this.food)) {
            this.handleFoodEaten();
        }
    }

    // 处理吃到食物的情况
    handleFoodEaten() {
        // 增长蛇身
        this.snake.growSnake();
        
        // 增加分数
        this.score += 10 * this.level;
        
        // 检查是否升级
        const newLevel = Math.floor(this.score / 100) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            // 增加游戏速度
            this.speed = Math.max(MAX_SPEED, INITIAL_SPEED - (this.level - 1) * SPEED_INCREMENT);
        }
        
        // 生成新食物
        this.food.reset();
        this.food.ensureValidPosition(this.snake);
        
        // 更新UI
        this.updateUI();
    }

    // 更新UI
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('length').textContent = this.snake.body.length;
    }

    // 渲染游戏
    render() {
        // 清空画布
        this.ctx.fillStyle = '#2d3748';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // 绘制网格线
        this.drawGrid();
        
        // 渲染食物
        this.food.render(this.ctx);
        
        // 渲染蛇
        this.snake.render(this.ctx);
        
        // 如果游戏暂停，绘制暂停提示
        if (this.gameState === GameState.PAUSED) {
            this.drawPauseIndicator();
        }
    }

    // 绘制网格线
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(74, 85, 104, 0.2)';
        this.ctx.lineWidth = 1;
        
        // 绘制垂直线
        for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, CANVAS_HEIGHT);
            this.ctx.stroke();
        }
        
        // 绘制水平线
        for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(CANVAS_WIDTH, y);
            this.ctx.stroke();
        }
    }

    // 绘制暂停指示器
    drawPauseIndicator() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏已暂停', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }
}

// 初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});