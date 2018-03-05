<template>
  <canvas id="c" />
</template>

<script>
/* eslint-disable */
export default {
  mounted () {
    (function(global) {
        
    // Data type check

    function isObject(value, ignoreArray) {
        return typeof value === 'object' && value !== null;
    }

    function isNumber(value) {
        return typeof value === 'number';
    }

    function isString(value) {
        return typeof value === 'string';
    }

    function isFunction(value) {
        return typeof value === 'function';
    }

    function isArray(value) {
        return Object.prototype.toString.call(value) === '[object Array]';
    }

    function isNull(value) {
        return value === null;
    }

    function isUndefined(value) {
        return typeof value === 'undefined';
    }

    global.isObject = isObject;
    global.isNumber = isNumber;
    global.isString = isString;
    global.isFunction = isFunction;
    global.isArray = isArray;
    global.isNull = isNull;
    global.isUndefined = isUndefined;


    /**
     * extend
     */
    function extend() {
        var target = arguments[0] || {}, o, p;

        for (var i = 1, len = arguments.length; i < len; i++) {
            o = arguments[i];

            if (!isObject(o)) continue;

            for (p in o) {
                target[p] = o[p];
            }
        }

        return target;
    }

    global.extend = extend;


    // Random

    function random(max, min) {
        if (isNaN(Number(max))) return Math.random();
        if (isNaN(Number(min))) min = 0;
        return Math.random() * (max - min) + min;
    }

    function randInt(max, min) {
        if (isNaN(Number(max))) return NaN;
        if (isNaN(Number(min))) min = 0;
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
        
    global.random = random;
    global.random = randInt;

        
    /**
     * Debug
     */
    (function(global) {
        
        var limit = 0;
        var count = 0;
        
        function log() {
            if (limit > 0) {
                if (limit === count) return;
                count++;
            }
            window.console.log.apply(window.console, arguments);
        }
        
        log.limit = function(limitCount) {
            limit = limitCount < 0 ? 0 : limitCount;
        };
        
        global.log = log;
        
    })(window);


    /**
     * Point
     */
    function Point(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    Point.create = function(o, y) {
        if (isArray(o)) return new Point(o[0], o[1]);
        if (isObject(o)) return new Point(o.x, o.y);
        return new Point(o, y);
    };

    Point.add = function(p1, p2) {
        return new Point(p1.x + p2.x, p1.y + p2.y);
    };

    Point.subtract = function(p1, p2) {
        return new Point(p1.x - p2.x, p1.y - p2.y);
    };

    Point.scale = function(p, scaleX, scaleY) {
        if (isObject(scaleX)) {
            scaleY = scaleX.y;
            scaleX = scaleX.x;
        } else if (!isNumber(scaleY)) {
            scaleY = scaleX;
        }
        return new Point(p.x * scaleX, p.y * scaleY);
    };

    Point.equals = function(p1, p2) {
        return p1.x == p2.x && p1.y == p2.y;
    };

    Point.angle = function(p) {
        return Math.atan2(p.y, p.x);
    };

    Point.distance = function(p1, p2) {
        var a = p1.x - p2.x;
        var b = p1.y - p2.y;
        return Math.sqrt(a * a + b * b);
    };

    Point.dot = function(p1, p2) {
        return p1.x * p2.x + p1.y * p2.y;
    };

    Point.cross = function(p1, p2) {
        return p1.x * p2.y - p1.y * p2.x;
    };

    Point.interpolate = function(p1, p2, f) {
        var dx = p2.x - p1.x;
        var dy = p2.y - p1.y;
        return new Point(p1.x + dx * f, p1.y + dy * f);
    };

    // Test
    Point.polar = function(length, radian) {
        return new Point(length * Math.sin(radian), length * Math.cos(radian));
    };

    Point.prototype = {    
        add: function(p) {
            return Point.add(this, p);
        },
        
        subtract: function(p) {
            return Point.subtract(this, p);
        },
        
        scale: function(scaleX, scaleY) {
            return Point.scale(this, scaleX, scaleY);
        },
        
        equals: function(p) {
            return Point.equals(this, p);
        },
        
        angle: function() {
            return Point.angle(this);
        },
        
        distance: function(p) {
            return Point.distance(this, p);
        },
        
        length: function() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        },
        
        set: function(x, y) {
            if (isObject(x)) {
                y = x.y;
                x = x.x;
            }
            
            this.x = x || 0;
            this.y = y || 0;
            
            return this;
        },
        
        offset: function(x, y) {
            if (isObject(x)) {
                y = x.y;
                x = x.x;
            }
            
            this.x += x || 0;
            this.y += y || 0;
            
            return this;
        },
        
        normalize: function(thickness) {
            if (isNull(thickness) || isUndefined(thickness)) {
                thickness = 1;
            }
            
            var length = this.length();
            
            if (length > 0) {
                this.x = this.x / length * thickness;
                this.y = this.y / length * thickness;
            }
            
            return this;
        },
        
        negate: function() {
            this.x *= -1;
            this.y *= -1;
            
            return this;
        },
        
        perp: function() {
            this.x = - y;
            this.y = x;
            
            return this;
        },
        
        clone: function() {
            return Point.create(this);
        },

        toArray: function() {
            return [this.x, this.y];
        },
        
        toString: function() {
            return '(x:' + this.x + ', y:' + this.y + ')';
        }
    };

    global.Point = Point;



    /**
     * Timer
     */
    function Timer(delay, repeatCount) {
        this.delay = delay || 0;
        this.repeatCount = repeatCount || 0;
    }

    Timer.prototype = {
        onTimer: null,
        onTimerComplete: null,
        _running: false,
        _currentCount: 0,
        _timerId: null,
        
        currentCount: function() {
            return this._currentCount;
        },
        
        running: function() {
            return this._running;
        },
        
        start: function() {
            if (this._running && !this.delay) return;
            
            var self = this;
            var timer = function() {
                if (self.onTimer) self.onTimer.call(self);

                if (self.repeatCount) {
                    self._currentCount++;
                    if (self._currentCount === self.repeatCount) {
                        self.stop();
                        if (self.onTimerComplete) self.onTimerComplete.call(self);
                        return;
                    }
                }

                self._timerId = setTimeout(timer, self.delay);
            };
            
            this._timerId = setTimeout(timer, self.delay);
            this._running = true;
        },
        
        stop: function() {
            if (!this._running) return;
            
            clearTimeout(this._timerId);

            this._currentCount = 0;
            this._running = false;
        },
        
        reset: function() {
            this.stop();
            this.start();
        }
    };

    global.Timer = Timer;


    (function(global) {
        /**
         * Random numbers generator
         * 
         * @see http://baagoe.com/en/RandomMusings/javascript/
         */
        
        function Xorshift() {
            var self = this;
            var seeds = (arguments.length) ? Array.prototype.slice.call(arguments) : [new Date().getTime()];
                   
            var x = 123456789;
            var y = 362436069;
            var z = 521288629;
            var w = 88675123;
            var v = 886756453;

            self.uint32 = function() {
                var t = (x ^ (x >>> 7)) >>> 0;
                x = y;
                y = z;
                z = w;
                w = v;
                v = (v ^ (v << 6)) ^ (t ^ (t << 13)) >>> 0;
                return ((y + y + 1) * v) >>> 0;
            };

            self.random = function() {
                return self.uint32() * 2.3283064365386963e-10;
            };

            self.fract53 = function() {
                return self.random() + (self.uint32() & 0x1fffff) * 1.1102230246251565e-16;
            };

            for (var i = 0, len = seeds.length, seed; i < len; i++) {
                seed = seeds[i];
                x ^= mash(seed) * 0x100000000;
                y ^= mash(seed) * 0x100000000;
                z ^= mash(seed) * 0x100000000;
                v ^= mash(seed) * 0x100000000;
                w ^= mash(seed) * 0x100000000;
            }
        }
        
        // Helper
        
        function mash(data) {
            data = data.toString();
            var n = 0xefc8249d;
            for (var i = 0, len = data.length; i < len; i++) {
                n += data.charCodeAt(i);
                var h = 0.02519603282416938 * n;
                n = h >>> 0;
                h -= n;
                h *= n;
                n = h >>> 0;
                h -= n;
                n += h * 0x100000000;
            }
            return (n >>> 0) * 2.3283064365386963e-10;
        }
        
        global.Xorshift = Xorshift;

    })(global);

    (function(global) {
        /**
         * Perlin Noise
         * 
         * @see http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
         * 
         * Tiling Exsample (heavy...)
         * 
         * var perlinNoise = new PerlinNoise();
         * 
         * function tilingNoise2d(x, y, w, h) {
         *     return (perlinNoise.noise(x, y) * (w - x) * (h - y) +
         *         perlinNoise.noise(x - w, y) * x * (h - y) +
         *         perlinNoise.noise(x - w, y - h) * x * y +
         *         perlinNoise.noise(x, y - h) * (w - x) * y) / (w * h);
         * }
         * 
         * function tilingNoise3d(x, y, z, w, h) {
         *     return (perlinNoise.noise(x, y, z) * (w - x) * (h - y) +
         *         perlinNoise.noise(x - w, y, z) * x * (h - y) +
         *         perlinNoise.noise(x - w, y - h, z) * x * y +
         *         perlinNoise.noise(x, y - h, z) * (w - x) * y) / (w * h);
         * }
         */
         
        function PerlinNoise(seed) {
            this.isClassic = PerlinNoise.useClassic;
            extend(this, this.isClassic ? new ClassicNoise(seed) : new SimplexNoise(seed));
        }
        
        PerlinNoise.useClassic = false;
        
        var GRAD3 = [
            [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],  
            [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],  
            [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
        ];
        
        var GRAD4 = [
            [0, 1, 1, 1],  [0, 1, 1, -1],  [0, 1, -1, 1],  [0, 1, -1, -1],
            [0, -1, 1, 1], [0, -1, 1, -1], [0, -1, -1, 1], [0, -1, -1, -1],
            [1, 0, 1, 1],  [1, 0, 1, -1],  [1, 0, -1, 1],  [1, 0, -1, -1],
            [-1, 0, 1, 1], [-1, 0, 1, -1], [-1, 0, -1, 1], [-1, 0, -1, -1],
            [1, 1, 0, 1],  [1, 1, 0, -1],  [1, -1, 0, 1],  [1, -1, 0, -1],
            [-1, 1, 0, 1], [-1, 1, 0, -1], [-1, -1, 0, 1], [-1, -1, 0, -1],
            [1, 1, 1, 0],  [1, 1, -1, 0],  [1, -1, 1, 0],  [1, -1, -1, 0],
            [-1, 1, 1, 0], [-1, 1, -1, 0], [-1, -1, 1, 0], [-1, -1, -1, 0]
        ];
        
        var SIMPLEX = [ 
            [0, 1, 2, 3], [0, 1, 3, 2], [0, 0, 0, 0], [0, 2, 3, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 2, 3, 0],  
            [0, 2, 1, 3], [0, 0, 0, 0], [0, 3, 1, 2], [0, 3, 2, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 3, 2, 0],  
            [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0],  
            [1, 2, 0, 3], [0, 0, 0, 0], [1, 3, 0, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [2, 3, 0, 1], [2, 3, 1, 0],  
            [1, 0, 2, 3], [1, 0, 3, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [2, 0, 3, 1], [0, 0, 0, 0], [2, 1, 3, 0],  
            [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0],  
            [2, 0, 1, 3], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 1, 2], [3, 0, 2, 1], [0, 0, 0, 0], [3, 1, 2, 0],  
            [2, 1, 0, 3], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 1, 0, 2], [0, 0, 0, 0], [3, 2, 0, 1], [3, 2, 1, 0]
        ];
        
        /**
         * ClassicNoise
         */
        function ClassicNoise(seed) {
            this.seed(seed);
        }
        
        ClassicNoise.prototype = {
            _octaves: 4,
            _fallout: 0.5,
            
            seed: function(seed) {
                var random = new Xorshift(seed || new Date().getTime()).random;

                var i;
                var p = [];
                for (i = 0; i < 256; i++) {
                    p[i] = Math.floor(random() * 256);
                }

                var perm = [];
                for (i = 0; i < 512; i++) {
                    perm[i] = p[i & 255];
                }

                this._perm = perm;
            },
            
            octaves: function(octaves) {
                if (!arguments.length) return this._octaves;
                return this._octaves = octaves;
            },

            fallout: function(fallout) {
                if (!arguments.length) return this._fallout;
                return this._fallout = fallout;
            },
            
            noise: function(x, y, z) {
                var result = 0;
                var noise;
                var f = 1;
                var oct = this._octaves;
                var amp = 0.5;
                var fallout = this._fallout;
                
                switch (arguments.length) {
                    case 1  : noise = function() { return this.noise2d(x * f, 0); }; break;
                    case 2  : noise = function() { return this.noise2d(x * f, y * f); }; break;
                    case 3  : noise = function() { return this.noise3d(x * f, y * f, z * f); }; break;
                    default : return result;
                }
                
                for (var i = 0; i < oct; ++i) {
                    result += (1 + noise.call(this)) * amp * 0.5;
                    amp *= fallout;
                    f *= 2;
                }
                
                return result;
            },
            
            noise2d: function(x, y) {
                var X = Math.floor(x); var Y = Math.floor(y);
                x = x - X;             y = y - Y;
                X = X & 255;           Y = Y & 255;
                
                var perm = this._perm;
                
                var gi00 = perm[X + perm[Y]] % 12;
                var gi01 = perm[X + perm[Y + 1]] % 12;
                var gi10 = perm[X + 1 + perm[Y]] % 12;
                var gi11 = perm[X + 1 + perm[Y + 1]] % 12;
                
                var n00 = dot2d(GRAD3[gi00], x, y);
                var n10 = dot2d(GRAD3[gi10], x - 1, y);
                var n01 = dot2d(GRAD3[gi01], x, y - 1);
                var n11 = dot2d(GRAD3[gi11], x - 1, y - 1);
                
                var u = fade(x); var v = fade(y);
                
                var nx0 = mix(n00, n10, u); var nx1 = mix(n01, n11, u);
                
                var nxy = mix(nx0, nx1, v);

                return nxy;
            },
            
            noise3d: function(x, y, z) {
                var X = Math.floor(x); var Y = Math.floor(y); var Z = Math.floor(z);
                x = x - X;             y = y - Y;             z = z - Z;
                X = X & 255;           Y = Y & 255;           Z = Z & 255;
                
                var perm = this._perm;
                
                var gi000 = perm[X + perm[Y + perm[Z]]] % 12;
                var gi001 = perm[X + perm[Y + perm[Z + 1]]] % 12;
                var gi010 = perm[X + perm[Y + 1 + perm[Z]]] % 12;
                var gi011 = perm[X + perm[Y + 1 + perm[Z + 1]]] % 12;
                var gi100 = perm[X + 1 + perm[Y + perm[Z]]] % 12;
                var gi101 = perm[X + 1 + perm[Y + perm[Z + 1]]] % 12;
                var gi110 = perm[X + 1 + perm[Y + 1 + perm[Z]]] % 12;
                var gi111 = perm[X + 1 + perm[Y + 1 + perm[Z + 1]]] % 12;
                
                var n000 = dot3d(GRAD3[gi000], x, y, z);
                var n100 = dot3d(GRAD3[gi100], x - 1, y, z);
                var n010 = dot3d(GRAD3[gi010], x, y - 1, z);
                var n110 = dot3d(GRAD3[gi110], x - 1, y - 1, z);
                var n001 = dot3d(GRAD3[gi001], x, y, z - 1);
                var n101 = dot3d(GRAD3[gi101], x - 1, y, z - 1);
                var n011 = dot3d(GRAD3[gi011], x, y - 1, z - 1);
                var n111 = dot3d(GRAD3[gi111], x - 1, y - 1, z - 1);
                
                var u = fade(x); var v = fade(y); var w = fade(z);
                
                var nx00 = mix(n000, n100, u); var nx01 = mix(n001, n101, u); 
                var nx10 = mix(n010, n110, u); var nx11 = mix(n011, n111, u);
                
                var nxy0 = mix(nx00, nx10, v); var nxy1 = mix(nx01, nx11, v);
                
                var nxyz = mix(nxy0, nxy1, w); 

                return nxyz;
            }
        };
        
        
        /**
         * SimplexNoise
         * 
         * @super ClassicNoise
         */
        function SimplexNoise(seed) {
            this.seed(seed);
        }

        SimplexNoise.prototype = extend({}, ClassicNoise.prototype, {
            noise: function(x, y, z, w) {
                var result = 0;
                var noise;
                var f = 1;
                var oct = this._octaves;
                var amp = 0.5;
                var fallout = this._fallout;
                
                switch (arguments.length) {
                    case 1  : noise = function() { return this.noise2d(x * f, 0); }; break;
                    case 2  : noise = function() { return this.noise2d(x * f, y * f); }; break;
                    case 3  : noise = function() { return this.noise3d(x * f, y * f, z * f); }; break;
                    case 4  : noise = function() { return this.noise4d(x * f, y * f, z * f, w * f); }; break;
                    default : return result;
                }
                
                for (var i = 0; i < oct; ++i) {
                    result += (1 + noise.call(this)) * amp * 0.5;
                    amp *= fallout;
                    f *= 2;
                }
                
                return result;
            },
            
            noise2d: function(x, y) {
                var n0, n1, n2;

                var F2 = 0.5 * (Math.sqrt(3) - 1); 
                var s = (x + y) * F2;
                var i = Math.floor(x + s); var j = Math.floor(y + s);

                var G2 = (3 - Math.sqrt(3)) / 6;
                var t = (i + j) * G2; 
                var X0 = i - t;  var Y0 = j - t; 
                var x0 = x - X0; var y0 = y - Y0;

                var i1, j1;
                if (x0 > y0) {
                    i1 = 1; j1 = 0; 
                } else {
                    i1 = 0; j1 = 1;
                }

                var x1 = x0 - i1 + G2;    var y1 = y0 - j1 + G2; 
                var x2 = x0 - 1 + 2 * G2; var y2 = y0 - 1 + 2 * G2;

                var perm = this._perm;

                var ii = i & 255; var jj = j & 255;
                var gi0 = perm[ii + perm[jj]] % 12; 
                var gi1 = perm[ii + i1 + perm[jj + j1]] % 12; 
                var gi2 = perm[ii + 1 + perm[jj + 1]] % 12;

                var t0 = 0.5 - x0 * x0 - y0 * y0; 
                if (t0 < 0) {
                    n0 = 0; 
                } else { 
                    t0 *= t0;
                    n0 = t0 * t0 * dot2d(GRAD3[gi0], x0, y0);
                }

                var t1 = 0.5 - x1 * x1 - y1 * y1; 
                if (t1 < 0) {
                    n1 = 0; 
                } else { 
                    t1 *= t1; 
                    n1 = t1 * t1 * dot2d(GRAD3[gi1], x1, y1); 
                }

                var t2 = 0.5 - x2 * x2 - y2 * y2; 
                if (t2 < 0) {
                    n2 = 0; 
                } else { 
                    t2 *= t2; 
                    n2 = t2 * t2 * dot2d(GRAD3[gi2], x2, y2); 
                }

                return 70 * (n0 + n1 + n2);
            },
            
            noise3d: function(x, y, z) {
                var n0, n1, n2, n3;
                
                var F3 = 1 / 3;
                var s = (x + y + z) * F3;
                var i = Math.floor(x + s), j = Math.floor(y + s), k = Math.floor(z + s);
                
                var G3 = 1 / 6;
                var t = (i + j + k) * G3; 
                var X0 = i - t;  var Y0 = j - t;  var Z0 = k - t;
                var x0 = x - X0; var y0 = y - Y0; var z0 = z - Z0;
                
                var i1, j1, k1;
                var i2, j2, k2;
                if (x0 >= y0) {
                    if (y0 >= z0) {
                        i1 = 1; j1 = 0; k1 = 0;
                        i2 = 1; j2 = 1; k2 = 0;
                    } else if (x0 >= z0) {
                        i1 = 1; j1 = 0; k1 = 0;
                        i2 = 1; j2 = 0; k2 = 1;
                    } else {
                        i1 = 0; j1 = 0; k1 = 1;
                        i2 = 1; j2 = 0; k2 = 1;
                    }
                } else {
                    if (y0 < z0) {
                        i1 = 0; j1 = 0; k1 = 1;
                        i2 = 0; j2 = 1; k2 = 1;
                    } else if (x0 < z0) {
                        i1 = 0; j1 = 1; k1 = 0;
                        i2 = 0; j2 = 1; k2 = 1;
                    } else {
                        i1 = 0; j1 = 1; k1 = 0;
                        i2 = 1; j2 = 1; k2 = 0;
                    }
                }
                
                var x1 = x0 - i1 + G3;     var y1 = y0 - j1 + G3;     var z1 = z0 - k1 + G3;
                var x2 = x0 - i2 + 2 * G3; var y2 = y0 - j2 + 2 * G3; var z2 = z0 - k2 + 2 * G3;
                var x3 = x0 - 1 + 3 * G3;  var y3 = y0 - 1 + 3 * G3;  var z3 = z0 - 1 + 3 * G3;
                
                var perm = this._perm;
                
                var ii = i & 255; var jj = j & 255; var kk = k & 255;
                var gi0 = perm[ii + perm[jj + perm[kk]]] % 12;
                var gi1 = perm[ii + i1 + perm[jj + j1 + perm[kk + k1]]] % 12;
                var gi2 = perm[ii + i2 + perm[jj + j2 + perm[kk + k2]]] % 12;
                var gi3 = perm[ii + 1 + perm[jj + 1 + perm[kk + 1]]] % 12;
                
                var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
                if (t0 < 0) {
                    n0 = 0;
                } else {
                    t0 *= t0;
                    n0 = t0 * t0 * dot3d(GRAD3[gi0], x0, y0, z0);
                }
                
                var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
                if (t1 < 0) {
                    n1 = 0;
                } else {
                    t1 *= t1;
                    n1 = t1 * t1 * dot3d(GRAD3[gi1], x1, y1, z1);
                }
                
                var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
                if (t2 < 0) {
                    n2 = 0;
                } else {
                    t2 *= t2;
                    n2 = t2 * t2 * dot3d(GRAD3[gi2], x2, y2, z2);
                }
                
                var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
                if (t3 < 0) {
                    n3 = 0;
                } else {
                    t3 *= t3;
                    n3 = t3 * t3 * dot3d(GRAD3[gi3], x3, y3, z3);
                }
                
                return 32 * (n0 + n1 + n2 + n3);
            },
            
            noise4d: function(x, y, z, w) {
                var F4 = (Math.sqrt(5) - 1) / 4;
                var G4 = (5 - Math.sqrt(5)) / 20;
                var n0, n1, n2, n3, n4;
                
                var s = (x + y + z + w) * F4;
                var i = Math.floor(x + s); var j = Math.floor(y + s);
                var k = Math.floor(z + s); var l = Math.floor(w + s);
                var t = (i + j + k + l) * G4;
                var X0 = i - t;  var Y0 = j - t;  var Z0 = k - t;  var W0 = l - t;
                var x0 = x - X0; var y0 = y - Y0; var z0 = z - Z0; var w0 = w - W0;
                
                var c1 = (x0 > y0) ? 32 : 0; var c2 = (x0 > z0) ? 16 : 0; var c3 = (y0 > z0) ? 8 : 0;
                var c4 = (x0 > w0) ? 4 : 0;  var c5 = (y0 > w0) ? 2 : 0;  var c6 = (z0 > w0) ? 1 : 0;
                var c = c1 + c2 + c3 + c4 + c5 + c6;
                
                var i1 = SIMPLEX[c][0] >= 3 ? 1 : 0;
                var j1 = SIMPLEX[c][1] >= 3 ? 1 : 0;
                var k1 = SIMPLEX[c][2] >= 3 ? 1 : 0;
                var l1 = SIMPLEX[c][3] >= 3 ? 1 : 0;
                
                var i2 = SIMPLEX[c][0] >= 2 ? 1 : 0;
                var j2 = SIMPLEX[c][1] >= 2 ? 1 : 0;
                var k2 = SIMPLEX[c][2] >= 2 ? 1 : 0;
                var l2 = SIMPLEX[c][3] >= 2 ? 1 : 0;
                
                var i3 = SIMPLEX[c][0] >= 1 ? 1 : 0;
                var j3 = SIMPLEX[c][1] >= 1 ? 1 : 0;
                var k3 = SIMPLEX[c][2] >= 1 ? 1 : 0;
                var l3 = SIMPLEX[c][3] >= 1 ? 1 : 0;
                
                var x1 = x0 - i1 + G4;
                var y1 = y0 - j1 + G4;
                var z1 = z0 - k1 + G4;
                var w1 = w0 - l1 + G4;
                var x2 = x0 - i2 + 2 * G4;
                var y2 = y0 - j2 + 2 * G4;
                var z2 = z0 - k2 + 2 * G4;
                var w2 = w0 - l2 + 2 * G4;
                var x3 = x0 - i3 + 3 * G4;
                var y3 = y0 - j3 + 3 * G4;
                var z3 = z0 - k3 + 3 * G4;
                var w3 = w0 - l3 + 3 * G4;
                var x4 = x0 - 1 + 4 * G4;
                var y4 = y0 - 1 + 4 * G4;
                var z4 = z0 - 1 + 4 * G4;
                var w4 = w0 - 1 + 4 * G4;
                
                var perm = this._perm;
                
                var ii = i & 255; var jj = j & 255; var kk = k & 255; var ll = l & 255;
                var gi0 = perm[ii + perm[jj + perm[kk + perm[ll]]]] % 32;
                var gi1 = perm[ii + i1 + perm[jj + j1 + perm[kk + k1+perm[ll + l1]]]] % 32;
                var gi2 = perm[ii + i2 + perm[jj + j2 + perm[kk + k2+perm[ll + l2]]]] % 32;
                var gi3 = perm[ii + i3 + perm[jj + j3 + perm[kk + k3+perm[ll + l3]]]] % 32;
                var gi4 = perm[ii + 1 + perm[jj + 1 + perm[kk + 1 + perm[ll + 1]]]] % 32;

                var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
                if (t0 < 0) {
                    n0 = 0;
                } else {
                    t0 *= t0;
                    n0 = t0 * t0 * dot4d(GRAD4[gi0], x0, y0, z0, w0);
                }
                
                var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
                if (t1 < 0) {
                    n1 = 0;
                } else {
                    t1 *= t1;
                    n1 = t1 * t1 * dot4d(GRAD4[gi1], x1, y1, z1, w1);
                }
                
                var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
                if (t2 < 0) {
                    n2 = 0;
                } else {
                    t2 *= t2;
                    n2 = t2 * t2 * dot4d(GRAD4[gi2], x2, y2, z2, w2);
                }
                
                var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
                if (t3 < 0) {
                    n3 = 0;
                } else {
                    t3 *= t3;
                    n3 = t3 * t3 * dot4d(GRAD4[gi3], x3, y3, z3, w3);
                }
                
                var t4 = 0.6 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
                if (t4 < 0) {
                    n4 = 0;
                } else {
                    t4 *= t4;
                    n4 = t4 * t4 * dot4d(GRAD4[gi4], x4, y4, z4, w4);
                }
                
                return 27 * (n0 + n1 + n2 + n3 + n4);
            }
        });
        
        // Common helpers
        
        function dot2d(g, x, y) {
            return g[0] * x + g[1] * y;
        }
        
        function dot3d(g, x, y, z) {
            return g[0] * x + g[1] * y + g[2] * z;
        }
        
        // Simplex helper
        
        function dot4d(g, x, y, z, w) {
            return g[0] * x + g[1] * y + g[2] * z + g[3] * w;
        }
        
        // Classic helpers
        
        function mix(a, b, t) { 
            return (1 - t) * a + t * b; 
        }

        function fade(t) { 
            return t * t * t * (t * (t * 6 - 15) + 10); 
        }
        
        global.PerlinNoise = PerlinNoise;
        
    })(global);


    (function(global) {
        /**
         * Color
         */
        
        /**
         * @see http://www.w3.org/TR/css3-color/
         */
        var KEYWORDS = {
            aliceblue: 'rgb(240, 248, 255)',
            antiquewhite: 'rgb(250, 235, 215)',
            aqua: 'rgb(0, 255, 255)',
            aquamarine: 'rgb(127, 255, 212)',
            azure: 'rgb(240, 255, 255)',
            beige: 'rgb(245, 245, 220)',
            bisque: 'rgb(255, 228, 196)',
            black: 'rgb(0, 0, 0)',
            blanchedalmond: 'rgb(255, 235, 205)',
            blue: 'rgb(0, 0, 255)',
            blueviolet: 'rgb(138, 43, 226)',
            brown: 'rgb(165, 42, 42)',
            burlywood: 'rgb(222, 184, 135)',
            cadetblue: 'rgb(95, 158, 160)',
            chartreuse: 'rgb(127, 255, 0)',
            chocolate: 'rgb(210, 105, 30)',
            coral: 'rgb(255, 127, 80)',
            cornflowerblue: 'rgb(100, 149, 237)',
            cornsilk: 'rgb(255, 248, 220)',
            crimson: 'rgb(220, 20, 60)',
            cyan: 'rgb(0, 255, 255)',
            darkblue: 'rgb(0, 0, 139)',
            darkcyan: 'rgb(0, 139, 139)',
            darkgoldenrod: 'rgb(184, 134, 11)',
            darkgray: 'rgb(169, 169, 169)',
            darkgreen: 'rgb(0, 100, 0)',
            darkgrey: 'rgb(169, 169, 169)',
            darkkhaki: 'rgb(189, 183, 107)',
            darkmagenta: 'rgb(139, 0, 139)',
            darkolivegreen: 'rgb(85, 107, 47)',
            darkorange: 'rgb(255, 140, 0)',
            darkorchid: 'rgb(153, 50, 204)',
            darkred: 'rgb(139, 0, 0)',
            darksalmon: 'rgb(233, 150, 122)',
            darkseagreen: 'rgb(143, 188, 143)',
            darkslateblue: 'rgb(72, 61, 139)',
            darkslategray: 'rgb(47, 79, 79)',
            darkslategrey: 'rgb(47, 79, 79)',
            darkturquoise: 'rgb(0, 206, 209)',
            darkviolet: 'rgb(148, 0, 211)',
            deeppink: 'rgb(255, 20, 147)',
            deepskyblue: 'rgb(0, 191, 255)',
            dimgray: 'rgb(105, 105, 105)',
            dimgrey: 'rgb(105, 105, 105)',
            dodgerblue: 'rgb(30, 144, 255)',
            firebrick: 'rgb(178, 34, 34)',
            floralwhite: 'rgb(255, 250, 240)',
            forestgreen: 'rgb(34, 139, 34)',
            fuchsia: 'rgb(255, 0, 255)',
            gainsboro: 'rgb(220, 220, 220)',
            ghostwhite: 'rgb(248, 248, 255)',
            gold: 'rgb(255, 215, 0)',
            goldenrod: 'rgb(218, 165, 32)',
            gray: 'rgb(128, 128, 128)',
            green: 'rgb(0, 128, 0)',
            greenyellow: 'rgb(173, 255, 47)',
            grey: 'rgb(128, 128, 128)',
            honeydew: 'rgb(240, 255, 240)',
            hotpink: 'rgb(255, 105, 180)',
            indianred: 'rgb(205, 92, 92)',
            indigo: 'rgb(75, 0, 130)',
            ivory: 'rgb(255, 255, 240)',
            khaki: 'rgb(240, 230, 140)',
            lavender: 'rgb(230, 230, 250)',
            lavenderblush: 'rgb(255, 240, 245)',
            lawngreen: 'rgb(124, 252, 0)',
            lemonchiffon: 'rgb(255, 250, 205)',
            lightblue: 'rgb(173, 216, 230)',
            lightcoral: 'rgb(240, 128, 128)',
            lightcyan: 'rgb(224, 255, 255)',
            lightgoldenrodyellow: 'rgb(250, 250, 210)',
            lightgray: 'rgb(211, 211, 211)',
            lightgreen: 'rgb(144, 238, 144)',
            lightgrey: 'rgb(211, 211, 211)',
            lightpink: 'rgb(255, 182, 193)',
            lightsalmon: 'rgb(255, 160, 122)',
            lightseagreen: 'rgb(32, 178, 170)',
            lightskyblue: 'rgb(135, 206, 250)',
            lightslategray: 'rgb(119, 136, 153)',
            lightslategrey: 'rgb(119, 136, 153)',
            lightsteelblue: 'rgb(176, 196, 222)',
            lightyellow: 'rgb(255, 255, 224)',
            lime: 'rgb(0, 255, 0)',
            limegreen: 'rgb(50, 205, 50)',
            linen: 'rgb(250, 240, 230)',
            magenta: 'rgb(255, 0, 255)',
            maroon: 'rgb(128, 0, 0)',
            mediumaquamarine: 'rgb(102, 205, 170)',
            mediumblue: 'rgb(0, 0, 205)',
            mediumorchid: 'rgb(186, 85, 211)',
            mediumpurple: 'rgb(147, 112, 219)',
            mediumseagreen: 'rgb(60, 179, 113)',
            mediumslateblue: 'rgb(123, 104, 238)',
            mediumspringgreen: 'rgb(0, 250, 154)',
            mediumturquoise: 'rgb(72, 209, 204)',
            mediumvioletred: 'rgb(199, 21, 133)',
            midnightblue: 'rgb(25, 25, 112)',
            mintcream: 'rgb(245, 255, 250)',
            mistyrose: 'rgb(255, 228, 225)',
            moccasin: 'rgb(255, 228, 181)',
            navajowhite: 'rgb(255, 222, 173)',
            navy: 'rgb(0, 0, 128)',
            oldlace: 'rgb(253, 245, 230)',
            olive: 'rgb(128, 128, 0)',
            olivedrab: 'rgb(107, 142, 35)',
            orange: 'rgb(255, 165, 0)',
            orangered: 'rgb(255, 69, 0)',
            orchid: 'rgb(218, 112, 214)',
            palegoldenrod: 'rgb(238, 232, 170)',
            palegreen: 'rgb(152, 251, 152)',
            paleturquoise: 'rgb(175, 238, 238)',
            palevioletred: 'rgb(219, 112, 147)',
            papayawhip: 'rgb(255, 239, 213)',
            peachpuff: 'rgb(255, 218, 185)',
            peru: 'rgb(205, 133, 63)',
            pink: 'rgb(255, 192, 203)',
            plum: 'rgb(221, 160, 221)',
            powderblue: 'rgb(176, 224, 230)',
            purple: 'rgb(128, 0, 128)',
            red: 'rgb(255, 0, 0)',
            rosybrown: 'rgb(188, 143, 143)',
            royalblue: 'rgb(65, 105, 225)',
            saddlebrown: 'rgb(139, 69, 19)',
            salmon: 'rgb(250, 128, 114)',
            sandybrown: 'rgb(244, 164, 96)',
            seagreen: 'rgb(46, 139, 87)',
            seashell: 'rgb(255, 245, 238)',
            sienna: 'rgb(160, 82, 45)',
            silver: 'rgb(192, 192, 192)',
            skyblue: 'rgb(135, 206, 235)',
            slateblue: 'rgb(106, 90, 205)',
            slategray: 'rgb(112, 128, 144)',
            slategrey: 'rgb(112, 128, 144)',
            snow: 'rgb(255, 250, 250)',
            springgreen: 'rgb(0, 255, 127)',
            steelblue: 'rgb(70, 130, 180)',
            tan: 'rgb(210, 180, 140)',
            teal: 'rgb(0, 128, 128)',
            thistle: 'rgb(216, 191, 216)',
            tomato: 'rgb(255, 99, 71)',
            turquoise: 'rgb(64, 224, 208)',
            violet: 'rgb(238, 130, 238)',
            wheat: 'rgb(245, 222, 179)',
            white: 'rgb(255, 255, 255)',
            whitesmoke: 'rgb(245, 245, 245)',
            yellow: 'rgb(255, 255, 0)',
            yellowgreen: 'rgb(154, 205, 50)'
        };

        var RE_RGB = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/;
        var RE_RGBA = /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d\.]+)\s*\)$/;
        var RE_HSL = /^hsl\(\s*([\d\.]+)\s*,\s*([\d\.]+)%\s*,\s*([\d\.]+)%\s*\)$/;
        var RE_HSLA = /^hsla\(\s*([\d\.]+)\s*,\s*([\d\.]+)%\s*,\s*([\d\.]+)%\s*,\s*([\d\.]+)\s*\)$/;
        var RE_HEX = /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/; // 6 digit
        
        
        // Global object
        var Color = {
            create: function(str) {
                str = str.replace(/^\s*#|\s*$/g, '');
                str = str.toLowerCase();
                if (KEYWORDS[str]) str = KEYWORDS[str];

                var match;

                // RGB(A)
                if ((match = str.match(RE_RGB) || str.match(RE_RGBA))) {
                    return new Color.RGBA(
                        parseInt(match[1], 10),
                        parseInt(match[2], 10),
                        parseInt(match[3], 10),
                        parseFloat(match.length === 4 ? 1 : match[4])
                    );
                }

                // HSL(A)
                if ((match = str.match(RE_HSL) || str.match(RE_HSLA))) {
                    return new Color.HSLA(
                        parseFloat(match[1]),
                        parseFloat(match[2]),
                        parseFloat(match[3]),
                        parseFloat(match.length === 4 ? 1 : match[4])
                    );
                }

                // Hex
                if (str.length === 3) {
                    // Hex 3 digit -> 6 digit
                    str = str.replace(/(.)/g, '$1$1');
                }
                if ((match = str.match(RE_HEX))) {
                    return new Color.RGBA(
                        parseInt(match[1], 16),
                        parseInt(match[2], 16),
                        parseInt(match[3], 16),
                        1
                    );
                }

                return null;
            },
            
            luminance: function(color) {
                if (color instanceof Color.HSLA) color = color.toRGBA();
                return 0.298912 * color.r + 0.586611 * color.g + 0.114478 * color.b;
            },

            greyscale: function(color) {
                var lum = Color.luminance(color);
                return new Color.RGBA(lum, lum, lum, this.a);
            },

            nagate: function(color) {
                if (color instanceof Color.HSLA) color = color.toRGBA();
                return new Color.RGBA(255 - color.r, 255 - color.g, 255 - color.b, color.a);
            },

            /**
             * @see http://sass-lang.com/docs/yardoc/Sass/Script/Functions.html#mix-instance_method
             */
            mix: function(color1, color2, weight) {
                if (color1 instanceof Color.HSLA) color1 = color1.toRGBA();
                if (color2 instanceof Color.HSLA) color2 = color2.toRGBA();
                if (isNull(weight) || isUndefined(weight)) weight = 0.5;

                var w0 = 1 - weight;
                var w = w0 * 2 - 1;
                var a = color1.a - color2.a;
                var w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2;
                var w2 = 1 - w1;

                return new Color.RGBA(
                    Math.round(color1.r * w1 + color2.r * w2),
                    Math.round(color1.g * w1 + color2.g * w2),
                    Math.round(color1.b * w1 + color2.b * w2),
                    Math.round(color1.a * w0 + color2.a * weight)
                );
            }
        };
        
        /**
         * Color.RGBA
         */
        Color.RGBA = function(r, g, b, a) {
            if (isArray(r)) {
                g = r[1];
                b = r[2];
                a = r[3];
                r = r[0];
            } else if (isObject(r)) {
                g = r.g;
                b = r.b;
                a = r.a;
                r = r.r;
            }
            
            this.r = r || 0;
            this.g = g || 0;
            this.b = b || 0;
            this.a = !isNumber(a) ? 1 : a;
        };
        
        Color.RGBA.prototype = {        
            toHSLA: function() {
                var hsl = rgbToHsl(Math.round(this.r), Math.round(this.g), Math.round(this.b));
                return new Hsla(hsl[0], hsl[1], hsl[2], this.a);
            },
            
            toArray: function() {
                return [Math.round(this.r), Math.round(this.g), Math.round(this.b), this.a];
            },
            
            clone: function() {
                return new Color.RGBA(this);
            },
            
            toString: function() {
                return 'rgba(' + Math.round(this.r) + ', ' + Math.round(this.g) + ', ' + Math.round(this.b) + ', ' + this.a + ')';
            }
        };
        
        
        /**
         * Color.HSLA
         */
        Color.HSLA = function(h, s, l, a) {
            if (isArray(h)) {
                s = h[1];
                l = h[2];
                a = h[3];
                h = h[0];
            } else if (isObject(h)) {
                s = h.s;
                l = h.l;
                a = h.a;
                h = h.h;
            }
            
            this.h = h || 0;
            this.s = s || 0;
            this.l = l || 0;
            this.a = !isNumber(a) ? 1 : a;
        };
        
        Color.HSLA.prototype = {
            toRGBA: function() {
                var rgb = hslToRgb(this.h, this.s, this.l);
                return new Rgba(rgb[0], rgb[1], rgb[2], this.a);
            },
            
            toArray: function() {
                return [this.h, this.s, this.l, this.a];
            },
            
            clone: function() {
                return new Color.HSLA(this);
            },
            
            toString: function() {
                return 'hsla(' + this.h + ', ' + this.s + '%, ' + this.l + '%, ' + this.a + ')';
            }
        };
        
        
        // Helpers
        
        function rgbToHsl(r, g, b) {
            r /= 255;
            g /= 255;
            b /= 255;

            var max = Math.max(r, g, b);
            var min = Math.min(r, g, b);
            var h, s, l;

            l = (max + min) / 2;

            if (max === min) {
                h = s = 0;
            } else {
                var d = max - min;
                switch (max) {
                    case r: h = ((g - b) / d * 60 + 360) % 360; break;
                    case g: h = (b - r) / d * 60 + 120; break;
                    case b: h = (r - g) / d * 60 + 240; break;
                }
                s = l <= 0.5 ? d / (max + min) : d / (2 - max  - min);
            }

            return [h, s * 100, l * 100];
        }
        
        function hslToRgb(h, s, l) {
         s /= 100;
         l /= 100;

            var r, g, b;

            if(s === 0){
                r = g = b = l * 255;
            } else {
                var v2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var v1 = 2 * l - v2;
                r = Math.round(hueToRgb(v1, v2, h + 120) * 255);
                g = Math.round(hueToRgb(v1, v2, h) * 255);
                b = Math.round(hueToRgb(v1, v2, h - 120) * 255);
            }

            return [r, g, b];
        }

        function hueToRgb(v1, v2, vh) {
            vh /= 360;
            if (vh < 0) vh++;
            if (vh > 1) vh--;
            if (vh < 1 / 6) return v1 + (v2 - v1) * 6 * vh;
            if (vh < 1 / 2) return v2;
            if (vh < 2 / 3) return v1 + (v2 - v1) * (2 / 3 - vh) * 6;
            return v1;
        }
        
        global.Color = Color;
        
    })(global);


    // End libs block scope
    })(window);



    /**
     * Using PerlinNoise class
     * Using Point class
     * @see https://jsdo.it/akm2/fhMC
     */

    var DRAG_POINT_NUM = 4;
    var DRAG_POINT_MAX_NUM = 8;
    var CHILD_NUM = 2;
    var BACKGROUND_COLOR = 'rgba(0, 0, 0, 0.8)';
    // var BACKGROUND_COLOR = 'rgba(100, 100, 100, 2)';

    // Color
    var H = 50;
    var S = 50;
    var L_MAX = 120;
    var L_MIN = 40;

    var canvas;
    var context;
    var dragPoints = [];
    var mouse = new Point();
    var baseLine;
    var lightningLine;

    // alias
    var random = Math.random;
    var floor  = Math.floor;

    function init() {
        document.body.style.backgroundColor = BACKGROUND_COLOR;
        canvas = document.getElementById('c');
        
        document.addEventListener('resize', resize, false);
        resize();
            
        var i;
        
        dragPoints.push(new DragPoint(150, 0));
        dragPoints.push(new DragPoint(250, 250));
        
        var baseNoiseOpts      = { base: 10, amplitude: 0.6, speed: 0.02 };
        var lightningNoiseOpts = { base: 90, amplitude: 0.2, speed: 0.05 };
        var childNoiseOpts     = { base: 60, amplitude: 0.8, speed: 0.08 };
        
        baseLine      = new NoiseLine(8,  baseNoiseOpts);
        lightningLine = new NoiseLine(16, lightningNoiseOpts);
        for (i = 0; i < CHILD_NUM; i++) {
            lightningLine.createChild(childNoiseOpts);
        }
        
        // *** Debug
        baseLine.debug = true;
        // *********
        
        setInterval(loop, 1000 / 30);
    }

    function resize(e) {
        canvas.width = 300;
        canvas.height = 200;
        context = canvas.getContext('2d');
        context.lineCap = 'round';
    }

    function mouseMove(e) {
        mouse.set(e.clientX, e.clientY);
        
        var hit = false;
        for (var i = 0, len = dragPoints.length; i < len; i++) {
            if (dragPoints[i].hitTest(mouse)) {
                hit = true;
                break;
            }
        }
        document.body.style.cursor = hit ? 'pointer' : 'default';
    }

    function loop() {
        context.globalCompositeOperation = 'source-over';
        context.fillStyle = BACKGROUND_COLOR;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.globalCompositeOperation = 'lighter';
        
        var i, len, p;
        
        var controls = [];
        for (i = 0, len = dragPoints.length; i < len; i++) {
            p = dragPoints[i];
            p.update();
            p.alpha = p.hitTest(mouse) ? 0.75 : 0.2;
            p.draw(context);
            if (p.dead) {
                dragPoints.splice(i, 1);
                i--;
                len--;
                continue;
            }
            if (!p.dying) {
                controls.push(p);
            }
        }
        
        // 原点からの距離でソート
        controls.sort(sortPoints);
        
        baseLine.update(controls);
        
        lightningLine.update(baseLine.points);
        drawLightningBlur(lightningLine, 25, 10);
        drawLightningLine(lightningLine, 0.75, 1, 1, 5);
        
        lightningLine.eachChild(function(child, i) {
            drawLightningLine(child, 0, 1, 0, 4);
            drawLightningBlur(child, 60, 10);
        });
        
        Color.l = randomRange(L_MIN, L_MAX);
        
        // * debug
        Debug.exec();
    }

    // Array sort callback
    function sortPoints(p1, p2) {
        return p1.length() - p2.length();
    }


    // Lightning draw methods

    function drawLightningLine(line, maxAlpha, minAlpha, maxLineW, minLineW) {
        context.beginPath();
        context.strokeStyle = Color.setAlphaToString(randomRange(minAlpha, maxAlpha));
        context.lineWidth   = randomRange(minLineW, maxLineW);
        line.eachPoints(function(p, i) {
            context[i === 0 ? 'moveTo' : 'lineTo'](p.x, p.y);
        });
        context.stroke();
    }

    function drawLightningBlur(line, blur, maxSize) {
        var dist;
        context.save();
        context.fillStyle = 'rgba(0, 0, 0, 1)';
        context.shadowBlur = blur;
        context.shadowColor = Color.setAlphaToString();
        context.beginPath();
        line.eachPoints(function(p, i, len) {
            dist = len > 1 ? p.distance(this[i === len - 1 ? i - 1 : i + 1]) : 0;
            if (dist > maxSize) dist = maxSize;
            context.moveTo(p.x + dist, p.y);
            context.arc(p.x, p.y, dist, 0, Math.PI * 2, false);
        });
        context.fill();
        context.restore();
    }

    // Helper

    function randomRange(min, max) {
        return random() * (max - min) + min;
    }


    (function(window) {
        //PerlinNoise.useClassic = true;
        var perlinNoise = new PerlinNoise();
        perlinNoise.octaves(3);
        
        /**
         * NoiseLine
         * 
         * @param segmentsNum 制御点間の分割数
         * @param noiseOptions ノイズのオプション
         */
        function NoiseLine(segmentsNum, noiseOptions) {
            this.segmentsNum = segmentsNum;

            this.noiseOptions = extend({
                base: 30,
                amplitude: 0.5,
                speed: 0.002,
                offset: 0
            }, noiseOptions);

            this.points = [];
            this.lineLength = 0;
            this.children = [];
        }

        NoiseLine.prototype = {
            createChild: function(noiseOptions) {
                var child = new NoiseLineChild(this, noiseOptions || this.noiseOptions);
                this.children.push(child);
                return child;
            },
            
            eachChild: function(callback) {
                var children = this.children;
                for (var i = 0, len = children.length; i < len; i++) {
                    callback.call(children, children[i], i, len);
                }
            },

            eachPoints: function(callback) {
                var points = this.points;
                for (var i = 0, len = points.length; i < len; i++) {
                    callback.call(points, points[i], i, len);
                }
            },

            update: function(controls) {
                var i, len;
                
                // 振り幅の係数として使用するため制御点を全て直線で結んだ距離を取得する
                var lineLength = 0;
                for (i = 0, len = controls.length; i < len; i++) {
                    if (i === len - 1) break;
                    lineLength += controls[i].distance(controls[i + 1]);
                }
                this.lineLength = lineLength;
                
                // スプライン曲線を生成してノイズを適用
                this.noise(spline(controls, this.segmentsNum), lineLength);
                
                // *** Debug
                if (Debug.enabled && this.debug) {
                    this.eachPoints(function(p, i) {
                        Debug.addCommand(function() { Debug.point(p.x, p.y, 3, 'blue'); });
                    });
                }
                // *********
                
                // 最短距離を取得
                this.points = shortest(this.points);
                
                // *** Debug
                if (Debug.enabled && this.debug) {
                    this.eachPoints(function(p, i) {
                        Debug.addCommand(function() { Debug.point(p.x, p.y, 3, 'red'); });
                    });
                }
                // *********
                
                // 子を更新
                var children = this.children;
                for (i = 0, len = children.length; i < len; i++) {
                    children[i].update();
                }
            },
            
            noise: function(bases, range) {
                var pointsOld = this.points;
                var points = this.points = [];
                
                var opts = this.noiseOptions;
                var base = opts.base;
                var amp = opts.amplitude;
                var speed = opts.speed;
                var offset = opts.offset += random() * speed;
                
                var p, next, angle, sin, cos, av, ax, ay, bv, bx, by, m, px, py;
                
                for (var i = 0, len = bases.length; i < len; i++) {
                    p = bases[i];
                    next = i === len - 1 ? p : bases[i + 1];

                    angle = next.subtract(p).angle();
                    sin = Math.sin(angle);
                    cos = Math.cos(angle);
                    
                    av = range * perlinNoise.noise(i / base - offset, offset) * 0.5 * amp;
                    ax = av * sin;
                    ay = av * cos;

                    bv = range * perlinNoise.noise(i / base + offset, offset) * 0.5 * amp;
                    bx = bv * sin;
                    by = bv * cos;

                    m = Math.sin(Math.PI * (i / (len - 1)));

                    px = p.x + (ax - bx) * m;
                    py = p.y - (ay - by) * m;

                    points.push(pointsOld.length ? pointsOld.shift().set(px, py) : new Point(px, py));
                    
                    // *** Debug
                    if (Debug.enabled && this.debug) {
                        Debug.addCommand((function(p, angle) {
                            return function() {
                                context.save();
                                context.translate(p.x, p.y);
                                context.rotate(angle);
                                this.line(0, 0, 15, 0, 'pink', 1);
                                this.point(0, 0, 2, 'pink');
                                context.restore();
                            };
                        })(p, angle));
                    }
                    // *********
                }
            }
        };


        /**
         * NoiseLineChild
         * 
         * @super NoiseLine
         */
        function NoiseLineChild(parent, noiseOptions) {
            this.parent = lightningLine;
            this._lastChangeTime = 0;
            NoiseLine.call(this, 0, noiseOptions || lightningLine.noiseOptions);
        }

        NoiseLineChild.prototype = extend({}, NoiseLine.prototype, {
            startStep: 0,
            endStep: 0,
            
            // Clear super class methods
            createChild: undefined,
            eachChild: undefined,

            update: function() {
                var parent = this.parent;
                var plen = parent.points.length;

                // 一定時間ごと, あるいは親のポイントの数が子の終了ステップ位置を下回った場合に始点と終点の親からの取得位置を更新する
                var currentTime = new Date().getTime();
                if (
                    currentTime - this._lastChangeTime > 10000 * random()
                    || plen < this.endStep
                ) {
                    var stepMin = floor(plen / 10);
                    var startStep = this.startStep = floor(random() * floor(plen / 3 * 2));
                    this.endStep = startStep + stepMin + floor(random() * (plen - startStep - stepMin) + 1);
                    this._lastChangeTime = currentTime;
                }

                // 親のポイント配列から取得範囲を切り出す
                var range = parent.points.slice(this.startStep, this.endStep);
                var rangeLen = range.length;
                
                // 範囲からスプライン曲線の制御点を取得する
                var sep = 2; // 分割数
                var seg = (rangeLen - 1) / sep;
                var controls = [];
                var i, j;
                for (i = 0; i <= sep; i++) {
                    j = Math.floor(seg * i);
                    controls.push(range[j]);
                }
                
                // *** Debug
                if (Debug.enabled) {
                    (function() {
                        for (var i = 0, len = controls.length - 1, p, n; i < len; i++) {
                            p = controls[i];
                            Debug.addCommand((function(p) {
                                return function() { Debug.point(p.x, p.y, 3, 'yellow'); };
                            })(p));
                        }
                    })();
                }
                // *********
                
                // スプライン曲線を生成
                var base = spline(controls, Math.floor(rangeLen / 3));
                
                // *** Debug
                if (Debug.enabled) {
                    (function() {
                        for (var i = 0, len = base.length - 1, p, n; i < len; i++) {
                            p = base[i];
                            n = base[i + 1];
                            Debug.addCommand((function(p, n) {
                                return function() { Debug.line(p.x, p.y, n.x, n.y, 'yellow', 1); };
                            })(p, n));
                        }
                    })();
                }
                // *********
                
                // ノイズを適用
                this.noise(base, controls[0].distance(controls[2]));
                // 最短距離を取得
                this.points = shortest(this.points);
            }
        });
        
        function spline(controls, segmentsNum) {
            // スプライン補完用に配列の前後にラインの始点, 終点の参照をそれぞれ複製する
            controls.unshift(controls[0]);
            controls.push(controls[controls.length - 1]);

            // スプライン曲線のポイントを取得
            var points = [];
            var p0, p1, p2, p3, t;
            var j;
            for (var i = 0, len = controls.length - 3; i < len; i++) {
                p0 = controls[i];
                p1 = controls[i + 1];
                p2 = controls[i + 2];
                p3 = controls[i + 3];
                
                for (j = 0; j < segmentsNum; j++) {
                    t = (j + 1) / segmentsNum;
                    
                    points.push(new Point(
                        catmullRom(p0.x, p1.x, p2.x, p3.x, t),
                        catmullRom(p0.y, p1.y, p2.y, p3.y, t)
                    ));
                }
            }

            // 補完用に追加した参照を削除
            controls.pop();
            // 削除のついでに描画の始点として追加
            points.unshift(controls.shift());
            
            return points;
        }
        
        /**
         * Catmull-Rom Spline Curve
         * 
         * @see http://l00oo.oo00l.com/blog/archives/264
         */
        function catmullRom(p0, p1, p2, p3, t) {
            var v0 = (p2 - p0) / 2;
            var v1 = (p3 - p1) / 2;
            return (2 * p1 - 2 * p2 + v0 + v1) * t * t * t
                + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t * t + v0 * t + p1;
        }
        
        function shortest(bases) {
            var points = [bases[0]];
            var p, j, p2, dist, minDist, k;
            for (var i = 0, len = bases.length; i < len; i++) {
                p = bases[i];

                minDist = Infinity;
                k = -1;
                for (j = i; j < len; j++) {
                    if ((p2 = bases[j]) !== p && (dist = p.distance(p2)) < minDist) {
                        minDist = dist;
                        k = j;
                    }
                }
                if (k < 0) break;

                points.push(bases[k]);
                i = k - 1;
            }

            return points;
        }
        
        window.NoiseLine = NoiseLine;
        
    })(window);


    /**
     * DragPoint
     * 
     * @super Point https://jsdo.it/akm2/fhMC
     */
    function DragPoint(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.alpha = 0;
        this.dragging = false;
        this.dying = false;
        this.dead = false;
        
        this._v = new Point(0, 0);
        
        this._mouse = null;
        this._latestMouse = new Point();
        this._mouseDist = null;
        
        this._currentAlpha = 0;
        this._currentRadius = 0;
    }

    DragPoint.prototype = extend({}, Point.prototype, {
        hitTest: function(mouse) {
            return this.distance(mouse) < this.radius;
        },

        dragStart: function(mouse) {
            if (this.hitTest(mouse)) {
                this._mouse = mouse;
                this._mouseDist = this.subtract(this._mouse);
                this.dragging = true;
            }
            return this.dragging;
        },

        dragEnd: function() {        
            if (this.dragging && this._latestMouse) {
                this._v.set(this._mouse.subtract(this._latestMouse));
            }
            this.dragging = false;
            this._mouse = this._mouseDist = null;
        },
        
        kill: function() {
            this.dying = true;
            this.radius = 0;
        },

        update: function(mouse) {
            var v = this._v;
            
            if (this._mouse) {
                this.set(this._mouse.add(this._mouseDist));
                this._latestMouse.set(this._mouse);
            } else {
                this.offset(v);
                v.x *= 0.97;
                v.y *= 0.97;
                
                var vlen = v.length();
                if (vlen > 30) {
                    v.normalize(30);
                } else if (vlen < 1) {
                    v.normalize(1);
                }
            }
            
            var radius = this.radius;

            if (this.x < radius) {
                this.x = this.radius;
                if (v.x < 0) v.x *= -1;
            } else if (this.x > canvas.width - radius) {
                this.x = canvas.width - radius;
                if (v.x > 0) v.x *= -1;
            }

            if (this.y < radius) {
                this.y = radius;
                if (v.y < 0) v.y *= -1;
            } else if (this.y > canvas.height - radius) {
                this.y = canvas.height - radius;
                if (v.y > 0) v.y *= -1;
            }
            
            var d;
            // Alpha
            d = this.alpha - this._currentAlpha;
            if ((d < 0 ? -d : d) > 0.001) this._currentAlpha += d * 0.1;
            // Radius
            d = radius - this._currentRadius;
            if ((d < 0 ? -d : d) > 0.01) {
                this._currentRadius += d * 0.35;
            } else if (this.dying) {
                this.dead = true;
            }
            this._currentRadius *= randomRange(0.9, 1);
        },

        draw: function(ctx) {
            var radius = this._currentRadius;
            var gradient = ctx.createRadialGradient(this.x, this.y, radius / 3, this.x, this.y, radius);
            gradient.addColorStop(0, Color.setAlphaToString(this._currentAlpha));
            gradient.addColorStop(1, Color.setAlphaToString(0));
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(this.x + radius, this.y);
            ctx.arc(this.x, this.y, radius, 0, Math.PI * 2, false);
            ctx.fill();
        }
    });


    /**
     * Color
     */
    var Color = new function() {
        this.h = H;
        this.s = S;
        this.l = L_MAX;
        
        this.setAlphaToString = function(alpha) {
            if (typeof alpha === 'undefined' || alpha === null) {
                return 'hsl(' + this.h + ', ' + this.s + '%, ' + this.l + '%)';
            }
            return 'hsla(' + this.h + ', ' + this.s + '%, ' + this.l + '%, ' + alpha + ')';
        };
    };


    // Init

    //window.onload = function() {
        //init();
    //};

    setTimeout(init, 10);


    // メインスクリプトここまで

    //-----------------------------------------
    // DEBUG
    //-----------------------------------------

    var Debug = {
        enabled: false,
        _commands: [],
        
        addCommand: function(fn) {
            if (this.enabled) this._commands.push(fn);
        },
        
        exec: function() {
            if (this.enabled) {
                var commands = this._commands;
                for (var i = 0, len = commands.length; i < len; i++) {
                    commands[i].call(this);
                }
                this._commands = [];
            }
        },
        
        line: function(x1, y1, x2, y2, color, lineWidth) {
            if (this.enabled) {
                context.save();
                context.globalCompositeOperation = 'source-over';
                context.strokeStyle = color;
                context.lineWidth = !lineWidth ? 1 : lineWidth;
                context.beginPath();
                context.moveTo(x1, y1);
                context.lineTo(x2, y2);
                context.stroke();
                context.restore();
            }
        },
        
        point: function(x, y, radius, color) {
            if (this.enabled) {
                context.save();
                context.globalCompositeOperation = 'source-over';
                context.fillStyle = color;
                context.beginPath();
                context.arc(x, y, radius, 0, Math.PI * 2, false);
                context.fill();
                context.restore();
            }
        }
    };
  } 
} 
</script>

<style lang="stylus">
  canvas
    position relative
    margin-left 15px
    height 250px
    width 300px
</style>
