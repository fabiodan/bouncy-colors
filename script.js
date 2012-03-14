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
    var ball = {
        x : 50,
        y : 50,
        radius : 10,
        color : "#0000FF",
        direction : Math.floor(Math.random() * (360 + 1)), // Degrees.
        speed : 5
    };

    // Draw the screen relying on objects data.
    function draw() {
        ctx.beginPath();

        // Cleaning screen.
        ctx.clearRect(0, 0, 500, 500);

        // Drawing ball.
        ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
        ctx.fillStyle = ball.color;
        ctx.fill();
    }

    // Update game objects data.
    function update() {

        // JavaScript trig functions expect or return angles in radians.
        var radians = ball.direction * Math.PI / 180;

        // Using trig functions to find the x and y values.
        ball.x += ball.speed * Math.cos(radians);
        ball.y += ball.speed * Math.sin(radians);
    }

    function collide() {

        // Walls collision detection.
        if ( ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width) {
            ball.direction = 180 - ball.direction;
        }
        if ( ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
            ball.direction = 360 - ball.direction;
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
            gameCycle();
        }
    };
})();

bouncyColors.init();