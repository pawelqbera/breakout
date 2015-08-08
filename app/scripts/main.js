(function(){

	'use strict';

	/**
	* Sets up the Game object
	*/
	var Game = function() {	    
		this.canvas = document.getElementById("myCanvas");
		this.ctx = this.canvas.getContext("2d");
		
		this.rightPressed = false;
		this.leftPressed = false;
		
		this.canvasWidth = this.canvas.width;
		this.canvasHeight = this.canvas.height;

		this.c = Game.Config;

		this.ballRadius = this.c.ballRadius;

		this.dx = this.c.dx;
		this.dy = this.c.dy;
		
		this.paddleHeight = this.c.paddleHeight;
		this.paddleWidth = this.c.paddleWidth;
		
		this.rightPressed = this.c.rightPressed;
		this.leftPressed = this.c.leftPressed;
		
		this.brickRowCount = this.c.brickRowCount;
		this.brickColumnCount = this.c.brickColumnCount;
		this.brickWidth = this.c.brickWidth;
		this.brickHeight = this.c.brickHeight;
		this.brickPadding = this.c.brickPadding;
		this.brickOffsetTop = this.c.brickOffsetTop;
		this.brickOffsetLeft = this.c.brickOffsetLeft;
		
		this.score = this.c.score;
		this.lives = this.c.lives;

		/* trzy configi problemowe */
		this.x = this.canvasWidth/2;
		this.y = this.canvasHeight-30;
		this.paddleX = (this.canvasWidth - this.paddleWidth)/2;

		this.bricks = [];
		this.defineBricks();

		document.addEventListener("keydown", this._keyDownHandler.bind(this), false);
		document.addEventListener("keyup", this._keyUpHandler.bind(this), false);
		document.addEventListener("mousemove", this._mouseMoveHandler.bind(this), false);

	    this.init();
	};

	/**
	* Configuration
	*/
	Game.Config = {
		ballRadius : 10,
		dx : 2,
		dy : -2,
		paddleHeight : 10,
		paddleWidth : 75,
		brickRowCount : 5,
		brickColumnCount : 3,
		brickWidth : 75,
		brickHeight : 20,
		brickPadding : 10,
		brickOffsetTop : 30,
		brickOffsetLeft : 30,
		score : 0,
		lives : 3
	};

	/**
	* Initialize the game
	*/
	Game.prototype.init = function() {		
		this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
		
		this.drawBricks();
	    this.drawBall();
	    this.drawPaddle();
	    this.drawScore();
	    this.drawLives();
	    this.collisionDetection();
	 	this.updateFrame();

	    requestAnimationFrame(this.init.bind(this));
	};

	/**
	* 
	*/
	Game.prototype.defineBricks = function() {		
		for(var c = 0; c < this.brickColumnCount; c++) {
		    this.bricks[c] = [];
		    for(var r = 0; r < this.brickRowCount; r++) {
		        this.bricks[c][r] = { x: 0, y: 0, status: 1 };
		    }
		}
	};

	/**
	* Handles updating all variables during the game
	*/
	Game.prototype.updateFrame = function() {
		// Handles the ball's bouncing off the left and right
		if(this.x + this.dx > this.canvasWidth - this.ballRadius || this.x + this.dx < this.ballRadius) {
	        this.dx = this.dx * -1;
	    }
	    // Handle the ball's bouncing off the top
	    if(this.y + this.dy < this.ballRadius) {
	        this.dy = this.dy * -1;
	    }
	    // Handle the ball's bouncing off the bottom
	    else if(this.y + this.dy > this.canvasHeight - this.ballRadius) {
	        // If the ball bounces off the bottom and is in the scope of our paddle,
	        // simply change the direction of the movement and continue playing
	        if(this.x > this.paddleX && this.x < this.paddleX + this.paddleWidth) {
	            this.dy = this.dy * -1;
	        }
	        else {
	        	// If the ball bounces off the bottom and isn't in the scope of the
	        	// paddle, takes live and checks the player's status
				this.lives--;
				if(!this.lives) {
				    // If there are no lives left, alerts the 'Game Over' message
				    // and restarts the game by reloading the page
				    alert("GAME OVER");
				    document.location.reload();
				}
				else {
					// If there are any lives left, restarts the ball's and paddle's
					// position and continue playing
					this.x = this.canvasWidth / 2;
					this.y = this.canvasHeight - 30;
					this.dx = this.c.dx;
					this.dy = this.c.dy;
					this.paddleX = (this.canvasWidth - this.paddleWidth)/2;
				}
	        }
	    }

	    // Updates the variables responsible for the proper paddle position
	    // due to key press events  
	    if(this.rightPressed && this.paddleX < this.canvasWidth - this.paddleWidth) {
	        this.paddleX += 7;
	    }
	    else if(this.leftPressed && this.paddleX > 0) {
	        this.paddleX -= 7;
	    }

	    // Updates the variables responsible for the position of our ball
	    this.x += this.dx;
	    this.y += this.dy;
	};

	/**
	* Handles the key down event of left and right arrows by changing
	* the variable responsible for the state of press
	*/
	Game.prototype._keyDownHandler = function(e) {
	    if(e.keyCode == 39) {
	        this.rightPressed = true;
	    }
	    else if(e.keyCode == 37) {
	        this.leftPressed = true;
	    }
	};

	/**
	* Handles the key up event of left and right arrows by changing
	* the variable responsible for the state of press
	*/
	Game.prototype._keyUpHandler = function(e) {
	    if(e.keyCode == 39) {
	        this.rightPressed = false;
	    }
	    else if(e.keyCode == 37) {
	        this.leftPressed = false;
	    }
	};

	/**
	* Handles the mouse move event by moving the paddle in the correct directon
	*/
	Game.prototype._mouseMoveHandler = function(e) {
	    var relativeX = e.clientX - this.canvas.offsetLeft;
	    if(relativeX > 0 && relativeX < this.canvasWidth) {
	        this.paddleX = relativeX - this.paddleWidth / 2;
	    }
	};

	/**
	* Detects ball's collision with the brick. When the event occurs updates 
	* the score and changes the ball's direction. When the score is equal
	* to bricks, counts end the game 
	*/
	Game.prototype.collisionDetection = function() {
	    for(var c = 0; c < this.brickColumnCount; c++) {
	        for(var r = 0; r < this.brickRowCount; r++) {
	            var b = this.bricks[c][r];
	            if(b.status == 1) {
	                if(this.x > b.x && this.x < b.x + this.brickWidth && this.y > b.y && this.y < b.y + this.brickHeight) {
	                    this.dy = this.dy * -1;
	                    b.status = 0;
	                    this.score++;
	                    if(this.score === this.brickRowCount * this.brickColumnCount) {
	                        alert("YOU WIN, CONGRATS!");
	                        document.location.reload();
	                    }
	                }
	            }
	        }
	    }
	};

	/**
	* Displays the ball by drawing an arc on canvas
	*/
	Game.prototype.drawBall = function() {
	    this.ctx.beginPath();
	    this.ctx.arc(this.x, this.y, this.ballRadius, 0, Math.PI*2);
	   	this.ctx.fillStyle = "#0095DD";
	    this.ctx.fill();
	    this.ctx.closePath();
	};

	/**
	* Displays the paddle by drawing a rectangle on canvas
	*/
	Game.prototype.drawPaddle = function() {
	    this.ctx.beginPath();
	    this.ctx.rect(this.paddleX, this.canvasHeight - this.paddleHeight, this.paddleWidth, this.paddleHeight);
	    this.ctx.fillStyle = "#0095DD";
	    this.ctx.fill();
	    this.ctx.closePath();
	};

	/**
	* Iterate over the bricks array to check if the brick hasn't been destroyed 
	* and display avilable bricks (with the status equal to 1)
	*/
	Game.prototype.drawBricks = function() {
	    for(var c = 0; c < this.brickColumnCount; c++) {
	        for(var r = 0; r < this.brickRowCount; r++) {
	            if(this.bricks[c][r].status === 1) {
	                var brickX = (r*(this.brickWidth + this.brickPadding)) + this.brickOffsetLeft;
	                var brickY = (c*(this.brickHeight + this.brickPadding)) + this.brickOffsetTop;
	                this.bricks[c][r].x = brickX;
	                this.bricks[c][r].y = brickY;
	                this.ctx.beginPath();
	                this.ctx.rect(brickX, brickY, this.brickWidth, this.brickHeight);
	                this.ctx.fillStyle = "#0095DD";
	                this.ctx.fill();
	                this.ctx.closePath();
	            }
	        }
	    }
	};

	/**
	* Displays the current game's result by writing text on canvas
	*/
	Game.prototype.drawScore = function() {
	    this.ctx.font = "16px Arial";
	    this.ctx.fillStyle = "#0095DD";
	    this.ctx.fillText("Score: " + this.score, 8, 20);
	};

	/**
	* Displays the number of lives left by writing text on canvas
	*/
	Game.prototype.drawLives = function() {
	    this.ctx.font = "16px Arial";
	    this.ctx.fillStyle = "#0095DD";
	    this.ctx.fillText("Lives: " + this.lives, this.canvasWidth - 65, 20);
	};

	/**
	* Instantiates a new breakout game
	*/
	var game = new Game();

})();