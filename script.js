let gameState = 'landing'; // 狀態機：'landing' 或 'play'
let particles = [];
let currentTheme = 0; // 0: 科技藍, 1: 霓虹粉, 2: 奇幻綠

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // 初始化 Landing Page 的背景背景粒子
    for (let i = 0; i < 60; i++) {
        particles.push(new Particle(random(width), random(height), false));
    }

    // 監聽 HTML 按鈕點擊事件
    const startBtn = document.getElementById('start-btn');
    startBtn.addEventListener('click', startGame);
}

function draw() {
    // 透過半透明背景達到「拖尾/殘影」的流體視覺效果
    background(15, 15, 26, 40); 

    // 更新並繪製所有粒子
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.update();
        p.display();
        
        // 如果是互動模式產生的短暫粒子，壽命結束就刪除，避免電腦卡頓
        if (p.isInteractive && p.isDead()) {
            particles.splice(i, 1);
        }
    }

    if (gameState === 'landing') {
        drawLandingEffects();
    } else if (gameState === 'play') {
        drawInteractiveArt();
    }
}

// 點擊按鈕進入遊戲
function startGame() {
    gameState = 'play';
    document.getElementById('landing-page').classList.add('hidden');
}

// ------------------------------------
// 視覺效果與互動邏輯
// ------------------------------------

function drawLandingEffects() {
    // Landing Page 的滑鼠微弱互動：淡淡的科技光圈
    noFill();
    stroke(0, 242, 254, 30);
    strokeWeight(1);
    ellipse(mouseX, mouseY, sin(frameCount * 0.05) * 40 + 80);
}

function drawInteractiveArt() {
    // 頂部提示文字
    fill(255, 255, 255, 100);
    noStroke();
    textSize(14);
    textAlign(CENTER);
    let themeNames = ["【科技宇宙】藍綠", "【霓虹夜市】粉紫", "【翡翠極光】黃綠"];
    text(`當前主題：${themeNames[currentTheme]} (按下空白鍵 Space 切換)`, width / 2, 40);

    // 🖱️ 移動滑鼠時：持續產生互動粒子
    if (gameState === 'play' && (mouseX !== pmouseX || mouseY !== pmouseY)) {
        // 限制產生的數量，避免太卡
        if (frameCount % 2 === 0) {
            particles.push(new Particle(mouseX, mouseY, true));
        }
    }
}

// 👆 點擊畫面：釋放能量波形（一次爆發 30 顆粒子）
function mousePressed() {
    if (gameState === 'play') {
        for (let i = 0; i < 30; i++) {
            particles.push(new Particle(mouseX, mouseY, true));
        }
    }
}

// 🎹 按下鍵盤事件
function keyPressed() {
    if (gameState === 'play') {
        if (key === ' ') { // 空白鍵
            currentTheme = (currentTheme + 1) % 3; // 切換主題 0, 1, 2
        }
    }
}

// 視窗大小改變時自動縮放畫布
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// ------------------------------------
// 進階粒子類別 (Particle Class)
// ------------------------------------
class Particle {
    constructor(x, y, isInteractive) {
        this.x = x;
        this.y = y;
        this.isInteractive = isInteractive; // 分辨是背景粒子還是互動粒子
        
        if (this.isInteractive) {
            // 互動粒子：從滑鼠噴發，速度較快
            let angle = random(TWO_PI);
            let speed = random(1, 5);
            this.vx = cos(angle) * speed;
            this.vy = sin(angle) * speed;
            this.lifespan = 255; // 有壽命限制（透明度）
            this.size = random(6, 12);
        } else {
            // 背景粒子：慢速飄動
            this.vx = random(-0.5, 0.5);
            this.vy = random(-0.5, 0.5);
            this.size = random(2, 4);
        }
        
        this.assignColor();
    }

    // 根據目前的主題指定顏色
    assignColor() {
        let alpha = this.isInteractive ? this.lifespan : random(80, 150);
        if (currentTheme === 0) {
            // 科技藍綠
            this.color = color(random(0, 100), random(200, 255), 255, alpha);
        } else if (currentTheme === 1) {
            // 霓虹粉紫
            this.color = color(255, random(0, 100), random(200, 255), alpha);
        } else {
            // 翡翠極光
            this.color = color(random(150, 255), 255, random(0, 100), alpha);
        }
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.isInteractive) {
            this.lifespan -= 4; // 互動粒子會慢慢淡出
            this.size *= 0.98;  // 越變越小
            
            // 輕微受到滑鼠的引力拉扯
            this.vx += (mouseX - this.x) * 0.001;
            this.vy += (mouseY - this.y) * 0.001;
        } else {
            // 背景粒子碰壁反彈
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
    }

    display() {
        // 動態更新顏色透明度
        this.assignColor();
        
        noStroke();
        fill(this.color);
        
        // 互動粒子加上一點發光感（畫大一點點的陰影圈）
        if (this.isInteractive) {
            fill(red(this.color), green(this.color), blue(this.color), alpha(this.color) * 0.3);
            ellipse(this.x, this.y, this.size * 2);
        }
        
        fill(this.color);
        ellipse(this.x, this.y, this.size);
    }

    isDead() {
        return this.lifespan < 0;
    }
}