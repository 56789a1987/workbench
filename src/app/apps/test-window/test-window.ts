import { Component } from '@angular/core';
import { random } from 'lodash';
import { rect } from '../../../utils';

const w = 200, h = 100;

@Component({
	selector: 'app-test-window',
	templateUrl: './test-window.html',
	styleUrls: ['./test-window.scss']
})
export class AppTestWindow {
	readonly size = rect(random(0, window.innerWidth - w), random(0, window.innerHeight - h), w, h);
	close = () => { };
	constructor() { }
}
