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
    var tolerance = 4; // Making the player happier. :)

    function createGameObjects() {
        for (var i = 0; i < numBalls; i++) {
            var ball = {
                radius : 20,
                color : "#0000FF",
                direction : Math.floor(Math.random() * (360 + 1)), // Degrees.
                speed : 2
            };

            var placeOk = false;

            // Setting new position until the objects don't collide.
            while (!placeOk) {
            
                // Setting the ball position, keeping the limits based on the ball radius instead of its center.
                ball.x = Math.floor(Math.random() * (canvas.width - (ball.radius * 2)) + ball.radius);
                ball.y = Math.floor(Math.random() * (canvas.height - (ball.radius * 2)) + ball.radius);
                
                placeOk = canStartHere(ball);
            }

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

        var dx = ball2.x - ball1.x;
        var dy = ball2.y - ball1.y;
        var distance = Math.sqrt(dx * dx + dy * dy);

        return (distance <= ball1.radius + ball2.radius) ? true : false;
    }

    // Update game objects data.
    function updateObjectsData() {

        for (var i = 0; i < numBalls; i++) {

            // JavaScript trig functions expect or return angles in radians.
            var radians = balls[i].direction * Math.PI / 180;

            // Using trig functions to find the x and y values.
            balls[i].x += balls[i].speed * Math.cos(radians);
            balls[i].y += balls[i].speed * Math.sin(radians);
        }
    }

    function checkWallsCollision() {

        for (var i = 0; i < numBalls; i++) {

            // Walls collision detection.
            if ( balls[i].x - balls[i].radius <= 0 || balls[i].x + balls[i].radius >= canvas.width) {
                balls[i].direction = 180 - balls[i].direction;
                updateObjectsData();                
            }
            if ( balls[i].y - balls[i].radius <= 0 || balls[i].y + balls[i].radius >= canvas.height) {
                balls[i].direction = 360 - balls[i].direction;
                updateObjectsData();                
            }
        }
    }    

    // Draw the screen relying on objects data.
    function drawObjects() {

        // Cleaning screen.
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (var i = 0; i < numBalls; i++) {

            var radians = balls[i].direction * Math.PI / 180;

            // Drawing the hit area for debug purposes.
            // ctx.beginPath();
            // ctx.arc(
            //     balls[i].x - (tolerance * Math.cos(radians)), 
            //     balls[i].y - (tolerance * Math.sin(radians)), 
            //     balls[i].radius + tolerance, 
            //     0, 2 * Math.PI
            // );
            // ctx.fillStyle = "#FFFF00";
            // ctx.fill();
            // ctx.closePath();
            
            // Drawing the ball.
            ctx.beginPath();
            ctx.arc(balls[i].x, balls[i].y, balls[i].radius, 0, 2 * Math.PI);
            ctx.fillStyle = balls[i].color;
            ctx.fill();
            ctx.closePath();
        }
    }

    function bindEvents() {

        function checkObjectClick(e) {

            // Mouse coordinates.
            var mouseX = e.offsetX; 
            var mouseY = e.offsetY; 
            var shorterDistance = 999999;
            var clickedBall = null;

            for (var i = 0; i < numBalls; i++) {
    
                var radians = balls[i].direction * Math.PI / 180;
                
                // Applying Pythagorean equation to find the distance 
                // between the click and the center of the hit area circle. 
                var dx = mouseX - balls[i].x + (tolerance * Math.cos(radians)); // Δx.
                var dy = mouseY - balls[i].y + (tolerance * Math.sin(radians)); // Δy.
                var distance = Math.sqrt(dx * dx + dy * dy); // Distance.

                // Avoiding two circles of being selected in the same click.
                if ((distance <= balls[i].radius + tolerance) && distance < shorterDistance) {
                    clickedBall = balls[i];
                    shorterDistance = distance; // Let's keep the shorter distance value to decide which ball was clicked.
                }
            }

            if (clickedBall) {
                clickedBall.color = (clickedBall.color === "red") ? "blue" : "red";
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
            drawObjects();
            bindEvents();
            setGameCycle();
        }
    };
})();

bouncyColors.init();