// Shim layer with setTimeout fallback.
window.requestAnimFrame = (function() {
    "use strict";

    return  window.requestAnimationFrame       || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

// Singleton
var bouncyColors = (function() {
    "use strict";

    var game = document.querySelector("#bouncy-colors");
    var canvas = game.querySelector("canvas");
    var ctx = canvas.getContext("2d");
    var numBalls = 10;
    var balls = [];
    var spriteSheet = new Image();
    spriteSheet.src = "balls.png";
    spriteSheet.length = 2; // Total of images in the sprite sheet.

    function createGameObjects() {
        for (var i = 0; i < numBalls; i++) {

            var ball = {
                radius : 20,

                // When the game starts, all objects are rendered 
                // with the first image from the sprite sheet.
                image : 0,
                direction : Math.floor(Math.random() * (360 + 1)), // Degrees.
                speed : 2
            };

            // JavaScript trig functions expect or return angles in radians.
            var radians = ball.direction * Math.PI / 180;

            // Using trig functions to find the x and y values.
            ball.velocityX = ball.speed * Math.cos(radians);
            ball.velocityY = ball.speed * Math.sin(radians);

            ball.diameter = ball.radius * 2;

            var placeOk = false;

            // Setting new position until the objects don't collide.
            while (!placeOk) {
            
                // Setting the ball position, keeping the limits based on the ball radius instead of its center.
                ball.nextX = Math.floor(Math.random() * (canvas.width - (ball.radius * 2)) + ball.radius);
                ball.nextY = Math.floor(Math.random() * (canvas.height - (ball.radius * 2)) + ball.radius);
                
                placeOk = canStartHere(ball);
            }

            ball.x = ball.nextX;
            ball.y = ball.nextY;

            balls.push(ball); // Populating balls collection.
        }
    }

    // Checking if the game objects start in the same place.
    function canStartHere(ball) {

        for (var i = 0; i < balls.length; i++) {
           if (checkObjectsCollision(ball, balls[i])) {
                return false;
           }
        }

        return true;
    }

    // Collision detection between two objects.
    function checkObjectsCollision(ball1, ball2) {

        // Applying Pythagorean equation to find out the distance 
        // between the objects center and checking if they collide. 
        var dx = ball2.x - ball1.x;
        var dy = ball2.y - ball1.y;
        var distance = Math.sqrt(dx * dx + dy * dy);

        return (distance <= ball1.radius + ball2.radius) ? true : false;
    }

    // Update game objects data.
    function updateObjectsData() {

        for (var i = 0; i < numBalls; i++) {
            balls[i].nextX = balls[i].x + balls[i].velocityX;
            balls[i].nextY = balls[i].y + balls[i].velocityY;
        }
    }

    function checkWallsCollision() {

        for (var i = 0; i < numBalls; i++) {

            // Walls collision detection.
            if (balls[i].nextX + balls[i].radius > canvas.width) {
                balls[i].velocityX = balls[i].velocityX * -1;
                balls[i].nextX = canvas.width - balls[i].radius;
            }

             else if (balls[i].nextX - balls[i].radius < 0) {
                balls[i].velocityX = balls[i].velocityX * -1;
                balls[i].nextX = balls[i].radius;
            }

             else if (balls[i].nextY + balls[i].radius > canvas.height) {
                balls[i].velocityY = balls[i].velocityY * -1;
                balls[i].nextY = canvas.height - balls[i].radius;
            }

             else if (balls[i].nextY - balls[i].radius < 0) {
                balls[i].velocityY = balls[i].velocityY * -1;
                balls[i].nextY = balls[i].radius;
            }  
        }
    }    

    // Draw the screen relying on objects data.
    function drawObjects() {

        // Cleaning screen.
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (var i = 0; i < numBalls; i++) {
            var radius = balls[i].radius;
            var radians = balls[i].direction * Math.PI / 180;

            balls[i].x = balls[i].nextX;
            balls[i].y = balls[i].nextY;

            // Drawing the ball.
            // ctx.beginPath();
            // ctx.arc(balls[i].x, balls[i].y, balls[i].radius, 0, 2 * Math.PI);
            // ctx.fillStyle = balls[i].color;
            // ctx.fill();
            // ctx.closePath();

            ctx.drawImage(
                spriteSheet, 

                // Slicing the image from the sprite sheet.
                0 + balls[i].image, // X coordinate.
                0, // Y coordinate.
                spriteSheet.width / spriteSheet.length, // Width.
                spriteSheet.height, // Height.

                // Drawing it on the canvas.
                balls[i].x - radius, // X coordinate.
                balls[i].y - radius, // Y coordinate.
                balls[i].diameter, // Width.
                balls[i].diameter // Height.
            );
        }
    }

    function bindEvents() {

        function checkObjectClick(e) {

            // Mouse coordinates.
            var mouseX = e.offsetX || e.pageX - e.target.offsetLeft; 
            var mouseY = e.offsetY|| e.pageY - e.target.offsetTop; 
            var shorterDistance = 999999;
            var clickedBall = null;

            for (var i = 0; i < numBalls; i++) {
    
                var radians = balls[i].direction * Math.PI / 180;
                
                // Applying Pythagorean equation to find the distance 
                // between the click and the center of the hit area circle. 
                var dx = mouseX - balls[i].x; // Δx.
                var dy = mouseY - balls[i].y; // Δy.
                var distance = Math.sqrt(dx * dx + dy * dy); // Distance.

                // Avoiding two circles of being selected in the same click.
                if (distance <= balls[i].radius && distance < shorterDistance) {
                    clickedBall = balls[i];
                    shorterDistance = distance; // Let's keep the shorter distance value to decide which ball was clicked.
                }
            }

            if (clickedBall) {

                // Setting the new image for the ball.
                clickedBall.image = (clickedBall.image ? 0 : 1) * spriteSheet.width / spriteSheet.length;
            }
        }

        canvas.addEventListener("mousedown", checkObjectClick, false);
    }

    function setGameCycle() {

        window.requestAnimFrame(setGameCycle);
        updateObjectsData();
        checkWallsCollision();
        drawObjects();
    }

    return {
        init : function() {

            createGameObjects();
            drawObjects(); // Drawing the initial state.
            bindEvents();
            setGameCycle();
        }
    };
})();

bouncyColors.init();