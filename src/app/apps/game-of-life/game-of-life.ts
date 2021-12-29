import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ColorsService } from 'src/app/services/colors.service';
import { rect } from '../../../utils';

const w = 404, h = 422;
const SIZE = 8;

@Component({
	selector: 'app-game-of-life',
	templateUrl: './game-of-life.html',
	styleUrls: ['./game-of-life.scss']
})
export class AppGameOfLife implements AfterViewInit, OnDestroy {
	readonly size = rect(60, 80, w, h);
	close = () => { };
	@ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
	constructor(private colors: ColorsService, private zone: NgZone) { }
	private x!: boolean[][];
	private context?: CanvasRenderingContext2D;
	private color = this.colors.colorsCSS()[3];
	private timer = 0;
	private subscription?: Subscription;
	ngAfterViewInit() {
		this.resize();
		this.random();
		this.zone.runOutsideAngular(() => {
			this.timer = window.setInterval(() => {
				this.next();
				this.draw();
			}, 50);
			this.subscription = this.colors.update.subscribe(() => {
				this.color = this.colors.colorsCSS()[3];
				this.draw();
			});
		});
	}
	ngOnDestroy() {
		window.clearInterval(this.timer);
		this.subscription?.unsubscribe();
	}
	resize(size = this.size) {
		const width = Math.floor((size.w - 4) / SIZE);
		const height = Math.floor((size.h - 22) / SIZE);
		this.x = new Array<boolean[]>(height);
		for (let i = 0; i < height; i++) {
			this.x[i] = new Array<boolean>(width);
			this.x[i].fill(false);
		}
		this.canvas.nativeElement.width = width * SIZE;
		this.canvas.nativeElement.height = height * SIZE;
	}
	random() {
		for (let y = 0; y < this.x.length; y++) {
			for (let x = 0; x < this.x[y].length; x++) {
				this.x[y][x] = Math.random() < 0.5;
			}
		}
	}
	private neighbors(x: number, y: number) {
		return (this.x[y - 1]?.[x - 1] ? 1 : 0)
			+ (this.x[y - 1]?.[x] ? 1 : 0)
			+ (this.x[y - 1]?.[x + 1] ? 1 : 0)
			+ (this.x[y][x - 1] ? 1 : 0)
			+ (this.x[y][x + 1] ? 1 : 0)
			+ (this.x[y + 1]?.[x - 1] ? 1 : 0)
			+ (this.x[y + 1]?.[x] ? 1 : 0)
			+ (this.x[y + 1]?.[x + 1] ? 1 : 0);
	}
	next() {
		const changes: number[] = [];
		for (let y = 0; y < this.x.length; y++) {
			for (let x = 0; x < this.x[y].length; x++) {
				const n = this.neighbors(x, y);
				if (this.x[y][x] ? n < 2 || n > 3 : n === 3) {
					changes.push(y, x);
				}
			}
		}
		for (let i = 0; i < changes.length;) {
			const y = changes[i++], x = changes[i++];
			this.x[y][x] = !this.x[y][x];
		}
	}
	draw() {
		const canvas = this.canvas.nativeElement;
		this.context = canvas.getContext('2d')!;
		this.context.clearRect(0, 0, canvas.width, canvas.height);
		this.context.fillStyle = this.color;
		for (let y = 0; y < this.x.length; y++) {
			for (let x = 0; x < this.x[y].length; x++) {
				if (this.x[y][x]) {
					this.context.fillRect(x * SIZE, y * SIZE, SIZE, SIZE);
				}
			}
		}
	}
}
