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

import {Point} from './point.js';

// These are bound, not free, vectors
class Vector {
    from: Point;
    to: Point;
    constructor(from: Point, to: Point) {
        this.from = from;
        this.to = to;
    }
    static ARROW='=>';
    equals(v2: Vector): boolean {
        return this.from.equals(v2.from) && this.to.equals(v2.to);
    }
    equalsWithin(v2: Vector, tolerance: number): boolean {
        return this.from.equalsWithin(v2.from, tolerance) && this.to.equalsWithin(v2.to, tolerance);
    }
    toString(): string {
        return `(${this.from.toString()})${Vector.ARROW}(${this.to.toString()})`;
    }
    static fromString(s: string): Vector {
        let [fromS,toS]=s.split(Vector.ARROW);
        for (let s of [fromS, toS]) {
            assert.equal(s[0], '(');
            assert.equal(s[s.length-1], ')');
        }
        fromS = fromS.slice(1).slice(0, -1);
        toS   =   toS.slice(1).slice(0, -1);
        return new Vector(Point.fromString(fromS)
                          , Point.fromString(toS));
    }    
    isVertical(): boolean {
        return this.from.x === this.to.x;
    }
    isHorizontal(): boolean {
        return this.from.y === this.to.y;
    }
    yProjectionInPlace(): Vector {
        return new Vector(this.from, new Point(this.from.x, this.to.y));
    }
    xProjectionInPlace(): Vector {
        return new Vector(this.from, new Point(this.to.x, this.from.y));
    }
    yDelta(): number {
        return this.to.y - this.from.y;
    }
    xDelta(): number {
        return this.to.x - this.from.x;
    }
    scalarMul(n: number): Vector {
        let delta = new Point(n*this.xDelta(), n*this.yDelta());
        let rv = new Vector(this.from, this.from.add(delta));
        assert(this.from.equals(rv.from), 'scalar multiplication should not change the origin of bound vector');
        return rv;
    }
    asFreeVector(): Point { // a free vector is essentially a 2-tuple that signifies not actual position but displacement
        return new Point(this.xDelta(), this.yDelta());
    }
    
}




exports.Vector = Vector;

