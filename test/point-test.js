require('source-map-support').install();
import 'babel-polyfill';
const assert     = require('assert');
import _ from 'lodash';

import {inRange, Point} from '../lib/index.js';

describe('inRange', function () {
    it('should work as expected' , function () {
        [true, false].forEach( (b1)=> {
            [true, false].forEach( (b2) => {
                assert(!inRange(-0.00000000001, 0, 1, b1, b2));
                assert( inRange(0.9999,0,1, b1, b2));
                assert(!inRange(1,1,0,1, b1, b2));
                assert( inRange(2,1,3, b1, b2));
                assert(!inRange(2,3,1, b1, b2));
            });
        });
        assert( inRange(0,0,1, true, true));
        assert( inRange(0,0,1, true, false));
        assert( !inRange(0,0,1, false, true));
        assert( !inRange(0,0,1, false, false));
    });
});

describe('Point', function () {
    describe('constructor', function () {
        it('should work as expected', function () {
            const p = new Point(1,3);
            const expected = new Point(1,3);
            assert(_.isEqual(p, expected));
            assert(p.equals(expected));
            assert(expected.equals(p));
        });
        it('should work as expected #2', function() {
            const points = [{x: 1, y:2}, {x: 0, y:5}, {x:6, y:7}, {x:0, y:8}, {x:0, y:8}, {x:8, y:7}, {x: 8, y:8}];
            for (let {x,y} of points)
                new Point(x,y);
        });
        it('should work as expected #3', function() {
            const points = [{x: -1, y:2}, {x: 0, y:-1}, {x:-6, y:-7}, {x:0, y:9}, {x:0, y:19}, {x:9, y:7}, {x: 9, y:9}, {x: -234, y:-234}, {x: 23413, y:123}];
            for (let {x,y} of points)
                new Point(x,y);
        });    
    });

    describe('toString', function() {
        it('should work', function() {
            {
                const v = new Point(2,3);
                assert.equal('2~3', v);
            }
            {
                const v = new Point(-22,-303, false);
                assert.equal('-22~-303', v);
            }
        });
    });

    describe('equals', function() {
        it('should work', function() {
            const v1 = new Point(1,2);
            const v2 = new Point(1,2);
            assert(v1!==v2);
            assert(v1.equals(v2));
            assert(v2.equals(v1));
        });
    });

    describe('fromString', function() {
        it('should work', function() {
            const values = [['2~3', true, new Point(2,3)],
                            ['-23~-3', false, new Point(-23, -3, false)],
                            ['-23~-30', false, new Point(-23, -30, false)]];
            values.forEach( ([s,strict, v2]) => {
                const v1 = Point.fromString(s, strict);
                assert(v1.equals(v2));
                assert(v2.equals(v1));
            });
        });
    });
    
    describe('reflectionInGrid', function() {
        const sixPacks = [ [0,0,1,1,0,0], [0,0,1,2,0,1], [0,0,1,3,0,2], [1,0,2,1,0,0]
                           , [1,0,2,2,0,1],[1,0,2,3,0,2], [2,3,3,4,0,0], [1,4,2,5,0,0]
                           , [1,4,2,6,0,1],[1,4,5,6,3,1], [1,4,6,6,4,1] ];
        it('should work', function() {
            for (let [a,b,c,d,e,f,g] of sixPacks) {
                const p = new Point(a,b);
                const p2 = p.reflectionInGrid(c,d);
                assert(p2.equals(new Point(e,f)));
            }
        });
    });
    describe('toString-fromString', function() {
        it('should work', function() {
            const ps = [new Point(-3,3.2234), new Point(-1234.3, 23.23), new Point(-Infinity, Infinity), new Point(0,0), new Point(3,2), new Point(1.00000000000000001, -234.00000000000000), new Point(0.0, 0.00000)];
            ps.forEach( (p) => {
                assert(Point.fromString(p.toString()).equals(p));
            });
        });
    });
    describe('rotate90Right', function () {
        it('should work'
           , function () {
               const p = new Point(1,3);
               const expected = new Point(-3, 1);
               assert(p.rotate90Right().equals(expected));
               assert(_.isEqual(p.rotate90Right(), expected));
           });     
    });
    describe('rotate90Left', function () {
        it('should work'
           , function () {
               const p = new Point(1,3);
               const expected = new Point(3, -1);
               assert(p.rotate90Left().equals(expected));
               assert(_.isEqual(p.rotate90Left(), expected));
           });     
    });
    describe('rotate90Left and rotate90Right', function () {
        it('should cancel each other out', function () {
            const p = new Point(Math.random()*10-5, Math.random()*10-5);
            const p2 = p.rotate90Right().rotate90Left();
            const p3 = p.rotate90Left().rotate90Right();
            assert(p2.equals(p));
            assert(_.isEqual(p, p2));
            assert(p3.equals(p));
            assert(_.isEqual(p, p3));
        });
        describe ('four of the kind is back where we started', function() {
            it('rotate90Right', function() {
                const p = new Point(Math.random()*10-5, Math.random()*10-5);
                const p2 = p.rotate90Right().rotate90Right().rotate90Right().rotate90Right();
                assert(p2.equals(p));
                assert(_.isEqual(p, p2));
            });
            it('rotate90Left', function() {
                const p = new Point(Math.random()*10-5, Math.random()*10-5);
                const p2 = p.rotate90Left().rotate90Left().rotate90Left().rotate90Left();
                assert(p2.equals(p));
                assert(_.isEqual(p, p2));
            });            
        });
    });
    describe('orientation methods', function() {
        const P = new Point(0,0);        
        it('toTheLeftOf / toTheRightOf', function() {
            [-3,-2,0,2,213].forEach( (x)=> {
                [true, false].forEach( (b) => {
                    assert(P.toTheLeftOf(new Point(0.1, x), b));
                    assert((new Point(0.1, x)).toTheRightOf(P, b));
                });
                assert( P.toTheLeftOf(new Point(0, x), true));
                assert(!P.toTheLeftOf(new Point(0, x), false));
                assert((new Point(0, x)).toTheRightOf(P, true));
                assert(!(new Point(0, x)).toTheRightOf(P), false);
            });
        });
        it('aboveOf / belowOf', function() {
            [-3,-2,0,2,213].forEach( (x)=> {
                [true, false].forEach( (b) => {
                    assert(P.aboveOf(new Point(x, -0.1), b));
                    assert((new Point(x, -0.1)).belowOf(P, b));
                });
                assert( P.aboveOf(new Point(x, 0), true));
                assert(!P.aboveOf(new Point(x, 0), false));
                assert((new Point(x, 0)).belowOf(P, true));
                assert(!(new Point(x, 0)).belowOf(P), false);

            });
        });
    });
});

