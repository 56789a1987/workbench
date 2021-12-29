import { Component } from '@angular/core';
import * as clipboard from 'clipboard-polyfill';
import { clamp } from 'lodash';
import { rect, RandStrFlag, randStr } from '../../../utils';

const w = 386, h = 270;

@Component({
	selector: 'app-rand-str',
	templateUrl: './randstr.html',
	styleUrls: ['./randstr.scss']
})
export class AppRandStr {
	readonly size = rect(window.innerWidth / 2 - w / 2 | 0, window.innerHeight / 2 - h / 2 | 0, w, h);
	readonly minSize = rect(0, 0, 386, 244);
	close = () => {};
	flags = RandStrFlag.Number | RandStrFlag.Uppercase | RandStrFlag.Lowercase;
	length = 32;
	result = '';
	get canGenerate() {
		return this.flags > 0 && this.length > 0;
	}
	get canCopy() {
		return !!this.result && this.result.length > 0;
	}
	constructor() {
		this.generate();
	}
	hasFlag(flag: number) {
		return (this.flags & flag) !== 0;
	}
	toggleFlag(flag: number) {
		this.flags ^= flag;
	}
	fixLength() {
		this.length = clamp(this.length, 1, 100000) | 0;
	}

	generate() {
		if (this.canGenerate) this.result = randStr(this.length, this.flags);
	}
	clear() {
		this.result = '';
	}
	copy() {
		if (this.canCopy) clipboard.writeText(this.result);
	}
}
