import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { IconComponent } from 'src/app/icon/icon.component';
import { AppPortalsService } from 'src/app/services/app-portals.service';
import { DrawersService } from 'src/app/services/drawers.service';
import { WindowComponent } from 'src/app/window/window.component';
import { point, Point, Rect, rect } from 'src/utils';
import { AppIcon } from '../icons';

let x = 32, y = 32;
let scrollerHeight = -1;

@Component({
	selector: 'app-drawer',
	templateUrl: 'drawer.html',
	styleUrls: ['drawer.scss']
})
export class AppDrawer implements OnInit, AfterViewInit, OnDestroy {
	readonly size = rect(x, y, 400, 200);
	@ViewChild('window', { static: true }) window!: WindowComponent;
	@ViewChild('container', { static: true }) container!: ElementRef<HTMLElement>;
	@ViewChildren(IconComponent) iconComps!: QueryList<IconComponent>;
	close = () => { };
	caption = '';
	value = 100;
	icons: AppIcon[] = [];
	constructor(public portals: AppPortalsService, public cdRef: ChangeDetectorRef, private drawers: DrawersService) {
		x += 32;
		y += 32;
		if (x + 400 > window.innerWidth)
			x = 32;
		if (y + 200 > window.innerHeight)
			y = 32;
	}
	ngOnInit() {
		if (scrollerHeight === -1) {
			const element = this.container.nativeElement;
			scrollerHeight = element.offsetHeight - element.clientHeight;
			document.body.style.setProperty('--scroller-h', scrollerHeight + 'px');
		}
	}
	ngAfterViewInit() {
		this.initPositions();
		this.drawers.addDrawer(this.window, this);
		this.cdRef.detectChanges();
	}
	ngOnDestroy() {
		this.drawers.removeDrawer(this.window);
	}
	get positions() {
		return this.drawers.positions;
	}
	initPositions() {
		const initLeft = this.value > 0 ? 30 : 20;
		let left = initLeft, top = 74;
		const width = this.container.nativeElement.clientWidth;

		this.iconComps.forEach((item, index) => {
			const rect = item.element.nativeElement.getBoundingClientRect();

			if (left + rect.width > width) {
				left = initLeft;
				top += 74;
			}

			if (!this.positions.has(this.icons[index])) {
				this.positions.set(this.icons[index], point(left, top - rect.height));
			}
			left += rect.width + 16;
		});
	}
	getX(icon: AppIcon) {
		return this.positions.get(icon)?.x || 0;
	}
	getY(icon: AppIcon) {
		return this.positions.get(icon)?.y || 0;
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
