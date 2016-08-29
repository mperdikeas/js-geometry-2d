require('source-map-support').install();
import 'babel-polyfill';
const assert     = require('assert');
import _ from 'lodash';

import {inRange, Point, Vector, Rectangle} from '../lib/point.js';

describe('inRange', function () {
    it('should work' , function () {
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

describe('Rectangle', function() {
    let R1, R2;
    describe('constructor, factory and equals', function() {
        it('should work', function() {
            R1 = new Rectangle(new Point(0,2), new Point(3, 0));
            const R2 = Rectangle.topLeftWidthHeight(new Point(0, 2), 3, 2);
            assert(R1.equal(R2));
        });
    });
    const OUTLINE = [new Point(0,0), new Point(0, 1), new Point (0,2), new Point (1, 2), new Point (2,2), new Point (3,2), new Point(3, 1), new Point (3, 0), new Point (2, 0), new Point (1,0)];
    const INSIDE = [new Point(0.1,0.1), new Point(0.1, 1), new Point (0.1,1.9), new Point (1, 1.9), new Point (2,1.9), new Point (2.9,1.9), new Point(2.9, 1), new Point (2.9, 0.1), new Point (2, 0.1), new Point (1,0.1)];
    const OUTSIDE = [new Point(-0.1,-0.1), new Point(-0.1, 1), new Point (-0.1,2.1), new Point (1, 2.1), new Point (2,2.1), new Point (3.1,2.1), new Point(3.1, 1.1), new Point (3.1, -0.1), new Point (2, -0.1), new Point (1,-0.1)];

    describe('lying functions', function() {
        it('should work', function() {
            OUTLINE.forEach( (p)=> {
                assert(R1.pointLiesInside(p));
                assert(!R1.pointLiesSafelyInside(p));
                assert( R1.pointLiesOutside(p));
                assert(!R1.pointLiesSafelyOutside(p));                                
                assert( R1.pointLiesOnEdge(p));
            });
            INSIDE.forEach( (p)=> {
                assert(R1.pointLiesInside(p));
                assert(R1.pointLiesSafelyInside(p));
                assert(!R1.pointLiesOutside(p));
                assert(!R1.pointLiesSafelyOutside(p));                                
                assert(!R1.pointLiesOnEdge(p));
            });
            OUTSIDE.forEach( (p)=> {
                assert(!R1.pointLiesInside(p));
                assert(!R1.pointLiesSafelyInside(p));
                assert( R1.pointLiesOutside(p));
                assert( R1.pointLiesSafelyOutside(p));                                
                assert(!R1.pointLiesOnEdge(p));
            });                        
        });
    });

    describe('four corners', function() {
        it('should work', function() {
            const fc = R1.fourCorners();
            const fcExpected = {topLeft: new Point(0,2),
                                topRight: new Point(3,2),
                                bottomRight: new Point(3,0),
                                bottomLeft: new Point(0,0)};
            assert.equal(JSON.stringify(fc), JSON.stringify(fcExpected));
        });
    });


    describe('containsRectangle', function() {
        const R1_OUT = new Rectangle(new Point(-0.1,2.1), new Point(3.1, -0.1));
        const R1_IN  = [new Rectangle(new Point(0.1,2), new Point(3, 0))
                         , new Rectangle(new Point(0,1.9), new Point(3, 0))
                         , new Rectangle(new Point(0,2), new Point(2.9, 0))
                        , new Rectangle(new Point(0,2), new Point(3, 0.1))];
        const R1_ALLOUT  = [new Rectangle(new Point(-0.1,2.1), new Point(3.1, -0.1))];

        
        it('should work #1', function() {
            [true, false].forEach( (b)=> {
                assert( R1_OUT  .containsRectangle(R1, b));
                assert(!R1      .containsRectangle(R1_OUT, b));
            });
        });
        it('should work #2', function() {
            [true, false].forEach( (b)=> {
                R1_IN.forEach( (r)=> {
                    assert(!r  .containsRectangle(R1, b));
                    assert(!R1 .containsRectangle(r, false));
                    assert( R1 .containsRectangle(r, true));
                });
            });
        });
        it('should work #3', function() {
            [true, false].forEach( (b)=> {
                R1_ALLOUT.forEach( (r)=> {
                    assert(r   .containsRectangle (R1 , b));
                    assert(!R1 .containsRectangle(r, b));
                });
            });
        });        
    });
});
