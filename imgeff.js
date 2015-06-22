/*
 * imgeff.js v0.1
 *
 * Copyright (c) 2015 Osamu Terada
 * License: MIT 
 */


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
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent)
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

		var _ctx = canvas.getContext('2d');
		
		var _width = parseInt(canvas_elm.attr("width"));
		var _height = parseInt(canvas_elm.attr("height"));
        var _draw = function(){};

		var _img = new Image();
		_img.src = canvas_elm.data("src") + "?" + new Date().getTime();
		
		_img.onload = function() {
		
			_ctx.drawImage(_img, 0, 0);
			
	        function tick(){
	        
	        	_draw();

	            tick_timeout = requestAnimationFrame(function(){tick()});
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
                var options = $.extend(defaults, options);

                var mp = options["mp"]; //max particles
                var angle = options["angle"];

                var particles = [];

                for(var i = 0; i < mp; i++)
                {
                    particles.push({
                        x: Math.random()*_width, //x-coordinate
                        y: Math.random()*_height, //y-coordinate
                        r: Math.random()*4+1, //radius
                        d: Math.random()*mp //density
                    })
                }

                _draw = function ()
                {

                    _ctx.clearRect(0, 0, _width, _height);
                    _ctx.drawImage(_img, 0, 0);

                    _ctx.fillStyle = options["color"];

                    _ctx.beginPath();
                    for(var i = 0; i < mp; i++)
                    {
                        var p = particles[i];
                        _ctx.moveTo(p.x, p.y);
                        _ctx.arc(p.x, p.y, p.r, 0, Math.PI*2, true);
                    }
                    _ctx.fill();

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

                        if(p.x > _width+5 || p.x < -5 || p.y > _height)
                        {
                            if(i%3 > 0) //66.67% of the flakes
                            {
                                particles[i] = {x: Math.random()*_width, y: -10, r: p.r, d: p.d};
                            }
                            else
                            {
                                //If the flake is exitting from the right
                                if(Math.sin(angle) > 0)
                                {
                                    //Enter from the left
                                    particles[i] = {x: -5, y: Math.random()*_height, r: p.r, d: p.d};
                                }
                                else
                                {
                                    //Enter from the right
                                    particles[i] = {x: _width+5, y: Math.random()*_height, r: p.r, d: p.d};
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
                    color_from : 'rgba(100, 200, 255, 0.1)',
                    color_to : 'rgba(100, 200, 255, 1)',
                    rain_length : 40,
                    speed : 50,
                    angle : -0.2,
                    reloadMsec : 100
                };
                var options = $.extend(defaults, options);

                var mp = options["mp"]; //max particles
                var angle = options["angle"];
                var speed = options["speed"];
                var now = Date.now();
                var last_time = 0;
                var reload_msec = options["reload_msec"];
                var next_time = Math.max(last_time + reload_msec, now);

                var particles = [];

                for(var i = 0; i < mp; i++)
                {
                    particles.push({
                        x: Math.random()*_width, //x-coordinate
                        y: Math.random()*_height, //y-coordinate
                        r: Math.random()*4+1, //radius
                        d: Math.random()*mp //density
                    })
                }

                _draw = function()
                {

                    _ctx.clearRect(0, 0, _width, _height);
                    _ctx.drawImage(_img, 0, 0);

                    for(var i = 0; i < particles.length; i++)
                    {
                        var p = particles[i];

                        var xs = p.x -  Math.sin(angle) * options["rain_length"];
                        var ys = p.y - Math.cos(angle) * options["rain_length"];

                        var grad= _ctx.createLinearGradient(xs, ys, p.x, p.y);

                        grad.addColorStop(0, options["color_from"]);
                        grad.addColorStop(1, options["color_to"]);

                        _ctx.strokeStyle = grad;

                        _ctx.beginPath();

                        _ctx.moveTo(p.x, p.y);

                        _ctx.lineTo(xs, ys);

                        _ctx.stroke();
                    }

                    update();

                };

                var update = function()
                {
                    var now = Date.now();

                    if( next_time >= now ){
                        return;
                    }
                    last_time = now;
                    next_time = Math.max(last_time + reload_msec, now);

                    for(var i = 0; i < particles.length; i++)
                    {
                        var p = particles[i];

                        p.x += Math.sin(angle) * options["speed"];
                        p.y += Math.cos(angle) * options["speed"];

                        if(p.x > _width+5 || p.x < -5 || p.y - 15 > _height)
                        {
                            if(i % 15 > 0)
                            {
                                particles[i] = {x: Math.random()*_width, y: Math.random() * _height -10, r: p.r, d: p.d};
                            }
                            else
                            {
                                if(Math.sin(angle) > 0)
                                {
                                    particles[i] = {x: -5, y: Math.random()*_height, r: p.r, d: p.d};
                                }
                                else
                                {
                                    particles[i] = {x: _width+5, y: Math.random()*_height, r: p.r, d: p.d};
                                }
                            }
                        }
                    }
                };

            })();

		}
		
    }
    
})(jQuery);
