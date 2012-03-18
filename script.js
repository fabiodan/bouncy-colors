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
    var balls = new Array(10);

    function createGameObjects() {
        for (var i = 0; i < balls.length; i++) {
            var ball = {
                radius : 20,
                color : "#0000FF",
                direction : Math.floor(Math.random() * (360 + 1)), // Degrees.
                speed : 2
            };

            ball.x = Math.floor(Math.random() * (canvas.width - (ball.radius * 2)) + ball.radius);
            ball.y = Math.floor(Math.random() * (canvas.height - (ball.radius * 2)) + ball.radius);

            balls[i] = ball;
        }
    }

    // Update game objects data.
    function updateObjectsData() {

        for (var i = 0; i < balls.length; i++) {

            // JavaScript trig functions expect or return angles in radians.
            var radians = balls[i].direction * Math.PI / 180;

            // Using trig functions to find the x and y values.
            balls[i].x += balls[i].speed * Math.cos(radians);
            balls[i].y += balls[i].speed * Math.sin(radians);
        }
    }

    function checkWallsCollision() {

        for (var i = 0; i < balls.length; i++) {

            // Walls collision detection.
            if ( balls[i].x - balls[i].radius <= 0 || balls[i].x + balls[i].radius >= canvas.width) {
                balls[i].direction = 180 - balls[i].direction;
            }
            if ( balls[i].y - balls[i].radius <= 0 || balls[i].y + balls[i].radius >= canvas.height) {
                balls[i].direction = 360 - balls[i].direction;
            }
        }
    }    

    // Draw the screen relying on objects data.
    function drawObjects() {

        // Cleaning screen.
        ctx.clearRect(0, 0, 500, 500);

        for (var i = 0; i < balls.length; i++) {
            // Drawing the ball.
            ctx.beginPath();
            ctx.arc(balls[i].x, balls[i].y, balls[i].radius, 0, 2 * Math.PI);
            ctx.fillStyle = balls[i].color;
            ctx.fill();
        }
    }

    function bindEvents() {

        function checkObjectClick(e) {
            var x = e.offsetX;
            var y = e.offsetY;

            for (var i = 0; i < balls.length; i++) {
                
                // Applying Pythagorean equation to find the distance 
                // between the click and the center of the circle. 
                var dx = x - balls[i].x; // Δx.
                var dy = y - balls[i].y; // Δy.
                var d = Math.sqrt(dx * dx + dy * dy); // Distance.

                if (d <= balls[i].radius) { // If circle is clicked.
                    balls[i].color = (balls[i].color === "red") ? "blue" : "red";
                }
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