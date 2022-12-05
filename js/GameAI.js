//Game AI using State machines

//Path: js\GameAI.js

import { Vector3 } from '../../libs/three137/three.module.js';

class GameAI {
    constructor(game) {
        this.game = game;
        this.ball = game.balls[0];
        this.state = 'idle';
        this.target = new Vector3();
        this.strength = 0.7;
        this.timer = 0;
        this.timeToHit =  1;
        this.ballType = '?';
        this.targetType = '?';
    }


    setTargetType() {
        //check this.game.gameState.sides.player2 for ball type if ? randomize
        if (this.game.gameState.sides.player2 === '?') {
            //randomize target type to solid or striped
            this.targetType = Math.random() > 0.5 ? 'solid' : 'striped';
        } else {
            this.targetType = this.game.gameState.sides.player2;
        }

    }

    autoRotate() {
        //turn off player controls
        this.game.gameState.game.controls.enabled = false;
        //enable orbitcotrols auto rotate
        this.game.gameState.game.controls.autoRotate = true;
        //set speed to randomly to -3 or 3
        this.game.gameState.game.controls.autoRotateSpeed = Math.random() > 0.5 ? -3 : 3;

    }

    stopAutoRotate() {
        //turn off player controls
        this.game.gameState.game.controls.enabled = true;
        //enable orbitcotrols auto rotate
        this.game.gameState.game.controls.autoRotate = false;
    }

    setBallType(type) {
        this.ballType = type;
    }

    update(dt) {

            switch (this.state) {
                case 'idle':

                    break;
                case 'aim':
                    if (this.timer == 0) {
                        this.autoRotate();
                        this.setTargetType();
                    }
                    this.timer += dt;
                    break;
                case 'hit':

                    this.timer += dt;
                    if (this.timer > this.timeToHit * 0.5) {
                        this.stopAutoRotate();
                    }

                    if (this.timer > this.timeToHit) {

                        this.timer = 0;
                        this.state = 'idle';
                        this.game.gameState.hit(this.strength);
                    }
                    break;
            }
        }
    }



export { GameAI };