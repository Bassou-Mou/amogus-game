/* ── Configuration ────────────────────────────────────────────── */
const MY_ID = 'P' + Math.random().toString(36).slice(2, 6).toUpperCase();
const WS_URL = 'http://localhost:8080/game-ws';
const W = 700, H = 440, SPEED = 200;

// Couleurs pour les joueurs
const COLORS = [0x5566ff, 0xff4488, 0x44ffaa, 0xffaa33, 0xcc44ff, 0xff5544];
const playerColors = {};

/* ── WebSocket ────────────────────────────────────────────────── */
let stompClient = null;
let wsReady = false;

function connectWS() {
  stompClient = Stomp.over(new SockJS(WS_URL));
  stompClient.debug = null;

  stompClient.connect({}, () => {
    wsReady = true;
    document.getElementById('ws-dot').className = 'dot connected';
    document.getElementById('ws-label').textContent = 'Connected';
    document.getElementById('my-id').textContent = MY_ID;

    // Recevoir les positions des autres joueurs
    stompClient.subscribe('/topic/positions', (msg) => {
      const pos = JSON.parse(msg.body);
      if (pos.playerId !== MY_ID && window.gameScene) {
        window.gameScene.updateRemotePlayer(pos.playerId, pos.x, pos.y);
      }
    });

    // Recevoir les événements join/leave
    stompClient.subscribe('/topic/players', (msg) => {
      const evt = JSON.parse(msg.body);
      if (evt.type === 'leave' && window.gameScene) {
        window.gameScene.removeRemotePlayer(evt.playerId);
      }
    });

    // Annoncer son arrivée
    stompClient.send('/app/player/join', {}, JSON.stringify({ playerId: MY_ID, type: 'join' }));
    
    // Envoyer sa position initiale
    setTimeout(() => {
      if (window.gameScene) {
        sendPosition(window.gameScene.px, window.gameScene.py);
      }
    }, 100);
  });
}

function sendPosition(x, y) {
  if (!wsReady) return;
  stompClient.send('/app/player/move', {}, JSON.stringify({
    playerId: MY_ID,
    x: Math.round(x),
    y: Math.round(y)
  }));
}

/* ── Phaser Game ──────────────────────────────────────────────── */
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.remotePlayers = {};
  }

  create() {
    window.gameScene = this;
    
    // Fond quadrillé
   
    
    // Mon joueur
    this.myColor = COLORS[0];
    playerColors[MY_ID] = this.myColor;
    this.px = W / 2;
    this.py = H / 2;
    this.myCircle = this.add.graphics();
    this.drawMyCircle();

    // Contrôles
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: 'W', down: 'S', left: 'A', right: 'D'
    });

    this.lastSend = 0;
    connectWS();
  }

  drawMyCircle() {
    this.myCircle.clear();
    this.myCircle.fillStyle(this.myColor, 0.8);
    this.myCircle.fillCircle(this.px, this.py, 18);
  }

  updateRemotePlayer(id, x, y) {
    if (!this.remotePlayers[id]) {
      // Nouveau joueur : lui attribuer une couleur
      const colorIndex = Object.keys(this.remotePlayers).length % (COLORS.length - 1) + 1;
      playerColors[id] = COLORS[colorIndex];
      
      this.remotePlayers[id] = {
        circle: this.add.graphics(),
        x: x,
        y: y
      };
    }
    
    const player = this.remotePlayers[id];
    player.x = x;
    player.y = y;
    
    player.circle.clear();
    player.circle.fillStyle(playerColors[id], 0.8);
    player.circle.fillCircle(x, y, 18);
  }

  removeRemotePlayer(id) {
    if (this.remotePlayers[id]) {
      this.remotePlayers[id].circle.destroy();
      delete this.remotePlayers[id];
    }
  }

  update(time, delta) {
    const speed = Math.round(SPEED * (delta / 1000));
    let moved = false;

    // Mouvement
    if (this.wasd.left.isDown || this.cursors.left.isDown)  { this.px -= speed; moved = true; }
    if (this.wasd.right.isDown || this.cursors.right.isDown) { this.px += speed; moved = true; }
    if (this.wasd.up.isDown || this.cursors.up.isDown)    { this.py -= speed; moved = true; }
    if (this.wasd.down.isDown || this.cursors.down.isDown)  { this.py += speed; moved = true; }

    // Limites de l'écran
    this.px = Phaser.Math.Clamp(this.px, 20, W - 20);
    this.py = Phaser.Math.Clamp(this.py, 20, H - 20);

    if (moved) {
      this.drawMyCircle();
      if (time - this.lastSend > 50) {
        sendPosition(this.px, this.py);
        this.lastSend = time;
      }
    }
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: W,
  height: H,
  parent: 'game-container',
  backgroundColor: '#0d0d1a',
  scene: GameScene
});