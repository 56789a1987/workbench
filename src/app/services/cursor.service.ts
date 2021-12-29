import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

export interface AppCursor {
	colors: number[][];
	bitmap: number[];
	point: number[];
}

export function defaultCursor(): AppCursor {
	return {
		colors: [
			[0xd, 0x2, 0x2], // 1
			[0x0, 0x0, 0x0], // 2
			[0xa, 0xb, 0xc], // 3
		],
		bitmap: [
			2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			2, 3, 3, 3, 3, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			2, 1, 1, 1, 1, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			2, 1, 1, 1, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			2, 1, 1, 1, 1, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			2, 1, 1, 2, 1, 1, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 2, 2, 0, 2, 1, 1, 3, 2, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 2, 1, 1, 3, 2, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 2, 1, 1, 3, 2, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 2, 1, 2, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		],
		point: [1, 1],
	};
}

@Injectable({
	providedIn: 'root'
})
export class CursorService {
	public cursor;
	private canvas?: HTMLCanvasElement;
	private context?: CanvasRenderingContext2D;
	private imageData?: ImageData;
	constructor(private storage: StorageService) {
		this.cursor = this.storage.getObject<AppCursor>('workbench-cursor') || defaultCursor();
		try {
			this.renderCursor();
		} catch (e) {
			console.error(e);
			this.cursor = defaultCursor();
		}
	}
	renderCursor(cursor = this.cursor) {
		const { colors, bitmap } = cursor;
		this.imageData = this.imageData || new ImageData(32, 32);
		this.imageData.data.fill(0);

		if (!this.canvas) {
			this.canvas = document.createElement('canvas');
			this.canvas.width = 32;
			this.canvas.height = 32;
		}

		const colorsArray = [
			[colors[0][0] * 0x11, colors[0][1] * 0x11, colors[0][2] * 0x11, 0xff],
			[colors[1][0] * 0x11, colors[1][1] * 0x11, colors[1][2] * 0x11, 0xff],
			[colors[2][0] * 0x11, colors[2][1] * 0x11, colors[2][2] * 0x11, 0xff],
		];

		for (let i = 0; i < bitmap.length; i++) {
			if (bitmap[i] === 0) {
				continue;
			}

			const x = (i % 16) * 2, y = ((i / 16) | 0) * 2;
			const array = colorsArray[bitmap[i] - 1];
			this.imageData.data.set(array, (x + y * 32) * 4);
			this.imageData.data.set(array, (x + 1 + y * 32) * 4);
			this.imageData.data.set(array, (x + (y + 1) * 32) * 4);
			this.imageData.data.set(array, (x + 1 + (y + 1) * 32) * 4);
		}

		this.context = this.context || this.canvas.getContext('2d')!;
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.putImageData(this.imageData, 0, 0);

		return this.canvas;
	}
	applyCursor() {
		const { point } = this.cursor;
		const dataURL = this.renderCursor().toDataURL();
		document.body.style.setProperty('--cursor', `url('${dataURL}') ${point[0] * 2 - 1} ${point[1] * 2 - 1}`);
	}
	saveCursor() {
		this.storage.setObject('workbench-cursor', this.cursor);
	}
}
