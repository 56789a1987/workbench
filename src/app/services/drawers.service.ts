import { Injectable } from '@angular/core';
import { point, Point, Rect } from 'src/utils';
import { AppComponent } from '../app.component';
import { AppDrawer } from '../apps';
import { AppIcon } from '../apps/icons';
import { WindowComponent } from '../window/window.component';
import { ColorsService } from './colors.service';
import { WindowsService } from './windows.service';

@Injectable({
	providedIn: 'root'
})
export class DrawersService {
	readonly positions = new Map<AppIcon, Point>();
	private drawers = new Map<WindowComponent, AppDrawer>();
	desktop?: AppComponent;
	constructor(private windows: WindowsService, private colors: ColorsService) { }
	addDrawer(window: WindowComponent, drawer: AppDrawer) {
		this.drawers.set(window, drawer);
	}
	removeDrawer(window: WindowComponent) {
		this.drawers.delete(window);
	}
	private getWindow({ x, y }: Point) {
		const windows = this.windows.windows;

		// get windows from top to bottom
		for (let i = windows.length - 1; i >= 0; i--) {
			const rect = windows[i].window.nativeElement.getBoundingClientRect();

			// if dropped on a window, folder windows return the window, other windows return undefined
			if (x >= rect.left && x <= rect.left + rect.width && y >= rect.top && y <= rect.top + rect.height) {
				return this.drawers.get(windows[i]);
			}
		}

		return this.desktop!;
	}
	dropIcon(icon: AppIcon, iconRect: Rect, pointer: Point, fromDrawer: AppDrawer | AppComponent) {
		const window = this.getWindow(pointer);

		if (!window) {
			this.colors.warn('Icons cannot be moved into this window');
			return;
		}

		if (!icon.noMove) {
			for (const item of window.iconComps.toArray().reverse()) {
				const rect = item.colors.nativeElement.getBoundingClientRect();

				// dropped on an icon linked to another folder
				if (pointer.x >= rect.left && pointer.x <= rect.right && pointer.y >= rect.top && pointer.y <= rect.bottom) {
					if (item.connectDir && item.connectDir !== icon.connectDir && fromDrawer.removeIcon(icon)) {
						item.connectDir.push(icon);
						this.positions.delete(icon);

						for (const opened of this.drawers.values()) {
							// update icons if the target folder is open
							if (opened.icons === item.connectDir) {
								opened.cdRef.detectChanges();
								opened.initPositions();
							}
							// close the folder window if its icon is moved
							if (opened.icons === icon.connectDir) {
								opened.close();
							}
						}
						return;
					}
					break;
				}
			}
		}

		if (window !== fromDrawer && icon.noMove) {
			this.colors.warn(`'${icon.label}' cannot be moved out of its window`);
			return;
		}

		let moved = false;

		if (window instanceof AppComponent) {
			// dropped to the desktop
			const rect = window.container.nativeElement.getBoundingClientRect();
			if (pointer.x >= rect.left && pointer.x <= rect.right && pointer.y >= rect.top + 20 && pointer.y <= rect.bottom) {
				this.positions.set(icon, point(rect.right - (iconRect.x + iconRect.w), iconRect.y - rect.top - 20));
				moved = true;
			}
		} else {
			if (window.icons === icon.connectDir) {
				// should not move a folder into itself
				this.colors.warn(`Error while moving ${icon.label}: 202`);
				return;
			}

			const element = window.container.nativeElement;
			const { scrollLeft, scrollTop } = element;
			const rect = element.getBoundingClientRect();
			const offsetLeft = window.value > 0 ? 14 : 0;

			// dropped to the background of a folder window
			if (pointer.x >= rect.left + offsetLeft && pointer.x <= rect.right && pointer.y >= rect.top && pointer.y <= rect.bottom) {
				this.positions.set(icon, point(iconRect.x - rect.left + scrollLeft, iconRect.y - rect.top + scrollTop));
				moved = true;
			}
		}

		if (moved && window !== fromDrawer && fromDrawer.removeIcon(icon)) {
			// close the window if its icon is moved
			for (const opened of this.drawers.values()) {
				if (opened.icons === icon.connectDir) {
					opened.close();
				}
			}

			// update the icons of the target folder
			window.addIcon(icon);
			window.cdRef.detectChanges();
			window.iconComps.last.setActive();
		}
	}
}
