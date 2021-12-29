import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ColorsService } from 'src/app/services/colors.service';
import { fillEllipse, fillLine, fillPolygon2, putPointPairs } from 'src/graphicUtils';
import { rect } from '../../../utils';

const { round, floor, sin, cos } = Math;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

@Component({
	selector: 'app-clock',
	templateUrl: './clock.html',
	styleUrls: ['./clock.scss']
})
export class AppClock implements AfterViewInit, OnDestroy {
	@ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
	close = () => { };
	readonly size = rect(40, 40, 170, 210);
	readonly minSize = rect(0, 0, 105, 138);
	private faceCanvas = document.createElement('canvas');
	private handsCanvas = document.createElement('canvas');
	private context!: CanvasRenderingContext2D;
	private faceContext;
	private handsContext;
	private width = 0;
	private height = 0;
	private timer = 0;
	private subscription?: Subscription;
	hr12Text = '';
	dateText = '';
	constructor(private colorsService: ColorsService, private cdRef: ChangeDetectorRef, private zone: NgZone) {
		this.faceContext = this.faceCanvas.getContext('2d')!;
		this.handsContext = this.handsCanvas.getContext('2d')!;
	}
	ngAfterViewInit() {
		this.context = this.canvas.nativeElement.getContext('2d')!;
		this.resized();
		this.updateText();
		this.subscription = this.colorsService.update.subscribe(() => {
			this.redrawFace();
			this.redrawHands();
			this.redraw();
		});
		this.zone.runOutsideAngular(() => this.timer = window.setInterval(this.tick, 1000));
	}
	ngOnDestroy() {
		this.subscription && this.subscription.unsubscribe();
		window.clearInterval(this.timer);
	}
	get colors() {
		return this.colorsService.colorsArray();
	}
	resized() {
		this.cdRef.detectChanges();
		this.resizeCanvas();
		this.redrawFace();
		this.redrawHands();
		this.redraw();
	}
	private resizeCanvas() {
		let { width, height } = this.canvas.nativeElement.getBoundingClientRect();
		this.canvas.nativeElement.width = width;
		this.canvas.nativeElement.height = height;
		this.width = width;
		this.height = floor(height / 2);
		this.faceCanvas.width = this.width;
		this.faceCanvas.height = this.height;
		this.handsCanvas.width = this.width;
		this.handsCanvas.height = this.height;
	}
	private redrawFace() {
		const image = new ImageData(this.width, this.height);
		const colors = this.colors;
		const draw = (points: number[], color: number) => putPointPairs(points, image, colors[color][0], colors[color][1], colors[color][2]);

		const cx = floor(this.width / 2) - 1, cy = floor(this.height / 2) - 1;
		const details = this.size.w >= 160 && this.size.h >= 180;
		draw(fillEllipse(cx, cy, cx, cy), 2);
		draw(fillEllipse(cx, cy, round(cx * 0.98), round(cy * 0.98)), 3);
		for (let i = 0; i < 60; i++) {
			const a = i / 30 * Math.PI;
			if (i % 5 === 0) {
				const d = Math.PI / 60;
				draw(fillPolygon2(
					round(cx * (1 + 0.85 * sin(a))), round(cy * (1 + 0.85 * cos(a))),
					round(cx * (1 + 0.90 * sin(a + d))), round(cy * (1 + 0.90 * cos(a + d))),
					round(cx * (1 + 0.95 * sin(a))), round(cy * (1 + 0.95 * cos(a))),
					round(cx * (1 + 0.90 * sin(a - d))), round(cy * (1 + 0.90 * cos(a - d)))), 2);
			} else if (details) {
				draw(fillLine(
					round(cx * (1 + 0.88 * sin(a))), round(cy * (1 + 0.88 * cos(a))),
					round(cx * (1 + 0.95 * sin(a))), round(cy * (1 + 0.95 * cos(a)))), 2);
			}
		}

		this.faceContext.clearRect(0, 0, this.width, this.height);
		this.faceContext.putImageData(image, 0, 0);
	}
	private redrawHands() {
		const date = new Date();
		const colors = this.colors;
		const image = new ImageData(this.width, this.height);
		const draw = (points: number[], color: number) => putPointPairs(points, image, colors[color][0], colors[color][1], colors[color][2]);

		const cx = floor(this.width / 2) - 1, cy = floor(this.height / 2) - 1;
		const seconds = date.getSeconds() / 30 * Math.PI;
		const minutes = date.getMinutes() / 30 * Math.PI + seconds / 60;
		const hours = (date.getHours() % 12) / 6 * Math.PI + minutes / 12;

		// hours hand
		let d = Math.PI / 36;
		draw(fillPolygon2(
			cx, cy,
			round(cx * (1 + 0.4 * sin(hours + d))), round(cy * (1 - 0.4 * cos(hours + d))),
			round(cx * (1 + 0.6 * sin(hours))), round(cy * (1 - 0.6 * cos(hours))),
			round(cx * (1 + 0.4 * sin(hours - d))), round(cy * (1 - 0.4 * cos(hours - d)))), 2);

		// minutes hand
		d = Math.PI / 70;
		draw(fillPolygon2(
			cx, cy,
			round(cx * (1 + 0.6 * sin(minutes + d))), round(cy * (1 - 0.6 * cos(minutes + d))),
			round(cx * (1 + 0.8 * sin(minutes))), round(cy * (1 - 0.8 * cos(minutes))),
			round(cx * (1 + 0.6 * sin(minutes - d))), round(cy * (1 - 0.6 * cos(minutes - d)))), 2);

		// seconds hand
		draw(fillLine(cx, cy, round(cx * (1 + 0.8 * sin(seconds))), round(cy * (1 - 0.8 * cos(seconds)))), 1);

		this.handsContext.clearRect(0, 0, this.width, this.height);
		this.handsContext.putImageData(image, 0, 0);
	}
	private redraw() {
		this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
		this.context.imageSmoothingEnabled = false;
		this.context.save();
		this.context.scale(1, 2);
		this.context.drawImage(this.faceCanvas, 0, 0);
		this.context.drawImage(this.handsCanvas, 0, 0);
		this.context.restore();
	}
	private updateText() {
		const date = new Date();
		const hr12Text = date.getHours() >= 12 ? 'PM' : 'AM';
		const year = date.getFullYear() % 100;
		const dateText = `${date.getDate()} ${MONTHS[date.getMonth()]} ${year < 10 ? '0' + year : year}`;

		if (this.hr12Text !== hr12Text || this.dateText !== dateText) {
			this.hr12Text = hr12Text;
			this.dateText = dateText;
			this.cdRef.detectChanges();
		}
	}
	private tick = () => {
		this.redrawHands();
		this.redraw();
		this.updateText();
	}
}
