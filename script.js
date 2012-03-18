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
    var balls = new Array(20);

    for (var i = 0; i < balls.length; i++) {
        var ball = {
            radius : 10,
            color : "#0000FF",
            direction : Math.floor(Math.random() * (360 + 1)), // Degrees.
            speed : 10
        };

        ball.x = Math.floor(Math.random() * (canvas.width - (ball.radius * 2)) + ball.radius);
        ball.y = Math.floor(Math.random() * (canvas.height - (ball.radius * 2)) + ball.radius);

        balls[i] = ball;
    }

    // Update game objects data.
    function update() {

        for (var i = 0; i < balls.length; i++) {

            // JavaScript trig functions expect or return angles in radians.
            var radians = balls[i].direction * Math.PI / 180;

            // Using trig functions to find the x and y values.
            balls[i].x += balls[i].speed * Math.cos(radians);
            balls[i].y += balls[i].speed * Math.sin(radians);
        }
    }

    function collide() {

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
    function draw() {
        // Cleaning screen.
        ctx.clearRect(0, 0, 500, 500);

        for (var i = 0; i < balls.length; i++) {
            // Drawing the ball.
            ctx.beginPath();
            ctx.arc(balls[i].x, balls[i].y, balls[i].radius, 0, 2 * Math.PI);
            ctx.fillStyle = ball.color;
            ctx.fill();
        }
    }

    function gameCycle() {
        window.requestAnimFrame(gameCycle);
        update();
        collide();
        draw();
    }

    return {
        init : function() {
            draw();
            gameCycle();
        }
    };
})();

bouncyColors.init();