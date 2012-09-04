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

    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length; x++) {
        if (ctx[vendors[x] + 'ImageSmoothingEnabled']) {
            ctx[vendors[x] + 'ImageSmoothingEnabled'] = false;
        }
    }

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
            ball.mass = ball.diameter;

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
        var dx = ball2.nextX - ball1.nextX;
        var dy = ball2.nextY - ball1.nextY;
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

    function collide() {

        for (var i = 0; i < balls.length; i++) {
            for (var j = i + 1; j < balls.length; j++) {
                if (checkObjectsCollision(balls[i], balls[j])) {
                    collideBalls(balls[i], balls[j]);
                }
            }
        }
    }

    function collideBalls(ball1,ball2) {
        
        // Calculating the difference between the center points of each ball.
        var dx = ball1.nextX - ball2.nextX; 
        var dy = ball1.nextY - ball2.nextY;

        // Finding the angle of the collision (or line of action) between the two balls.
        // We need this value so that we can determine how the balls will react when they collide.
        var collisionAngle = Math.atan2(dy, dx);

        // Calculating the velocity vector for each ball given the x and y velocities that
        // existed before the collision occurred.
        var speed1 = Math.sqrt(ball1.velocityX * ball1.velocityX + ball1.velocityY * ball1.velocityY);
        var speed2 = Math.sqrt(ball2.velocityX * ball2.velocityX + ball2.velocityY * ball2.velocityY);

        // Calculating the angles (in radians) for each ball given its current velocities.
        var direction1 = Math.atan2(ball1.velocityY, ball1.velocityX); 
        var direction2 = Math.atan2(ball2.velocityY, ball2.velocityX);

        // We need to rotate the vectors counterclockwise so that we can plug those values 
        // into the equation for conservation of momentum. Basically, we are taking the angle 
        // of collision and making it flat so we can bounce the balls.
        var velocityX_1 = speed1 * Math.cos(direction1 - collisionAngle); 
        var velocityY_1 = speed1 * Math.sin(direction1 - collisionAngle); 
        var velocityX_2 = speed2 * Math.cos(direction2 - collisionAngle); 
        var velocityY_2 = speed2 * Math.sin(direction2 - collisionAngle);

        // We take the mass values of each ball and update their x and y velocities based on 
        // the law of conservation of momentum. Actually, only the x velocity needs to be updated,
        // the y velocity remains constant.
        var final_velocityX_1 = ((ball1.mass - ball2.mass) * velocityX_1 + (ball2.mass + ball2.mass) * velocityX_2)/(ball1.mass + ball2.mass);
        var final_velocityX_2 = ((ball1.mass + ball1.mass) * velocityX_1 + (ball2.mass - ball1.mass) * velocityX_2)/(ball1.mass + ball2.mass);
        var final_velocityY_1 = velocityY_1; 
        var final_velocityY_2 = velocityY_2;

        // After we have our final velocities, we rotate our angles back again so that the collision 
        // angle is preserved.
        ball1.velocityX = Math.cos(collisionAngle) * final_velocityX_1 + Math.cos(collisionAngle + Math.PI/2) * final_velocityY_1; 
        ball1.velocityY = Math.sin(collisionAngle) * final_velocityX_1 + Math.sin(collisionAngle + Math.PI/2) * final_velocityY_1; 
        ball2.velocityX = Math.cos(collisionAngle) * final_velocityX_2 + Math.cos(collisionAngle + Math.PI/2) * final_velocityY_2; 
        ball2.velocityY = Math.sin(collisionAngle) * final_velocityX_2 + Math.sin(collisionAngle + Math.PI/2) * final_velocityY_2;

        // Updating new values for rendering.
        ball1.nextX += ball1.velocityX; 
        ball1.nextY += ball1.velocityY; 
        ball2.nextX += ball2.velocityX; 
        ball2.nextY += ball2.velocityY;
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
        collide();
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