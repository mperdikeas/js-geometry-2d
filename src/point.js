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


/* The coordinate system assumed by this package is the Cartesian coordinate system as used in Math.
   For those methods that imply some preconceived notion of 'up' and 'down' note that we use
   the standard Math convention of greater ys being higher, and not the inverted convention
   typically used for screen coordinates (greater ys being lower). This is because this library
   lives in Math space, not in "computer screen" space. It is trivial to translate accordingly
   just prior to display.

*/

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

/**
 * Models a rectangle in Cartesian space, not screen space.
 * E.g. greater y-values are considered to be higher, not lower
 *
 */
class Point {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = (x===-0)?0:x; // change negative zeros to ordinary ones
        this.y = (y===-0)?0:y;
    }
    static SEP = '~';
    equals(p2: Point): boolean {
        return this.x===p2.x && this.y===p2.y;
    }
    equalsWithin(p2: Point, tolerance: number): boolean {
        return ((Math.abs(this.x-p2.x)<=tolerance)
             && (Math.abs(this.y-p2.y)<=tolerance));
    }
    toString(): string {
        return `${this.x}${Point.SEP}${this.y}`;
    }

    static fromString(s: string): Point {
        const [x,y]=s.split(Point.SEP);
        return new Point(parseFloat(x),parseFloat(y));
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
    reflectionInGrid(width: number, height: number) {
        const middle: Point = new Point((width-1)/2., (height-1)/2.);
        return this.subtract(middle).opposite().add(middle);
    }

}



exports.inRange = inRange;
exports.Point = Point;

