import {
	Component, HostListener, DoCheck, AfterViewInit, ChangeDetectorRef, QueryList, ViewChildren, ViewChild, ElementRef, OnDestroy, NgZone
} from '@angular/core';
import { clamp } from 'lodash';
import { Subscription } from 'rxjs';
import { Point, point, Rect } from 'src/utils';
import { AppIcon, desktopIcons } from './apps/icons';
import { IconComponent } from './icon/icon.component';
import { AppPortalsService } from './services/app-portals.service';
import { ColorsService } from './services/colors.service';
import { CursorService } from './services/cursor.service';
import { CustomDragEvent } from './services/drag.directive';
import { DrawersService } from './services/drawers.service';

const TITLE = 'Polyethylene workbench.';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, DoCheck, OnDestroy {
	readonly icons = desktopIcons;
	private lastOffset = 0;
	private subscriptions: Subscription[] = [];
	@ViewChild('screen', { static: true }) screen!: ElementRef<HTMLElement>;
	@ViewChild('container', { static: true }) container!: ElementRef<HTMLElement>;
	@ViewChildren(IconComponent) iconComps!: QueryList<IconComponent>;
	private title = TITLE;
	private error?: string;
	offset = 0;
	constructor(
		private colors: ColorsService,
		private cursor: CursorService,
		public appPortals: AppPortalsService,
		private drawers: DrawersService,
		public cdRef: ChangeDetectorRef,
		private zone: NgZone
	) {
		this.colors.applyColors();
		this.cursor.applyCursor();
		this.drawers.desktop = this;
	}
	get portals() {
		return this.appPortals.portals;
	}
	get iconPositions() {
		return this.drawers.positions;
	}
	get caption() {
		return this.error || this.title;
	}
	ngAfterViewInit() {
		this.initPositions();
		this.cdRef.detectChanges();
		this.subscriptions.push(this.colors.onMessage.subscribe(message => {
			this.error = message;
			this.screen.nativeElement.removeEventListener('pointerdown', this.resetError, true);
			this.screen.nativeElement.addEventListener('pointerdown', this.resetError, true);
		}));
		this.zone.runOutsideAngular(() => this.container.nativeElement.addEventListener('pointerdown', this.deactiveAll));
	}
	ngDoCheck() {
		this.updateMemory();
	}
	ngOnDestroy() {
		for (const s of this.subscriptions) {
			s.unsubscribe();
		}
	}
	private deactiveAll = () => {
		document.querySelector('.window.active')?.classList.remove('active');
		document.querySelector('.icon.active')?.classList.remove('active');
	}
	dragTitle({ event, type, dy }: CustomDragEvent) {
		if (type === 'start') {
			event?.preventDefault();
			this.lastOffset = this.offset;
		}
		this.offset = clamp(this.lastOffset + dy, 0, window.innerHeight - 20);
	}
	@HostListener('window:resize')
	fixContainerTop() {
		this.offset = clamp(this.offset, 0, window.innerHeight - 20);
	}
	private updateMemory = () => {
		if ('memory' in performance && performance.memory !== undefined) {
			const mem = performance.memory;
			const freemem = mem.totalJSHeapSize - mem.usedJSHeapSize;
			this.title = TITLE + `      ${freemem} free memory`;
		}
	}
	private resetError = () => {
		this.error = undefined;
		this.screen.nativeElement.removeEventListener('pointerdown', this.resetError, true);
	}
	// file manager
	initPositions() {
		const right = 70;
		let top = 10;
		this.iconComps.forEach((item, index) => {
			const rect = item.element.nativeElement.getBoundingClientRect();

			if (!this.iconPositions.has(this.icons[index])) {
				this.iconPositions.set(this.icons[index], point((right - rect.width / 2) | 0, top));
			}

			top += rect.height + 10;
		});
	}
	getX(icon: AppIcon) {
		return this.iconPositions.get(icon)?.x || 0;
	}
	getY(icon: AppIcon) {
		return this.iconPositions.get(icon)?.y || 0;
	}
	bringToFront(icon: AppIcon) {
		this.removeIcon(icon) && this.addIcon(icon);
	}
	removeIcon(icon: AppIcon) {
		for (let i = 0; i < this.icons.length; i++) {
			if (this.icons[i] === icon) {
				this.icons.splice(i, 1);
				return true;
			}
		}
		return false;
	}
	addIcon(icon: AppIcon) {
		this.icons.push(icon);
	}
	dropIcon(icon: AppIcon, iconRect: Rect, pointer: Point) {
		this.drawers.dropIcon(icon, iconRect, pointer, this);
	}
}
