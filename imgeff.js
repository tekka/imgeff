/*
 * imgeff.js v0.1
 *
 * Copyright (c) 2015 Osamu Terada
 * License: MIT 
 */
var userAgent = window.navigator.userAgent.toLowerCase();
var appVersion = window.navigator.appVersion.toLowerCase();


if (!Date.now)
    Date.now = function() { return new Date().getTime(); };

(function() {
    'use strict';

    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
        window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame']
                                   || window[vp+'CancelRequestAnimationFrame']);
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
        || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
        var lastTime = 0;
        window.requestAnimationFrame = function(callback) {
            var now = Date.now();
            var nextTime = Math.max(lastTime + 16, now);
            return setTimeout(function() { callback(lastTime = nextTime); },
                              nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
    }
}());


(function($){
    $.imgeff = function(canvas, effect, options){

        var canvas_elm = $(canvas);

        if( canvas.getContext == undefined ){

            //In the case of legacy browser, replase to imgtag.

            canvas_elm.after("<img src='" + canvas_elm.data("src") + "' />");
            canvas_elm.remove();
            return;
        }

		var ctx = canvas.getContext('2d');
		
		var W = parseInt(canvas_elm.attr("width"));
		var H = parseInt(canvas_elm.attr("height"));
        var draw = function(){};

		var img = new Image();
		img.src = canvas_elm.data("src") + "?" + new Date().getTime();
		
		img.onload = function() {
		
			ctx.drawImage(img, 0, 0);
			
	        function tick(){
	        
	        	draw();

	            tickTimeout = requestAnimationFrame(function(){tick()});
	        }
	        tick();
		};
		
		if( effect == "snow" ){

            (function(){

                var defaults = {
                    mp : 25,
                    color : 'rgba(255, 255, 255, 1)',
                    speed : 1,
                    angle: 0,
                    fluctuation: true
                };
                options = $.extend(defaults, options);

                var mp = options["mp"]; //max particles
                var angle = options["angle"];

                var particles = [];

                for(var i = 0; i < mp; i++)
                {
                    particles.push({
                        x: Math.random()*W, //x-coordinate
                        y: Math.random()*H, //y-coordinate
                        r: Math.random()*4+1, //radius
                        d: Math.random()*mp //density
                    })
                }

                draw = function ()
                {

                    ctx.clearRect(0, 0, W, H);
                    ctx.drawImage(img, 0, 0);

                    ctx.fillStyle = options["color"];

                    ctx.beginPath();
                    for(var i = 0; i < mp; i++)
                    {
                        var p = particles[i];
                        ctx.moveTo(p.x, p.y);
                        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2, true);
                    }
                    ctx.fill();

                    if( options["fluctuation"] ){
                        angle += 0.01;
                    }

                    update();

                };

                var update = function()
                {

                    for(var i = 0; i < particles.length; i++)
                    {
                        var p = particles[i];

                        p.y += Math.cos(angle+p.d) + options["speed"] + p.r/2;
                        p.x += Math.sin(angle) * 2;

                        if(p.x > W+5 || p.x < -5 || p.y > H)
                        {
                            if(i%3 > 0) //66.67% of the flakes
                            {
                                particles[i] = {x: Math.random()*W, y: -10, r: p.r, d: p.d};
                            }
                            else
                            {
                                //If the flake is exitting from the right
                                if(Math.sin(angle) > 0)
                                {
                                    //Enter from the left
                                    particles[i] = {x: -5, y: Math.random()*H, r: p.r, d: p.d};
                                }
                                else
                                {
                                    //Enter from the right
                                    particles[i] = {x: W+5, y: Math.random()*H, r: p.r, d: p.d};
                                }
                            }
                        }
                    }

                };
            })();

		}
		else if( effect == "rain" ){

            (function(){

                var defaults = {
                    mp : 50,
                    colorFrom : 'rgba(100, 200, 255, 0.1)',
                    colorTo : 'rgba(100, 200, 255, 1)',
                    rainLength : 40,
                    speed : 50,
                    angle : -0.2,
                    reloadMsec : 100
                };
                options = $.extend(defaults, options);

                var mp = options["mp"]; //max particles
                var angle = options["angle"];
                var speed = options["speed"];
                var now = Date.now();
                var lastTime = 0;
                var reloadMsec = options["reloadMsec"];
                var nextTime = Math.max(lastTime + reloadMsec, now);

                var particles = [];

                for(var i = 0; i < mp; i++)
                {
                    particles.push({
                        x: Math.random()*W, //x-coordinate
                        y: Math.random()*H, //y-coordinate
                        r: Math.random()*4+1, //radius
                        d: Math.random()*mp //density
                    })
                }

                draw = function()
                {

                    ctx.clearRect(0, 0, W, H);
                    ctx.drawImage(img, 0, 0);

                    for(var i = 0; i < particles.length; i++)
                    {
                        var p = particles[i];

                        var xs = p.x -  Math.sin(angle) * options["rainLength"];
                        var ys = p.y - Math.cos(angle) * options["rainLength"];

                        var grad= ctx.createLinearGradient(xs, ys, p.x, p.y);

                        grad.addColorStop(0, options["colorFrom"]);
                        grad.addColorStop(1, options["colorTo"]);

                        ctx.strokeStyle = grad;

                        ctx.beginPath();

                        ctx.moveTo(p.x, p.y);

                        ctx.lineTo(xs, ys);

                        ctx.stroke();
                    }

                    update();

                };

                var update = function()
                {
                    var now = Date.now();

                    if( nextTime >= now ){
                        return;
                    }
                    lastTime = now;
                    nextTime = Math.max(lastTime + reloadMsec, now);

                    for(var i = 0; i < particles.length; i++)
                    {
                        var p = particles[i];

                        p.x += Math.sin(angle) * options["speed"];
                        p.y += Math.cos(angle) * options["speed"];

                        if(p.x > W+5 || p.x < -5 || p.y - 15 > H)
                        {
                            if(i % 15 > 0)
                            {
                                particles[i] = {x: Math.random()*W, y: Math.random() * H -10, r: p.r, d: p.d};
                            }
                            else
                            {
                                if(Math.sin(angle) > 0)
                                {
                                    particles[i] = {x: -5, y: Math.random()*H, r: p.r, d: p.d};
                                }
                                else
                                {
                                    particles[i] = {x: W+5, y: Math.random()*H, r: p.r, d: p.d};
                                }
                            }
                        }
                    }
                };

            })();

		}
		
    }
    
})(jQuery);
