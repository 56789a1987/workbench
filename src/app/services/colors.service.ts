import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SettingsService } from './settings.service';
import { StorageService } from './storage.service';

export const defaultColors = () => [
	[0x0, 0x5, 0xa],
	[0xf, 0x8, 0x0],
	[0x0, 0x0, 0x2],
	[0xf, 0xf, 0xf],
];

interface ColorSubjectData {
	colors: number[][];
	css: string[];
}

@Injectable({
	providedIn: 'root'
})
export class ColorsService {
	public colors;
	private colorsWarn?: number[][];
	private timer = 0;
	readonly update = new Subject<ColorSubjectData>();
	readonly onMessage = new Subject<string>();
	constructor(private storage: StorageService, private settings: SettingsService) {
		this.colors = this.storage.getObject<number[][]>('workbench-palette') || defaultColors();
		try {
			this.colorsCSS();
		} catch (e) {
			console.error(e);
			this.colors = defaultColors();
		}
	}
	colorsCSS() {
		const colors = this.colorsWarn || this.colors;
		return [
			`rgb(${colors[0][0] * 0x11}, ${colors[0][1] * 0x11}, ${colors[0][2] * 0x11})`,
			`rgb(${colors[1][0] * 0x11}, ${colors[1][1] * 0x11}, ${colors[1][2] * 0x11})`,
			`rgb(${colors[2][0] * 0x11}, ${colors[2][1] * 0x11}, ${colors[2][2] * 0x11})`,
			`rgb(${colors[3][0] * 0x11}, ${colors[3][1] * 0x11}, ${colors[3][2] * 0x11})`,
		];
	}
	colorsArray() {
		const colors = this.colorsWarn || this.colors;
		return [
			[colors[0][0] * 0x11, colors[0][1] * 0x11, colors[0][2] * 0x11],
			[colors[1][0] * 0x11, colors[1][1] * 0x11, colors[1][2] * 0x11],
			[colors[2][0] * 0x11, colors[2][1] * 0x11, colors[2][2] * 0x11],
			[colors[3][0] * 0x11, colors[3][1] * 0x11, colors[3][2] * 0x11],
		];
	}
	applyColors() {
		const colors = this.colorsWarn || this.colors;
		const css = this.colorsCSS();

		css.forEach((e, i) => document.body.style.setProperty(`--col-${i + 1}`, e));
		this.update.next({ colors, css });
	}
	warn(message?: string) {
		window.clearTimeout(this.timer);

		if (message) {
			this.onMessage.next(message);
		}

		if (!this.settings.settings.noFlashing) {
			this.colorsWarn = [...this.colors];
			this.colorsWarn[0] = this.colorsWarn[1];
			this.applyColors();
			this.timer = window.setTimeout(() => {
				this.colorsWarn = undefined;
				this.applyColors();
			}, 100);
		}
	}
	saveColors() {
		this.storage.setObject('workbench-palette', this.colors);
	}
}
