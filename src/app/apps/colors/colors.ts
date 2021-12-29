import { Component, ViewChild } from '@angular/core';
import { cloneDeep } from 'lodash';
import { ColorsService } from '../../services/colors.service';
import { rect } from '../../../utils';
import { WindowComponent } from 'src/app/window/window.component';

const w = 200, h = 200;

@Component({
	selector: 'app-colors',
	templateUrl: './colors.html',
	styleUrls: ['./colors.scss']
})
export class AppColors {
	@ViewChild(WindowComponent) window!: WindowComponent;
	readonly size = rect(window.innerWidth / 2 - w / 2 | 0, window.innerHeight / 2 - h / 2 | 0, w, h);
	close = () => {};
	fromPrefs = false;
	private lastColors = cloneDeep(this.colors);
	index = 0;
	constructor(private service: ColorsService) { }
	get colors() {
		return this.service.colors;
	}
	set colors(value) {
		this.service.colors = value;
	}
	get previewClass() {
		return `col-${this.index + 1}`;
	}
	get text() {
		const c = this.colors[this.index];
		return `${c[0].toString(16)}${c[1].toString(16)}${c[2].toString(16)}`.toUpperCase();
	}
	updateColors() {
		this.service.applyColors();
	}
	saveColors() {
		this.fromPrefs || this.service.saveColors();
		this.close();
	}
	cancelColors() {
		this.resetColors();
		this.close();
	}
	resetColors() {
		for (let i = 0; i < this.colors.length; i++) {
			this.colors[i][0] = this.lastColors[i][0];
			this.colors[i][1] = this.lastColors[i][1];
			this.colors[i][2] = this.lastColors[i][2];
		}
		this.service.applyColors();
	}
}
