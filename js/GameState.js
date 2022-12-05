import { GameUI } from './GameUI.js';
import { GameAI } from './GameAI.js';
import { Vector2, Raycaster } from '../../libs/three137/three.module.js';

class GameState{
    constructor(game)
    {
      this.game = game;
      this.ui = new GameUI();
      this.ai = new GameAI(this.game);
      this.playerBalls = [];
      this.aiOn = false;
      this.turnTimer = 0;
      this.initGame();
      this.charging = false;
      const btn = document.getElementById('playBtn');
      const aiBtn = document.getElementById('aiBtn');
      aiBtn.addEventListener('click', (evt) => {
        this.aiOn = !this.aiOn;
        aiBtn.innerHTML = this.aiOn ? true : false;
        //if ai is off 
        if(!this.aiOn){
          this.ai.stopAutoRotate();
        }else
        {
          if(this.turn == 'player2'){
          this.ai.autoRotate();
          }
        }
      });
      btn.onclick = this.startGame.bind(this);
      document.addEventListener( 'keydown', this.keydown.bind(this));
      document.addEventListener( 'keyup', this.keyup.bind(this)); 
      document.addEventListener( 'click', this.onClick.bind(this));

    }
  
    showPlayBtn(){
      this.ui.show('playBtn');
    }

    startGame(){
      this.ui.showGameHud(true);
      this.game.reset();
      //hide message
      this.ui.hide('message');
      this.initGame();
      this.startTurn();
    }

    keydown( evt ){
      if (this.state !== 'turn') return;
      if (this.aiOn && this.turn == 'player2') return;
      //if mouse is down, show strength bar
  

      if (evt.keyCode == 32){
          this.ui.strengthBar.visible = true;
      }
    }

    keyup( evt ){
      if (this.state !== 'turn') return;
      if (this.aiOn && this.turn == 'player2') return;
      if (evt.keyCode == 32){
          this.ui.strengthBar.visible = false;
          this.hit(this.ui.strengthBar.strength);
      }
    }

    onClick( evt ){
      //if mouse is down, show strength bar
      if (this.state !== 'turn') return;
      const mouse = new Vector2();
      mouse.x = ( evt.clientX / window.innerWidth ) * 2 - 1;
      mouse.y = - ( evt.clientY / window.innerHeight ) * 2 + 1;
      const raycaster = new Raycaster();
      raycaster.setFromCamera( mouse, this.game.camera );
      const intersects = raycaster.intersectObjects( this.game.scene.children, true );

      if (intersects.length > 0){
        if(!this.charging){
          if(intersects[0].object.name == 'ball0'){
            this.ui.strengthBar.visible = true;
            this.charging = true;
          }
        }else{
          this.ui.strengthBar.visible = false;
          this.charging = false;
          this.hit(this.ui.strengthBar.strength);
        }
      }

    }

    playerTargetBallSet(player){
      //if this.turn is '?' return numberedBallsOnTable
      if(this.sides[this.turn] == '?'){
        return this.numberedBallsOnTable;
      }
        
      //parse numberdBallsOnTable to get a list of balls
      const ballSet = [];
      //figure out which side the player is on
      if (this.sides[this.turn] == 'solid') {
        for (let i = 1; i < 8; i++) {
          if (this.numberedBallsOnTable.includes(i)) {
            ballSet.push(i);
          }
        }
      } else {
        for (let i = 9; i < 16; i++) {
          if (this.numberedBallsOnTable.includes(i)) {
            ballSet.push(i);
          }
        }
      }
      //if there are no balls left, the player wins
      if (ballSet.length == 0) {
        //add 8 ball to the list
        ballSet.push(8);
      }
      return ballSet;
    }

    initGame(){
      this.numberedBallsOnTable = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
      
      this.turn = 'player1';
      
      this.sides = {
        player1: '?',
        player2: '?'
      };
  
      this.pocketingOccurred = false;
  
      this.state = 'notstarted';
  
      this.ticker = undefined;
    }
  
    startTurn() {
      if (this.state == 'gameover') return;
      // enable movement
      this.timer = 30;
      this.tickTimer();
      this.state = 'turn';
   
      this.ui.updateTurn(this.turn);
      //if it's player 1's turn
      if (this.turn == 'player1') {
        this.ai.stopAutoRotate();

      }
      this.ui.updateBalls(this.numberedBallsOnTable, this.sides);
      const str = this.turn == 'player1' ? 'Player 1' : 'Player 2';
      this.ui.log(`${str} to play`);

      if (this.turn == 'player2') {
        this.ai.state = 'aim';
      }
    }
  
    whiteBallEnteredHole() {
      this.ui.log(`Cue ball pocketed by ${this.turn}!`);
    }

  
    coloredBallEnteredHole(id) {
      if (id === undefined) return;
      this.playerBalls = this.playerTargetBallSet(this.turn);

      this.numberedBallsOnTable = this.numberedBallsOnTable.filter( num => {
        
          return num != id; //remove ball from numberedBallsOnTable
          
      });

      if (id == 0)  return;
  
      if (id == 8) {
        
        if (this.playerBalls.length > 1) {
            this.ui.log(`Game over! 8 ball pocketed too early by ${this.turn}`);
            this.turn = this.turn == 'player1' ? 'player2': 'player1';
        }
  
        this.pocketingOccurred = true;
  
        // Win!
        this.endGame();
    } else {
      if (this.sides.player1 == '?' || this.sides.player2 == '?') {
        this.sides[this.turn] = id < 8 ? 'solid' : 'striped';
        this.sides[this.turn == 'player1' ? 'player2' : 'player1'] = id > 8 ? 'solid' : 'striped';
        this.pocketingOccurred = true;
      } else {
        if ((this.sides[this.turn] == 'solid' && id < 8) || (this.sides[this.turn] == 'striped' && id > 8)) {
          // another turn
          this.pocketingOccurred = true;
        } else {
          this.pocketingOccurred = false;
          this.ui.log(`${this.turn} pocketed opponent's ball!`);
        }
      }
    }
  }
  
  tickTimer() {
    this.ui.updateTimer(this.timer);
    if (this.timer == 0) {
      this.ui.log(`${this.turn} ran out of time`);
      this.state = "outoftime";
      this.switchSides();
      setTimeout( this.startTurn.bind(this), 1000);
    } else {
      this.timer--;
      this.ticker = setTimeout(this.tickTimer.bind(this), 1000);
    }
  }
  
  switchSides() {
    this.turn = this.turn == 'player1' ? 'player2': 'player1';
  }
  
  endGame() {
    this.state = 'gameover';
    const winner = this.turn == 'player1' ? 'Player 1' : 'Player 2';
    clearTimeout(this.ticker);
    this.ui.showMessage(`${winner} won!`, 'Thank you for playing');


  }
  
  hit(strength) {
    this.game.strikeCueball(strength);
    clearTimeout(this.ticker);
    this.state = 'turnwaiting';
  }

  checkSleeping(dt){
    if (!this.game.cueball.isSleeping) return;

    for (let i=1; i<this.game.balls.length; i++) 
    {
      if (!this.game.balls[i].isSleeping && this.numberedBallsOnTable.indexOf(Number(game.balls[i].name.split('ball')[0])) > -1) {
        return;
      }
    }
    //add dt to turn timer
    this.turnTimer += dt;
    if (this.turnTimer > 2) {
      if (!this.pocketingOccurred) this.switchSides();
      console.log('turn over');
      this.pocketingOccurred = false;
  
      setTimeout( this.startTurn.bind(this), 1000);
  
      this.state = 'paused';
      this.turnTimer = 0;
    }


  }

  update(dt){
    if (this.state == 'turnwaiting') this.checkSleeping(dt);
    this.ui.update();

    if(this.aiOn){
      this.ai.update(dt);
    }
  }
}

export { GameState };