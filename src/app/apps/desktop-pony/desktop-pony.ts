import { Component, ViewChild, ElementRef, HostListener, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { clamp } from 'lodash';
import { WindowsService } from 'src/app/services/windows.service';
import { getContainerRect } from '../../../utils';
import { CustomDragEvent } from '../../services/drag.directive';

const enum Action {
	Stand,
	Trot,
	Fly,
}

const enum Key {
	ESCAPE = 27,
	LEFT = 37,
	UP = 38,
	RIGHT = 39,
	DOWN = 40,
}

@Component({
	selector: 'app-desktop-pony',
	templateUrl: './desktop-pony.html',
	styleUrls: ['./desktop-pony.scss']
})
export class AppDesktopPony implements OnInit, OnDestroy {
	@ViewChild('colors', { static: true }) colors!: ElementRef;
	close = () => {};
	x = window.innerWidth / 2;
	y = window.innerHeight;
	vx = 0;
	vy = 0;
	flip = false;
	tip = true;
	private lf = -1;
	private flying = false;
	private flyingPressed = false;
	private dropping = false;
	private dragging = false;
	private height = window.innerHeight;
	private action: Action = Action.Stand;
	private keys = new Set<number>();
	private timer = 0;
	constructor(private windows: WindowsService, private zone: NgZone, private cdRef: ChangeDetectorRef) {}
	private frame = () => {
		if (!this.dragging) {
			if (this.tip && (this.vx || this.vy)) {
				this.tip = false;
			}

			if (this.flyingPressed) {
				this.vy = -7;
			}

			if (this.vx < 0) {
				this.flip = false;
			} else if (this.vx > 0) {
				this.flip = true;
			}

			this.x += this.vx;
			this.y += this.vy;

			const window = !this.dropping && this.windows.fromPoint(this.x, this.y);

			if (this.y <= 20 && this.vy < 0) {
				this.vy = 0;
			} else if (this.y >= this.height && this.vy >= 0) {
				this.y = this.height;
				this.vy = 0;
				this.flying = false;
			} else if (window && this.y - this.vy <= window.size.y) {
				this.y = window.size.y;
				this.vy = 0;
				this.flying = false;
			} else {
				this.vy += .2;
				this.flying = true;
			}

			this.fixPosition();
		}

		if (this.flying || this.dragging)
			this.action = Action.Fly;
		else if (this.vx)
			this.action = Action.Trot;
		else
			this.action = Action.Stand;

		let f = 0;
		switch (this.action) {
			case Action.Trot:
				f = Math.floor(Date.now() / 1000 * 24) % 16 + 1;
				break;
			case Action.Fly:
				f = Math.floor(Date.now() / 1000 * 16) % 10 + 17;
				break;
		}

		if (this.lf !== f && this.colors && this.colors.nativeElement) {
			const element = this.colors.nativeElement as HTMLDivElement;
			element.style.setProperty('--index', `${f}`);
			this.lf = f;
		}

		this.cdRef.detectChanges();
		this.timer = requestAnimationFrame(this.frame);
	}
	private keyDownHandler = (e: KeyboardEvent) => {
		const code = e.keyCode;
		if (!this.keys.has(code)) {
			this.keys.add(code);
			if (code === Key.LEFT)
				this.vx -= 5;
			if (code === Key.RIGHT)
				this.vx += 5;
			if (code === Key.UP)
				this.flyingPressed = true;
			if (code === Key.DOWN)
				this.dropping = true;
			if (code === Key.ESCAPE)
				this.zone.run(() => this.close());
		}
	}
	private keyUpHandler = (e: KeyboardEvent) => {
		const code = e.keyCode;
		if (this.keys.has(code)) {
			this.keys.delete(code);
			if (code === Key.LEFT)
				this.vx += 5;
			if (code === Key.RIGHT)
				this.vx -= 5;
			if (code === Key.UP)
				this.flyingPressed = false;
			if (code === Key.DOWN)
				this.dropping = false;
		}
	}
	ngOnInit() {
		this.zone.runOutsideAngular(() => {
			document.addEventListener('keydown', this.keyDownHandler);
			document.addEventListener('keyup', this.keyUpHandler);
			window.addEventListener('blur', this.resetKeys);
			this.frame();
		});
	}
	ngOnDestroy() {
		document.removeEventListener('keydown', this.keyDownHandler);
		document.removeEventListener('keyup', this.keyUpHandler);
		cancelAnimationFrame(this.timer);
	}
	@HostListener('window:resize')
	fixPosition() {
		const range = getContainerRect();
		this.x = clamp(this.x, 0, range.w);
		this.y = clamp(this.y, 20, range.h);
		this.height = range.h;
	}
	private resetKeys = () => {
		this.vx = 0;
		this.flyingPressed = false;
		this.dropping = false;
		this.keys.clear();
	}
	private lx = -1;
	private ly = -1;
	private lpx = -1;
	drag({ event, type, dx, dy }: CustomDragEvent) {
		if (type === 'start') {
			event?.stopPropagation();
			event?.preventDefault();
			this.dragging = true;
			this.vx = this.vy = 0;
			this.lx = this.x;
			this.ly = this.y;
			this.lpx = this.x;
			this.resetKeys();
		}

		if (type === 'move') {
			this.x = this.lx + dx;
			this.y = this.ly + dy;
			this.fixPosition();
			if (this.lpx !== this.x) {
				this.flip = this.lpx - this.x < 0;
				this.lpx = this.x;
			}
		}

		if (type === 'end') {
			this.dragging = false;
		}
	}
}
