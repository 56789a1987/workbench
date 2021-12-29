import { Directive, AfterViewInit, OnDestroy, Output, ElementRef, EventEmitter, Input, NgZone } from '@angular/core';

export interface CustomDragEvent {
	event?: MouseEvent | TouchEvent;
	pointerType: 'mouse' | 'touch';
	type: 'start' | 'move' | 'end';
	startX: number;
	startY: number;
	x: number;
	y: number;
	dx: number;
	dy: number;
}

@Directive({
	selector: '[customDrag]'
})
export class DragDirective implements AfterViewInit, OnDestroy {
	private event?: MouseEvent | TouchEvent = undefined;
	private pointer: 'mouse' | 'touch' = 'mouse';
	private startX = 0;
	private startY = 0;
	private x = 0;
	private y = 0;
	private dom: HTMLElement;
	private touch = -1;
	private dragging = false;

	@Output() customDrag = new EventEmitter<CustomDragEvent>();
	@Input() outsideAngular?: boolean;

	constructor(private element: ElementRef, private zone: NgZone) {
		this.dom = this.element.nativeElement;
	}
	ngAfterViewInit() {
		if (this.outsideAngular) {
			this.zone.runOutsideAngular(() => {
				this.dom.addEventListener('mousedown', this.mouseDownHandler);
				this.dom.addEventListener('touchstart', this.touchDownHandler);
			});
		} else {
			this.dom.addEventListener('mousedown', this.mouseDownHandler);
			this.dom.addEventListener('touchstart', this.touchDownHandler);
		}
	}
	ngOnDestroy() {
		document.removeEventListener('mousemove', this.mouseMoveHandler);
		document.removeEventListener('mouseup', this.mouseUpHandler);
		document.removeEventListener('touchmove', this.touchMoveHandler);
		document.removeEventListener('touchend', this.touchUpHandler);
		document.removeEventListener('touchcancel', this.touchUpHandler);
	}
	private mouseDownHandler = (e: MouseEvent) => {
		if (this.dragging) return;

		this.event = e;
		this.pointer = 'mouse';
		this.x = this.startX = e.clientX;
		this.y = this.startY = e.clientY;
		this.start();
	}
	private mouseMoveHandler = (e: MouseEvent) => {
		this.event = e;
		this.pointer = 'mouse';
		this.x = e.clientX;
		this.y = e.clientY;
		this.move();
	}
	private mouseUpHandler = (e: MouseEvent) => {
		this.event = e;
		this.pointer = 'mouse';
		this.end();
	}
	private touchDownHandler = (e: TouchEvent) => {
		if (this.dragging) return;

		this.event = e;
		this.pointer = 'touch';
		this.touch = e.changedTouches[0].identifier;
		this.x = this.startX = e.changedTouches[0].clientX;
		this.y = this.startY = e.changedTouches[0].clientY;
		this.start();
	}
	private touchMoveHandler = (e: TouchEvent) => {
		for (let i = 0; i < e.changedTouches.length; i++) {
			if (e.changedTouches[i].identifier === this.touch) {
				this.event = e;
				this.pointer = 'touch';
				this.x = e.changedTouches[i].clientX;
				this.y = e.changedTouches[i].clientY;
				this.move();
				break;
			}
		}
	}
	private touchUpHandler = (e: TouchEvent) => {
		for (let i = 0; i < e.changedTouches.length; i++) {
			if (e.changedTouches[i].identifier === this.touch) {
				this.event = e;
				this.pointer = 'touch';
				this.touch = -1;
				this.end();
			}
		}
	}
	start() {
		document.addEventListener('mousemove', this.mouseMoveHandler);
		document.addEventListener('mouseup', this.mouseUpHandler);
		document.addEventListener('touchmove', this.touchMoveHandler);
		document.addEventListener('touchend', this.touchUpHandler);
		document.addEventListener('touchcancel', this.touchUpHandler);
		this.dragging = true;
		this.emit('start');
	}
	move() {
		if (this.dragging) {
			this.emit('move');
		} else {
			this.end();
		}
	}
	end() {
		document.removeEventListener('mousemove', this.mouseMoveHandler);
		document.removeEventListener('mouseup', this.mouseUpHandler);
		document.removeEventListener('touchmove', this.touchMoveHandler);
		document.removeEventListener('touchend', this.touchUpHandler);
		document.removeEventListener('touchcancel', this.touchUpHandler);
		if (this.dragging) {
			this.dragging = false;
			this.emit('end');
		}
	}
	emit(type: 'start' | 'move' | 'end') {
		this.customDrag.emit({
			event: this.event,
			pointerType: this.pointer,
			type,
			startX: this.startX,
			startY: this.startY,
			x: this.x,
			y: this.y,
			dx: this.x - this.startX,
			dy: this.y - this.startY,
		});
	}
}
