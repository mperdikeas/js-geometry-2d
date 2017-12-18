// @flow
require('source-map-support').install();

'use strict';

// The rationale behind using this idiom is described in:
//     http://stackoverflow.com/a/36628148/274677
//
if (!global._babelPolyfill) // https://github.com/s-panferov/awesome-typescript-loader/issues/121
    require('babel-polyfill');
// The above is important as Babel only transforms syntax (e.g. arrow functions)
// so you need this in order to support new globals or (in my experience) well-known Symbols, e.g. the following:
//
//     console.log(Object[Symbol.hasInstance]);
//
// ... will print 'undefined' without the the babel-polyfill being required.

import assert from 'assert';
import _      from 'lodash';


import {inRange, Point} from './point.js';

type PositiveNumber = number; // there is no way to associate custom checks with Flow types so this is for documentation mostly


export type FourCorners = {topLeft: Point, topRight: Point, bottomRight: Point, bottomLeft: Point};

class Rectangle {
    topLeft: Point;
    bottomRight: Point;
    constructor(topLeft: Point, bottomRight: Point) {
        this.topLeft = topLeft;
        this.bottomRight = bottomRight;
        assert(topLeft.toTheLeftOf(bottomRight, false));;
        assert(topLeft.aboveOf    (bottomRight, false));
    }
    equal(o: Rectangle) {
        return this.topLeft.equals(o.topLeft) && this.bottomRight.equals(o.bottomRight);
    }
    static topLeftWidthHeight(topLeft: Point, width: PositiveNumber, height: PositiveNumber): Rectangle {
        assert(width>0) && assert(height>0);
        return new Rectangle(topLeft, topLeft.addX(width).addY(-height));
    }
    fourCorners(): FourCorners {
        return {
            topLeft: this.topLeft,
            topRight: new Point(this.bottomRight.x, this.topLeft.y),
            bottomRight: this.bottomRight,
            bottomLeft: new Point(this.topLeft.x, this.bottomRight.y)
        };
    }
    _pointLiesInside(p: Point, includeEdges: boolean): boolean {
        return inRange(p.x, this.topLeft.x    , this.bottomRight.x, includeEdges, includeEdges) &&
               inRange(p.y, this.bottomRight.y, this.topLeft.y    , includeEdges, includeEdges);
    }
    pointLiesInside(p: Point): boolean {
        return this._pointLiesInside(p, true);
    }
    pointLiesSafelyInside(p: Point): boolean {
        return this._pointLiesInside(p, false);
    }
    pointLiesOutside(p: Point): boolean {
        return !this.pointLiesSafelyInside(p);
    }
    pointLiesSafelyOutside(p: Point): boolean {
        return !this.pointLiesInside(p);
    }
    pointLiesOnEdge(p: Point): boolean {
        return this.pointLiesInside(p) && !this.pointLiesSafelyInside(p);
    }
    containsRectangle(r: Rectangle, mayTouchEdge: boolean = true): boolean {
        const fc: FourCorners = r.fourCorners();
        const {topLeft: tl, topRight: tr, bottomRight: br, bottomLeft:bl} = fc;
        return _.every([tl, tr, br, bl], (p: Point) => this._pointLiesInside(p, mayTouchEdge));
    }
}



exports.Rectangle = Rectangle;
