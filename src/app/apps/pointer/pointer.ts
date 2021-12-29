import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { cloneDeep } from 'lodash';
import { rect } from '../../../utils';
import { CursorService } from 'src/app/services/cursor.service';
import { CustomDragEvent } from 'src/app/services/drag.directive';
import { WindowComponent } from 'src/app/window/window.component';

const w = 630, h = 408;

@Component({
	selector: 'app-pointer',
	templateUrl: './pointer.html',
	styleUrls: ['./pointer.scss']
})
export class AppPointer implements AfterViewInit {
	@ViewChild(WindowComponent) window!: WindowComponent;
	@ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
	@ViewChild('previews', { static: true }) previews!: ElementRef<HTMLElement>;
	readonly size = rect(window.innerWidth / 2 - w / 2 | 0, window.innerHeight / 2 - h / 2 | 0, w, h);
	private lastCursor = cloneDeep(this.cursor);
	private context?: CanvasRenderingContext2D;
	close = () => { };
	fromPrefs = false;
	index = 1;
	sliders = this.colors[0];
	setPoint = false;
	constructor(private service: CursorService) { }
	ngAfterViewInit() {
		this.redraw();
	}
	get cursor() {
		return this.service.cursor;
	}
	set cursor(value) {
		this.service.cursor = value;
	}
	get colors() {
		return this.cursor.colors;
	}
	get bitmap() {
		return this.cursor.bitmap;
	}
	get point() {
		return this.cursor.point;
	}
	toCSS(color: number[]) {
		return `rgb(${color[0] * 0x11}, ${color[1] * 0x11}, ${color[2] * 0x11})`;
	}
	clear() {
		this.bitmap.fill(0);
		this.redraw();
	}
	reset(redraw = true) {
		for (let i = 0; i < this.bitmap.length; i++) {
			this.bitmap[i] = this.lastCursor.bitmap[i];
		}
		redraw && this.redraw();
	}
	resetColors(redraw = true) {
		for (let i = 0; i < this.colors.length; i++) {
			this.colors[i][0] = this.lastCursor.colors[i][0];
			this.colors[i][1] = this.lastCursor.colors[i][1];
			this.colors[i][2] = this.lastCursor.colors[i][2];
		}
		redraw && this.redraw();
	}
	ok() {
		this.service.applyCursor();
		this.fromPrefs || this.service.saveCursor();
		this.close();
	}
	cancel() {
		this.reset(false);
		this.resetColors(false);
		this.close();
	}
	setIndex(i: number) {
		this.index = i;
		if (i !== 0) {
			this.sliders = this.colors[i - 1];
		}
	}
	redraw() {
		const source = this.service.renderCursor();
		const canvas = this.canvas.nativeElement;

		this.previews.nativeElement.style.setProperty('--image', `url('${source.toDataURL()}')`);
		this.context = this.context || canvas.getContext('2d')!;
		this.context.imageSmoothingEnabled = false;
		this.context.clearRect(0, 0, canvas.width, canvas.height);
		this.context.save();
		this.context.scale(8, 8);
		this.context.drawImage(source, 0, 0);
		this.context.restore();
	}
	drag(event: CustomDragEvent) {
		event.event?.preventDefault();

		const rect = this.canvas.nativeElement.getBoundingClientRect();
		const x = Math.floor((event.x - rect.left) / 16);
		const y = Math.floor((event.y - rect.top) / 16);

		if (x < 0 || x >= 16 || y < 0 || y >= 16)
			return;

		if (this.setPoint) {
			if (event.type === 'start' || event.type === 'move') {
				this.point[0] = x;
				this.point[1] = y;
			} else {
				this.setPoint = false;
			}
		} else {
			const i = x + y * 16;
			if (this.bitmap[i] !== this.index) {
				this.bitmap[i] = this.index;
				this.redraw();
			}
		}
	}
}
