require('source-map-support').install();
import 'babel-polyfill';
const assert     = require('assert');
import _ from 'lodash';

import {inRange, Point, Vector, Rectangle} from '../lib/index.js';


describe('Vector', function() {

    describe('toString', function() {
        it('should work', function() {
            const v = new Vector(new Point(0,1), new Point(2,3));
            assert.equal(v.toString(), `(0~1)${Vector.ARROW}(2~3)`);
        });
    });

    describe('equals', function() {
        it('should work', function() {
            const v1 = new Vector(new Point(0,1), new Point(2,3));
            const v2 = new Vector(new Point(0,1), new Point(2,3));
            assert(v1!==v2);
            assert(v1.equals(v2));
            assert(v2.equals(v1));
        });
    });

    describe('fromString', function() {
        it('should work', function() {
            const v1 = new Vector(new Point(0,1), new Point(2,3));
            const v2 = Vector.fromString(`(0~1)${Vector.ARROW}(2~3)`);
            assert(v1.equals(v2));
            assert(v2.equals(v1));
        });
        it('should work #2', function() {
            const values=[[`(0~1)${Vector.ARROW}(2~-3)`  , new Vector(new Point(0,1)        , new Point( 2,-3))],
                          [`(0~-1)${Vector.ARROW}(-2~-3)`, new Vector(new Point(0,-1), new Point(-2,-3))]];
            for (let [s, v2] of values) {
                const v1 = Vector.fromString(s, false);
                assert(v1.equals(v2));
                assert(v2.equals(v1));
            }
        });        
    });

    describe('scalarMul', function() {
        it('simple test #1', function() {
            const v1     = new Vector(new Point(0,0), new Point(1,1));
            const v1mul2 = v1.scalarMul(2);
            const v2 = new Vector(new Point(0,0), new Point(2,2));
            assert(v1mul2.equals(v2));
        });
        it('simple test #2', function() {
            const v1     = new Vector(new Point(0,0), new Point(1,1));
            const v1mul2 = v1.scalarMul(0);
            const v2 = new Vector(new Point(0,0), new Point(0,0));
            assert(v1mul2.equals(v2));
        });
        it('mul by 0 invariant', function() {
            for (let i = 0; i < 100; i++) {
                const v = new Vector(new Point(0, 0), new Point(i*Math.random(), i*Math.random()));
                const Z = new Vector(new Point(0, 0), new Point(0, 0));
                const vmul = v.scalarMul(0);
                assert(Z.equals(vmul));
            }
        });
        it('mul by 1 invariant', function() {
            for (let i = 0; i < 100; i++) {
                const v = new Vector(new Point(0, 0), new Point(i*Math.random(), i*Math.random()));
                const vmul = v.scalarMul(1);
                assert(v.equals(vmul));
            }
        });
        it('mul by various invariants for bound vectors starting at origin', function() {
            [-3, -2, 2, 3].forEach(function(s) {
                for (let i = 0; i < 100; i++) {
                    const X = i*Math.random();
                    const Y = i*Math.random();
                    const v = new Vector(new Point(0, 0), new Point(X, Y));
                    const vmul = v.scalarMul(s);
                    const V = new Vector(new Point(0, 0), new Point(s*X, s*Y));
                    assert(V.equals(vmul));
                }
            });
        });

        it('mul by various invariants for bound vectors starting at random points', function() {
            [-3, -2, 2, 3].forEach(function(s) {
                for (let i = 0; i < 100; i++) {
                    const SX = i*Math.random();
                    const SY = i*Math.random();
                    const ORIGIN = new Point(SX, SY);
                    const X = i*Math.random();
                    const Y = i*Math.random();
                    const v = new Vector(ORIGIN, new Point(X, Y));
                    const vmul = v.scalarMul(s);
                    const V = new Vector(ORIGIN, ORIGIN.add(new Point(s*(X-SX), s*(Y-SY))));
                    assert(V.equalsWithin(vmul, Number.EPSILON), `Vector ${vmul} doth not equal ${V} as expected`); // this actually works om my machine for tolerance equal to 0 as well, but it doesn't hurt to specify a tolerance of one, or even a few epsilons
                }
            });
        });        
    });
});

