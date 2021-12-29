import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { clamp } from 'lodash';
import { Subscription } from 'rxjs';
import { saveAs } from 'file-saver';
import { ColorsService } from 'src/app/services/colors.service';
import { CustomDragEvent } from 'src/app/services/drag.directive';
import {
	fillCubicBezier, fillEllipse, fillLine, fillPolygon2, fillRect, outlineEllipse, outlinePolygon, outlineRect, putPointPairs
} from 'src/graphicUtils';
import { rect } from 'src/utils';

const BG_COLOR = 3;
const DUMP_LIMIT = 20;
const w = 640, h = 480;
const enum Tools {
	SelectBox,
	Move,
	Pencil,
	Eraser,
	Line,
	Brush,
	Curve,
	Fill,
	Rect,
	RectFill,
	Ellipse,
	EllipseFill,
	Polygon,
	PolygonFill,
	Count,
}

@Component({
	selector: 'app-paint',
	templateUrl: 'paint.html',
	styleUrls: ['paint.scss']
})
export class AppPaint implements AfterViewInit, OnDestroy {
	readonly size = rect(window.innerWidth / 2 - w / 2 | 0, window.innerHeight / 2 - h / 2 | 0, w, h);
	readonly minSize = rect(0, 0, 470, 200);
	readonly brushSizes = [2, 4, 6, 8, 10];
	readonly toolTypes = new Array(Tools.Count).map((_, i) => i);
	readonly toolbarWidth = (Tools.Count / 2) * 42 + 2;
	@ViewChild('content', { static: true }) container!: ElementRef<HTMLElement>;
	@ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
	close = () => { };
	tool = Tools.Pencil;
	color = 2;
	brushSize = 2;
	lineSize = 2;
	showMenu = 0;
	private bufferW = 0;
	private bufferH = 0;
	private lastX = 0;
	private lastY = 0;
	private viewX = 0;
	private viewY = 0;
	private viewW = 0;
	private viewH = 0;
	private renderer = document.createElement('canvas');
	private renderer2 = document.createElement('canvas');
	private buffer?: Uint8Array;
	private context?: CanvasRenderingContext2D;
	private rendererCtx?: CanvasRenderingContext2D;
	private renderer2Ctx?: CanvasRenderingContext2D;
	private lastTool = Tools.Pencil;
	private points?: number[];
	private nodePoints?: number[];
	private dragMoved = false;
	private dragSX = 0;
	private dragSY = 0;
	private dragDX = 0;
	private dragDY = 0;
	private dragPreview?: ImageData;
	private dumps: { x: number, y: number, w: number, h: number, buffer: Uint8Array }[] = [];
	private dumpIndex = 0;
	private subscription?: Subscription;
	constructor(private colors: ColorsService, private cdRef: ChangeDetectorRef) { }
	ngAfterViewInit() {
		this.resize();
		this.extendBuffer();
		this.renderMain();
		this.redraw();
		this.dumpBuffer();
		this.subscription = this.colors.update.subscribe(() => {
			this.renderMain();
			this.renderTemp();
			this.redraw();
		});
	}
	ngOnDestroy() {
		this.subscription?.unsubscribe();
	}
	get colorClass() {
		return `col-${this.color + 1}`;
	}
	get colorArray() {
		return this.colors.colorsArray();
	}
	get colorCSS() {
		return this.colors.colorsCSS();
	}
	toggleMenu(i: number) {
		this.showMenu = this.showMenu === i ? 0 : i;
	}
	switchTool(i: number) {
		if (this.tool !== i) {
			this.stopPending(true);
			this.tool = i;
		}
	}
	private resize() {
		const rect = this.container.nativeElement.getBoundingClientRect();
		this.canvas.nativeElement.width = rect.width;
		this.canvas.nativeElement.height = rect.height;
		this.viewW = Math.ceil(rect.width);
		this.viewH = Math.ceil(rect.height / 2);

		this.renderer.width = this.viewW;
		this.renderer.height = this.viewH;
		this.renderer2.width = this.viewW;
		this.renderer2.height = this.viewH;
	}
	resized() {
		this.cdRef.detectChanges();
		this.resize();
		this.renderMain();
		this.renderTemp();
		this.redraw();
	}
	undo() {
		if (this.dumpIndex <= 1) {
			this.colors.warn();
		} else {
			this.stopPending(false);
			this.dumpIndex--;
			const dump = this.dumps[this.dumpIndex - 1];
			this.viewX = dump.x;
			this.viewY = dump.y;
			this.bufferW = dump.w;
			this.bufferH = dump.h;
			this.buffer = new Uint8Array(dump.buffer);
			this.renderMain();
			this.redraw();
		}
	}
	redo() {
		if (this.dumpIndex >= this.dumps.length) {
			this.colors.warn();
		} else {
			this.stopPending(false);
			this.dumpIndex++;
			const dump = this.dumps[this.dumpIndex - 1];
			this.viewX = dump.x;
			this.viewY = dump.y;
			this.bufferW = dump.w;
			this.bufferH = dump.h;
			this.buffer = new Uint8Array(dump.buffer);
			this.renderMain();
			this.redraw();
		}
	}
	save() {
		this.canvas.nativeElement.toBlob(blob => blob && saveAs(blob, `${Date.now()}.png`));
	}
	drag({ event, x, y, type }: CustomDragEvent) {
		event?.preventDefault();
		event?.stopPropagation();

		const rect = this.canvas.nativeElement.getBoundingClientRect();
		x = (x - rect.left) | 0;
		y = ((y - rect.top) / 2) | 0;

		if (type === 'start') {
			this.lastTool = this.tool;
			this.dragSX = x;
			this.dragSY = y;
		}

		switch (this.lastTool) {
			case Tools.Move: {
				if (type === 'start') {
					this.lastX = this.viewX;
					this.lastY = this.viewY;
				} else if (type === 'move') {
					this.viewX = this.lastX + this.dragSX - x;
					this.viewY = this.lastY + this.dragSY - y;
					this.renderMain();
					this.redraw();
				} else if (type === 'end') {
					if (this.dragSX !== x || this.dragSY !== y) {
						this.dumpBuffer();
					}
				}
				break;
			}
			case Tools.SelectBox: {
				if (type === 'start') {
					const np = this.nodePoints;
					if (!this.dragPreview) {
						this.dragDX = 0;
						this.dragDY = 0;
					}
					if (np && x >= np[0] + this.dragDX && x <= np[2] + this.dragDX && y >= np[1] + this.dragDY && y <= np[3] + this.dragDY) {
						if (!this.dragPreview) {
							this.dragPreview = this.rendererCtx?.getImageData(np[0], np[1], np[2] - np[0], np[3] - np[1]);
						}
						this.lastX = this.dragDX;
						this.lastY = this.dragDY;
					} else {
						if (this.dragPreview) {
							this.extendBuffer();
							this.applyBoxMove();
							this.dumpBuffer();
							this.dragPreview = undefined;
							this.nodePoints = undefined;
							this.renderTemp();
							this.renderMain();
						} else if (this.nodePoints) {
							this.nodePoints = undefined;
							this.renderTemp();
						}
					}
				} else if (type === 'move') {
					if (this.dragPreview && this.nodePoints) {
						const [x0, y0] = this.nodePoints;
						this.dragDX = clamp(this.lastX + x - this.dragSX, -x0, this.viewW - this.dragPreview.width - x0);
						this.dragDY = clamp(this.lastY + y - this.dragSY, -y0, this.viewH - this.dragPreview.height - y0);
					} else {
						if (x !== this.dragSX && y !== this.dragSY) {
							const x0 = Math.max(Math.min(this.dragSX, x), 0);
							const y0 = Math.max(Math.min(this.dragSY, y), 0);
							const x1 = Math.min(Math.max(this.dragSX, x) + 1, this.viewW);
							const y1 = Math.min(Math.max(this.dragSY, y) + 1, this.viewH);
							this.nodePoints = [x0, y0, x1, y1];
						} else {
							this.nodePoints = undefined;
						}
					}
					this.renderTemp(this.renderDragPreview);
				}
				this.redraw();
				break;
			}
			case Tools.Fill: {
				if (type === 'start') {
					this.extendBuffer();
					if (this.floodFill(x, y)) {
						this.dumpBuffer();
						this.renderMain();
						this.redraw();
					}
				}
				break;
			}
			case Tools.Pencil: {
				if (type === 'start') {
					this.lastX = x;
					this.lastY = y;
					this.points = [x, y];
				} else if (type === 'move') {
					this.points = this.points!.concat(fillLine(this.lastX, this.lastY, x, y));
					this.lastX = x;
					this.lastY = y;
				} else if (type === 'end') {
					this.extendBuffer();
					this.putPoints();
					this.dumpBuffer();
					this.renderMain();
					this.points = undefined;
				}
				this.renderTemp();
				this.redraw();
				break;
			}
			case Tools.Brush: case Tools.Eraser: {
				if (type === 'start') {
					this.lastX = x;
					this.lastY = y;
					this.points = [];
					this.putBrush(x, y);
				} else if (type === 'move') {
					const points = fillLine(this.lastX, this.lastY, x, y);
					for (let i = 0; i < points.length;) {
						this.putBrush(points[i++], points[i++]);
					}
					this.lastX = x;
					this.lastY = y;
				} else if (type === 'end') {
					this.extendBuffer();
					if (this.lastTool === Tools.Eraser) {
						const lastColor = this.color;
						this.color = BG_COLOR;
						this.putPoints();
						this.color = lastColor;
					} else {
						this.putPoints();
					}
					this.dumpBuffer();
					this.renderMain();
					this.points = undefined;
				}
				this.renderTemp(this.lastTool === Tools.Eraser ? this.renderEraserPreview : this.renderPreview);
				this.redraw();
				break;
			}
			case Tools.Line: {
				if (type === 'start') {
					this.lastX = x;
					this.lastY = y;
				} else if (type === 'move') {
					this.points = fillLine(this.lastX, this.lastY, x, y);
				} else if (type === 'end') {
					this.extendBuffer();
					this.putPoints(true);
					this.dumpBuffer();
					this.renderMain();
					this.points = undefined;
				}
				this.renderTemp();
				this.redraw();
				break;
			}
			case Tools.Rect: case Tools.RectFill: {
				if (type === 'move') {
					const outline = this.lastTool === Tools.Rect;
					this.points = outline ? outlineRect(this.dragSX, this.dragSY, x, y) : fillRect(this.dragSX, this.dragSY, x, y);
				} else if (type === 'end') {
					const outline = this.lastTool === Tools.Rect;
					this.extendBuffer();
					this.putPoints(outline);
					this.dumpBuffer();
					this.renderMain();
					this.points = undefined;
				}
				this.renderTemp();
				this.redraw();
				break;
			}
			case Tools.Ellipse: case Tools.EllipseFill: {
				x = Math.floor(x / 2) * 2;
				y = Math.floor(y / 2) * 2;
				if (type === 'start') {
					this.lastX = x;
					this.lastY = y;
				} else if (type === 'move') {
					const ox = (this.lastX + x) / 2;
					const oy = (this.lastY + y) / 2;
					const a = Math.abs(x - ox), b = Math.abs(y - oy);
					this.points = this.lastTool === Tools.Ellipse ? outlineEllipse(ox, oy, a, b) : fillEllipse(ox, oy, a, b);
				} else if (type === 'end') {
					const outline = this.lastTool === Tools.Ellipse;
					this.extendBuffer();
					this.putPoints(outline);
					this.dumpBuffer();
					this.renderMain();
					this.points = undefined;
				}
				this.renderTemp();
				this.redraw();
				break;
			}
			case Tools.Polygon: case Tools.PolygonFill: {
				if (type === 'start') {
					if (!this.nodePoints) {
						this.lastX = x;
						this.lastY = y;
						this.nodePoints = [x, y];
						this.dragMoved = true;
					} else {
						const np = this.nodePoints;
						this.dragMoved = Math.hypot((this.lastX - x), (this.lastY - y) * 2) > 4 && Math.hypot((np[0] - x), (np[1] - y) * 2) > 4;
					}
				}
				if (type === 'start' && this.dragMoved || type === 'move') {
					this.dragMoved = true;
					this.points = fillLine(this.lastX, this.lastY, x, y);
					const np = this.nodePoints;
					if (np && np.length >= 4) {
						for (let i = 0; i < np.length - 2; i += 2) {
							this.points = this.points!.concat(fillLine(np[i], np[i + 1], np[i + 2], np[i + 3]));
						}
					}
				} else if (type === 'end') {
					if (this.dragMoved) {
						this.lastX = x;
						this.lastY = y;
						this.nodePoints && this.nodePoints.push(x, y);
					} else {
						const outline = this.lastTool === Tools.Polygon;
						if (this.nodePoints) {
							this.points = outline ? outlinePolygon(...this.nodePoints) : fillPolygon2(...this.nodePoints);
						}
						this.extendBuffer();
						this.putPoints(outline);
						this.dumpBuffer();
						this.renderMain();
						this.points = undefined;
						this.nodePoints = undefined;
					}
				}
				this.renderTemp();
				this.redraw();
				break;
			}
			case Tools.Curve: {
				if (type === 'start') {
					if (!this.nodePoints) {
						this.lastX = x;
						this.lastY = y;
						this.nodePoints = [x, y];
					}
				} else if (type === 'move' && this.nodePoints) {
					const np = this.nodePoints;
					if (np.length === 2) {
						this.points = fillLine(np[0], np[1], x, y);
					} else if (np.length === 4) {
						this.points = fillCubicBezier(np[0], np[1], x, y, np[2], np[3], np[2], np[3]);
					} else if (np.length === 6) {
						this.points = fillCubicBezier(np[0], np[1], np[4], np[5], x, y, np[2], np[3]);
					}
				} else if (type === 'end') {
					if (this.nodePoints && this.nodePoints.length === 2 && x === this.lastX && y === this.lastY) {
						this.nodePoints = undefined;
					} else if (this.nodePoints) {
						this.nodePoints.push(x, y);
					}

					if (this.nodePoints && this.nodePoints.length === 8) {
						this.extendBuffer();
						this.putPoints(true);
						this.dumpBuffer();
						this.renderMain();
						this.points = undefined;
						this.nodePoints = undefined;
					}
				}
				this.renderTemp();
				this.redraw();
				break;
			}
		}
	}
	private dumpBuffer() {
		if (!this.buffer) {
			return;
		}

		this.dumps.splice(this.dumpIndex);
		this.dumps.push({
			x: this.viewX,
			y: this.viewY,
			w: this.bufferW,
			h: this.bufferH,
			buffer: new Uint8Array(this.buffer)
		});

		while (this.dumps.length > DUMP_LIMIT) {
			this.dumps.shift();
			this.dumpIndex--;
		}

		this.dumpIndex++;
	}
	private extendBuffer() {
		if (!this.buffer) {
			this.bufferW = this.viewW;
			this.bufferH = this.viewH;
			this.buffer = new Uint8Array(this.bufferW * this.bufferH);
			this.buffer.fill(BG_COLOR);
			return;
		}

		if (this.viewY < 0) {
			const lastBuffer = this.buffer;
			const dy = -this.viewY;
			this.viewY = 0;

			this.bufferH += dy;
			this.buffer = new Uint8Array(this.bufferW * this.bufferH);
			this.buffer.fill(BG_COLOR);
			this.buffer.set(lastBuffer, dy * this.bufferW);
		}

		if (this.viewY + this.viewH > this.bufferH) {
			const lastBuffer = this.buffer;
			const dy = this.viewY + this.viewH - this.bufferH;

			this.bufferH += dy;
			this.buffer = new Uint8Array(this.bufferW * this.bufferH);
			this.buffer.fill(BG_COLOR);
			this.buffer.set(lastBuffer, 0);
		}

		if (this.viewX < 0) {
			const lastBuffer = this.buffer;
			const dx = -this.viewX, lastW = this.bufferW;
			this.viewX = 0;

			this.bufferW += dx;
			this.buffer = new Uint8Array(this.bufferW * this.bufferH);
			this.buffer.fill(BG_COLOR);

			for (let y = 0; y < this.bufferH; y++) {
				this.buffer.set(lastBuffer.slice(y * lastW, y * lastW + lastW), y * this.bufferW + dx);
			}
		}

		if (this.viewX + this.viewW > this.bufferW) {
			const lastBuffer = this.buffer;
			const dx = this.viewX + this.viewW - this.bufferW, lastW = this.bufferW;

			this.bufferW += dx;
			this.buffer = new Uint8Array(this.bufferW * this.bufferH);
			this.buffer.fill(BG_COLOR);

			for (let y = 0; y < this.bufferH; y++) {
				this.buffer.set(lastBuffer.slice(y * lastW, y * lastW + lastW), y * this.bufferW);
			}
		}
	}
	private stopPending(apply: boolean) {
		switch (this.lastTool) {
			case Tools.SelectBox: {
				if (this.dragPreview && apply) {
					this.extendBuffer();
					if (this.applyBoxMove()) {
						this.dumpBuffer();
						this.renderTemp();
						this.renderMain();
						this.redraw();
					}
					this.dragPreview = undefined;
				} else if (this.nodePoints) {
					this.dragPreview = undefined;
					this.renderTemp();
					this.redraw();
				}
				break;
			}
			case Tools.Polygon: case Tools.PolygonFill: {
				if (this.nodePoints) {
					if (apply) {
						const outline = this.lastTool === Tools.Polygon;
						this.points = outline ? outlinePolygon(...this.nodePoints) : fillPolygon2(...this.nodePoints);
						this.extendBuffer();
						this.putPoints(outline);
						this.points = undefined;
						this.dumpBuffer();
						this.renderTemp();
						this.renderMain();
						this.redraw();
					} else {
						this.points = undefined;
						this.renderTemp();
						this.redraw();
					}
				}
				break;
			}
			case Tools.Curve: {
				if (this.nodePoints) {
					if (apply) {
						this.extendBuffer();
						this.putPoints(true);
						this.points = undefined;
						this.dumpBuffer();
						this.renderTemp();
						this.renderMain();
						this.redraw();
					} else {
						this.points = undefined;
						this.renderTemp();
						this.redraw();
					}
				}
			}
		}

		this.points = undefined;
		this.nodePoints = undefined;
	}
	private putBrush(x: number, y: number) {
		if (!this.points) {
			return;
		}

		const dx = (this.brushSize / 2) | 0, dy = (this.brushSize / 4) | 0;
		const sx = x - dx, sy = y - dy;

		for (let yy = 0; yy < this.brushSize / 2; yy++) {
			for (let xx = 0; xx < this.brushSize; xx++) {
				this.points.push(sx + xx, sy + yy);
			}
		}
	}
	private putPoints(withWeight?: boolean) {
		if (!this.buffer || !this.points) {
			return;
		}

		if (withWeight && this.lineSize !== 2) {
			for (let i = 0; i < this.points.length;) {
				const dx = (this.lineSize / 2) | 0, dy = (this.lineSize / 4) | 0;
				const sx = this.points[i++] - dx, sy = this.points[i++] - dy;

				for (let yy = 0; yy < this.lineSize / 2; yy++) {
					for (let xx = 0; xx < this.lineSize; xx++) {
						const x = sx + xx, y = sy + yy;
						if (x >= 0 && x < this.viewW && y >= 0 && y < this.viewH) {
							this.buffer[(x + this.viewX) + (y + this.viewY) * this.bufferW] = this.color;
						}
					}
				}
			}
		} else {
			for (let i = 0; i < this.points.length;) {
				const x = this.points[i++], y = this.points[i++];
				if (x >= 0 && x < this.viewW && y >= 0 && y < this.viewH) {
					this.buffer[(x + this.viewX) + (y + this.viewY) * this.bufferW] = this.color;
				}
			}
		}
	}
	private applyBoxMove() {
		if (!this.buffer || !this.dragPreview || !this.nodePoints) {
			return false;
		}

		const [x0, y0, x1, y1] = this.nodePoints;
		const x2 = x0 + this.dragDX, y2 = y0 + this.dragDY;
		const w = x1 - x0, h = y1 - y0;
		const lines: Uint8Array[] = [];

		for (let y = y0; y < y1; y++) {
			const index = x0 + this.viewX + (y + this.viewY) * this.bufferW;
			lines.push(this.buffer.slice(index, index + w));
			this.buffer.fill(BG_COLOR, index, index + w);
		}

		for (let y = 0; y < h; y++) {
			const index = x2 + this.viewX + (y + y2 + this.viewY) * this.bufferW;
			this.buffer.set(lines[y], index);
		}

		return true;
	}
	private floodFill(x: number, y: number, color = this.color) {
		if (!this.buffer) {
			return;
		}

		const toIndex = (x: number, y: number) => (x + this.viewX) + (y + this.viewY) * this.bufferW;
		const lastColor = this.buffer[toIndex(x, y)];

		if (lastColor === color) {
			return false;
		}

		const canFill = (x: number, y: number) =>
			x >= 0 && x < this.viewW && y >= 0 && y < this.viewH && this.buffer![toIndex(x, y)] === lastColor;
		const setPixel = (x: number, y: number) => this.buffer![toIndex(x, y)] = color;
		const stack = [x, y];

		while (stack.length) {
			const y = stack.pop()!;
			const x = stack.pop()!;
			setPixel(x, y);
			canFill(x + 1, y) && stack.push(x + 1, y);
			canFill(x - 1, y) && stack.push(x - 1, y);
			canFill(x, y + 1) && stack.push(x, y + 1);
			canFill(x, y - 1) && stack.push(x, y - 1);
		}

		return true;
	}
	private renderMain() {
		if (!this.buffer) {
			return;
		}

		const colors = this.colorArray;
		const imgData = new ImageData(this.viewW, this.viewH);

		for (let y = 0; y < this.viewH; y++) {
			for (let x = 0; x < this.viewW; x++) {
				const sx = x + this.viewX;
				const sy = y + this.viewY;
				let color;

				if (sx >= 0 && sx < this.bufferW && sy >= 0 && sy < this.bufferH) {
					color = this.buffer[sx + sy * this.bufferW];
				} else {
					color = BG_COLOR;
				}

				let idx = (x + y * this.viewW) * 4;
				imgData.data[idx++] = colors[color][0];
				imgData.data[idx++] = colors[color][1];
				imgData.data[idx++] = colors[color][2];
				imgData.data[idx] = 0xff;
			}
		}

		this.rendererCtx = this.renderer.getContext('2d')!;
		this.rendererCtx.clearRect(0, 0, this.viewW, this.viewH);
		this.rendererCtx.putImageData(imgData, 0, 0);
	}
	private readonly renderPreview = (context: CanvasRenderingContext2D) => {
		if (!this.points)
			return;

		const [r, g, b] = this.colorArray[this.color];
		const imgData = new ImageData(this.viewW, this.viewH);
		putPointPairs(this.points, imgData, r, g, b);
		context.putImageData(imgData, 0, 0);
	}
	private readonly renderEraserPreview = (context: CanvasRenderingContext2D) => {
		if (!this.points)
			return;

		const [r, g, b] = this.colorArray[BG_COLOR];
		const imgData = new ImageData(this.viewW, this.viewH);
		putPointPairs(this.points, imgData, r, g, b);
		context.putImageData(imgData, 0, 0);
	}
	private readonly renderDragPreview = (context: CanvasRenderingContext2D) => {
		if (!this.nodePoints) {
			return;
		}

		let [x0, y0, x1, y1] = this.nodePoints;
		const w = x1 - x0, h = y1 - y0;

		if (w === 0 || h === 0) {
			return;
		}

		const colors = this.colorArray;
		const imgData = new ImageData(w, h);

		if (this.dragPreview) {
			context.fillStyle = this.colorCSS[3];
			context.fillRect(x0, y0, w, h);

			x0 += this.dragDX;
			y0 += this.dragDY;

			imgData.data.set(this.dragPreview.data);
		}

		for (let x = 0; x < w; x++) {
			let color = colors[(x + x0 + y0 * 2) % 4 >= 2 ? 2 : 3];
			let idx = x * 4;
			imgData.data[idx++] = color[0];
			imgData.data[idx++] = color[1];
			imgData.data[idx++] = color[2];
			imgData.data[idx] = 0xff;

			color = colors[(x + x0 + (y1 - 1) * 2) % 4 >= 2 ? 2 : 3];
			idx = (x + h * w - w) * 4;
			imgData.data[idx++] = color[0];
			imgData.data[idx++] = color[1];
			imgData.data[idx++] = color[2];
			imgData.data[idx] = 0xff;
		}

		for (let y = 0; y < h; y++) {
			let color = colors[(x0 + (y0 + y) * 2) % 4 >= 2 ? 2 : 3];
			let idx = y * w * 4;
			imgData.data[idx++] = color[0];
			imgData.data[idx++] = color[1];
			imgData.data[idx++] = color[2];
			imgData.data[idx] = 0xff;

			color = colors[(x1 - 1 + (y0 + y) * 2) % 4 >= 2 ? 2 : 3];
			idx = (w - 1 + y * w) * 4;
			imgData.data[idx++] = color[0];
			imgData.data[idx++] = color[1];
			imgData.data[idx++] = color[2];
			imgData.data[idx] = 0xff;
		}

		context.putImageData(imgData, x0, y0);
	}
	private renderTemp(draw = this.renderPreview) {
		this.renderer2Ctx = this.renderer2.getContext('2d')!;
		this.renderer2Ctx.clearRect(0, 0, this.viewW, this.viewH);
		draw(this.renderer2Ctx);
	}
	private redraw() {
		const canvas = this.canvas.nativeElement;
		this.context = canvas.getContext('2d')!;
		this.context.clearRect(0, 0, canvas.width, canvas.height);
		this.context.imageSmoothingEnabled = false;
		this.context.save();
		this.context.scale(1, 2);
		this.context.drawImage(this.renderer, 0, 0);
		this.context.drawImage(this.renderer2, 0, 0);
		this.context.restore();
	}
}
