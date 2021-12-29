import { Injectable } from '@angular/core';
import { WindowComponent } from '../window/window.component';

@Injectable({
	providedIn: 'root'
})
export class WindowsService {
	windows = new Array<WindowComponent>();
	addWindow(window: WindowComponent) {
		this.windows.push(window);
	}
	removeWindow(window: WindowComponent) {
		for (let i = 0; i < this.windows.length; i++) {
			if (this.windows[i] === window) {
				this.windows.splice(i, 1);
				return true;
			}
		}
		return false;
	}
	layerFront(window: WindowComponent) {
		if (this.getIndex(window) !== this.windows.length && this.removeWindow(window)) {
			this.windows.push(window);
		}
	}
	layerBack(window: WindowComponent) {
		if (this.getIndex(window) !== 1 && this.removeWindow(window)) {
			this.windows.unshift(window);
		}
	}
	getIndex(window: WindowComponent) {
		return this.windows.indexOf(window) + 1;
	}
	fromPoint(x: number, y: number) {
		for (let i = this.windows.length - 1; i >= 0; i--) {
			const size = this.windows[i].size;
			if (x >= size.x && x <= size.x + size.w && y >= size.y && y <= size.y + size.h) {
				return this.windows[i];
			}
		}
		return undefined;
	}
}
