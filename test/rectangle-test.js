require('source-map-support').install();
import 'babel-polyfill';
const assert     = require('assert');
import _ from 'lodash';

import {Point, Rectangle} from '../lib/index.js';


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
