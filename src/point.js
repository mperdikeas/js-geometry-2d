// @flow
require('source-map-support').install();

'use strict';

// The rationale behind using this idiom is described in:
//     http://stackoverflow.com/a/36628148/274677
//
require('babel-polyfill'); // this is important as Babel only transforms syntax (e.g. arrow functions)
// so you need this in order to support new globals or (in my experience) well-known Symbols, e.g. the following:
//
//     console.log(Object[Symbol.hasInstance]);
//
// ... will print 'undefined' without the the babel-polyfill being required.

import assert from 'assert';
import _      from 'lodash';

type F<T,S,U> = (t: T, s: S) => U;

const sq : (x: number)=>number = (x:number):number=>Math.pow(x,2);
const gt : F<number, number, boolean> = (x:number, y:number): boolean => x >  y;
const gte: F<number, number, boolean> = (x:number, y:number): boolean => x >= y;
const lt : F<number, number, boolean> = (x:number, y:number): boolean => x <  y;
const lte: F<number, number, boolean> = (x:number, y:number): boolean => x <= y;

function inRange(x: number, a: number, b: number, includeA: boolean = true, includeB: boolean = false): boolean {
    const aCheck = includeA?gte:gt;
    const bCheck = includeB?lte:lt;
    return aCheck(x, a) && bCheck(x, b);
}

class Point {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    equals(p2: Point): boolean {
        return this.x===p2.x && this.y===p2.y;
    }
    toString(): string {
        return `(${this.x}, ${this.y})`;
    }
    distanceFromStartOfAxes() {
        return Math.sqrt(sq(this.x)+sq(this.y));
    }
    rotate90RightWithoutPivot(): Point {
        return new Point(-this.y, this.x);
    }
    rotate90Right(_pivot: ?Point): Point {
        const pivot: Point = _pivot || new Point(0,0);
        return this.subtract(pivot).rotate90RightWithoutPivot().add(pivot);
    }
    rotate90LeftWithoutPivot(): Point {
        return new Point(this.y, -this.x);
    }
    rotate90Left(_pivot: ?Point): Point {
        const pivot: Point = _pivot || new Point(0,0);
        return this.subtract(pivot).rotate90LeftWithoutPivot().add(pivot);
    }    

    addX(d: number): Point {
        return new Point(this.x+d, this.y);
    }
    addY(d: number): Point {
        return new Point(this.x, this.y+d);
    }    
    add(otherPoint: Point): Point {
        assert(otherPoint instanceof Point);
        return new Point(this.x+otherPoint.x, this.y+otherPoint.y);
    }
    subtract(otherPoint: Point): Point {
        return this.add(otherPoint.opposite());
    }
    opposite(): Point {
        return new Point(-this.x, -this.y);
    }
    toTheLeftOf(o: Point, sameXAllowed: boolean): boolean {
        return (sameXAllowed?lte:lt).call(null, this.x, o.x);
    }
    toTheRightOf(o: Point, sameXAllowed: boolean): boolean {
        return (sameXAllowed?gte:gt).call(null, this.x, o.x);
    }
    aboveOf(o: Point, sameYAllowed: boolean): boolean {
        return (sameYAllowed?gte:gt).call(null, this.y, o.y);
    }
    belowOf(o: Point, sameYAllowed: boolean): boolean {
        return (sameYAllowed?lte:lt).call(null, this.y, o.y);
    }

}

class Vector {
    pointA: Point;
    pointB: Point;
    constructor(pointA: Point, pointB: Point) {
        this.pointA = pointA;
        this.pointB = pointB;
    }
    equals(v2: Vector): boolean {
        return this.pointA.equals(v2.pointA) && this.pointB.equals(v2.pointB);
    }
    toString(): string {
        return `[${this.pointA}->${this.pointB}]`;
    }    
    isVertical(): boolean {
        return this.pointA.x === this.pointB.x;
    }
    isHorizontal(): boolean {
        return this.pointA.y === this.pointB.y;
    }
    yProjectionInPlace(): Vector {
        return new Vector(this.pointA, new Point(this.pointA.x, this.pointB.y));
    }
    xProjectionInPlace(): Vector {
        return new Vector(this.pointA, new Point(this.pointB.x, this.pointA.y));
    }
    yDelta(): number {
        return this.pointB.y - this.pointA.y;
    }
    xDelta(): number {
        return this.pointB.x - this.pointA.x;
    }    
}


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



exports.inRange = inRange;
exports.Point = Point;
exports.Vector = Vector;
exports.Rectangle = Rectangle;
