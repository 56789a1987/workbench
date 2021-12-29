import { Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef, OnChanges, SimpleChanges, NgZone } from '@angular/core';
import { CustomDragEvent } from '../services/drag.directive';
import { ICONS } from 'src/icons-build';
import { AppIcon } from '../apps/icons';
import { point, Point, rect, Rect } from 'src/utils';
import { SettingsService } from '../services/settings.service';

@Component({
	selector: 'app-icon',
	templateUrl: './icon.component.html',
	styleUrls: ['./icon.component.scss']
})
export class IconComponent implements OnInit, OnChanges {
	@Input() label = '';
	@Input() icon?: string;
	@Input() activeIcon?: string;
	@Input() connectDir?: AppIcon[];
	@Input() noMove?: boolean;
	@Input() draggable = true;
	@Output() selected = new EventEmitter<void>();
	@Output() dropped = new EventEmitter<{ icon: Rect, pointer: Point }>();
	@Output() execute = new EventEmitter<void>();
	@ViewChild('icon', { static: true }) element!: ElementRef<HTMLElement>;
	@ViewChild('colors', { static: true }) colors!: ElementRef<HTMLElement>;
	private dragging?: HTMLElement;
	private dragStartX = 0;
	private dragStartY = 0;
	private lastClick = 0;
	constructor(private settings: SettingsService, private zone: NgZone) { }
	ngOnInit() {
		this.updateIcon();
		this.zone.runOutsideAngular(() => this.colors.nativeElement.addEventListener('pointerdown', e => {
			e.stopPropagation();
			this.setActive();
		}));
	}
	ngOnChanges(changes: SimpleChanges) {
		if (
			changes.icon.previousValue !== changes.icon.currentValue ||
			changes.activeIcon.previousValue !== changes.activeIcon.currentValue
		) {
			this.updateIcon();
		}
	}
	get dblClickDelay() {
		return this.settings.settings.dblClick || 400;
	}
	private updateIcon() {
		const element = this.colors.nativeElement;
		const style = (key: string, value: number) => element.style.setProperty('--' + key, value + 'px');
		const icon = ICONS[this.icon || 'default'], activeIcon = this.activeIcon && ICONS[this.activeIcon];

		if (!icon) {
			console.error('Missing icon: ' + this.icon);
		}

		if (this.activeIcon && !activeIcon) {
			console.error('Missing icon: ' + this.activeIcon);
		}

		style('y', -icon.y);
		style('w', icon.w);
		style('h', icon.h);

		if (activeIcon) {
			style('active-y', -activeIcon.y);
		} else {
			element.style.removeProperty('--active-y');
		}
	}
	setActive() {
		const active = document.querySelector('.icon.active');
		if (active !== this.element.nativeElement) {
			active?.classList.remove('active');
			this.element.nativeElement.classList.add('active');
			this.selected.emit();
		}
	}
	drag({ event, type, dx, dy, x, y }: CustomDragEvent) {
		if (!this.draggable) {
			return;
		}

		if (type === 'start') {
			event?.stopPropagation();
		} else if (type === 'move') {
			if (!this.dragging) {
				const element = this.colors.nativeElement;
				const rect = element.getBoundingClientRect();

				this.dragging = element.cloneNode(true) as HTMLElement;
				this.dragStartX = rect.left;
				this.dragStartY = rect.top;
				this.lastClick = 0;

				this.dragging.classList.add('dragging');
				document.body.appendChild(this.dragging);
			}

			this.dragging.style.left = `${this.dragStartX + dx}px`;
			this.dragging.style.top = `${this.dragStartY + dy}px`;
		} else if (type === 'end' && this.dragging) {
			const { left, top, width, height } = this.element.nativeElement.getBoundingClientRect();
			this.zone.run(() => this.dropped.emit({ icon: rect(left + dx, top + dy, width, height), pointer: point(x, y) }));
			this.dragging.parentNode!.removeChild(this.dragging);
			this.dragging = undefined;
		}
	}
	click() {
		const now = Date.now();
		if (this.lastClick === 0 || now - this.lastClick > this.dblClickDelay) {
			this.lastClick = now;
		} else {
			this.execute.emit();
			this.lastClick = 0;
		}
	}
}
