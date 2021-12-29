import {
	Component, Input, Output, EventEmitter, HostListener, ViewChild, ElementRef, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef, NgZone
} from '@angular/core';
import { clamp, last } from 'lodash';
import { CustomDragEvent } from '../services/drag.directive';
import { Rect, rect, getContainerRect } from '../../utils';
import { WindowsService } from '../services/windows.service';
import { SettingsService } from '../services/settings.service';

const minW = 90;
const minH = 80;

const deactiveIcons = () => document.querySelector('.icon.active')?.classList.remove('active');

@Component({
	selector: 'app-window',
	templateUrl: './window.component.html',
	styleUrls: ['./window.component.scss']
})
export class WindowComponent implements OnInit, AfterViewInit, OnDestroy {
	@Input() caption = 'Window';
	@Input() resizer = true;
	@Input() scroller = true;
	@Input() close = true;
	@Input() size = rect(0, 0, minW, minH);
	@Input() minSize = rect(0, 0, minW, minH);
	@Input() maxSize = rect(0, 0, Infinity, Infinity);
	@Output() onclose = new EventEmitter<void>();
	@Output() dragged = new EventEmitter<Rect>();
	@Output() resized = new EventEmitter<Rect>();
	@ViewChild('window', { static: true }) window!: ElementRef<HTMLElement>;
	private lastRect = rect();
	toRect = rect();
	indicator = false;
	constructor(
		private windows: WindowsService,
		private settings: SettingsService,
		private zone: NgZone,
		private cdRef: ChangeDetectorRef
	) { }
	ngOnInit() {
		this.windows.addWindow(this);
		this.zone.runOutsideAngular(() => {
			const element = this.window.nativeElement;
			element.addEventListener('mousedown', this.setActive, true);
			element.addEventListener('touchstart', this.setActive, true);
			element.addEventListener('pointerdown', deactiveIcons);
		});
		this.fixRect();
	}
	ngAfterViewInit() {
		this.setActive();
	}
	ngOnDestroy() {
		this.windows.removeWindow(this);
		if (this.window.nativeElement.classList.contains('active')) {
			last(this.windows.windows)?.setActive();
		}
	}
	back() {
		this.windows.layerBack(this);
	}
	front() {
		this.windows.layerFront(this);
	}
	get zIndex() {
		return this.windows.getIndex(this);
	}
	setActive = () => {
		const active = document.querySelector('.window.active');
		if (active !== this.window.nativeElement) {
			active?.classList.remove('active');
			this.window.nativeElement.classList.add('active');
			if (this.settings.settings.clickToFront) {
				this.zone.run(() => this.front());
			}
		}
	}
	drag({ event, type, dx, dy }: CustomDragEvent, resize: boolean) {
		if (type === 'start') {
			event?.preventDefault();
			Object.assign(this.lastRect, this.size);
			Object.assign(this.toRect, this.size);
			this.indicator = resize ? !this.settings.settings.resizeWithContent : !this.settings.settings.dragWithContent;
		}

		const range = getContainerRect();
		if (resize) {
			if (this.resizer) {
				this.toRect.w = clamp(this.lastRect.w + dx, this.minSize.w, Math.min(this.maxSize.w, range.w - this.lastRect.x)) | 0;
				this.toRect.h = clamp(this.lastRect.h + dy, this.minSize.h, Math.min(this.maxSize.h, range.h - this.lastRect.y)) | 0;
			}
		} else {
			this.toRect.x = clamp(this.lastRect.x + dx, 0, range.w - this.lastRect.w) | 0;
			this.toRect.y = clamp(this.lastRect.y + dy, 0, range.h - this.lastRect.h) | 0;
		}

		if (type === 'end' || !this.indicator && type === 'move') {
			Object.assign(this.size, this.toRect);
			this.compareAndEmit(this.lastRect, this.toRect);
			this.indicator = false;
		}

		this.cdRef.detectChanges();
	}
	@HostListener('window:resize')
	fixRect() {
		const range = getContainerRect();
		Object.assign(this.lastRect, this.size);
		if (this.resizer) {
			this.size.w = clamp(this.size.w, this.minSize.w, Math.min(this.maxSize.w, range.w)) | 0;
			this.size.h = clamp(this.size.h, this.minSize.h, Math.min(this.maxSize.h, range.h)) | 0;
		}
		this.size.x = clamp(this.size.x, 0, range.w - this.size.w) | 0;
		this.size.y = clamp(this.size.y, 0, range.h - this.size.h) | 0;
		this.compareAndEmit(this.lastRect, this.size);
	}
	private compareAndEmit(lastRect: Rect, newRect: Rect) {
		if (lastRect.x !== newRect.x || lastRect.y !== newRect.y) {
			this.dragged.emit(newRect);
		}
		if (lastRect.w !== newRect.w || lastRect.h !== newRect.h) {
			this.resized.emit(newRect);
		}
	}
}
