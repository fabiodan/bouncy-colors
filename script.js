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
        ball.x = ball.x + 5;
    }

    function gameCycle() {
        window.requestAnimFrame(gameCycle);
        draw();
        update();
    }

    return {
        init : function() {
            gameCycle();
        }
    };
})();

bouncyColors.init();