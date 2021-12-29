import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, Injectable } from '@angular/core';
import { noMultiple } from '../apps';
import { WindowComponent } from '../window/window.component';

class AppPortal {
	portal: ComponentPortal<any>;
	instance?: any;
	constructor(private component: any, private service: AppPortalsService, private callback?: (instance: any) => void) {
		this.portal = new ComponentPortal(this.component);
	}
	close = () => {
		this.service.close(this);
	}
	attached(ref: ComponentRef<any>) {
		this.instance = ref.instance;
		ref.instance.close = this.close;
		this.callback && this.callback(ref.instance);
	}
}

@Injectable({
	providedIn: 'root'
})
export class AppPortalsService {
	portals = new Array<AppPortal>();
	openComponent(component: any, callback?: (instance: any) => void) {
		if (noMultiple.includes(component)) {
			const portal = this.portals.find(p => p.instance instanceof component);
			if (portal) {
				if (portal.instance?.window) {
					(portal.instance?.window as WindowComponent).front();
					(portal.instance?.window as WindowComponent).setActive();
				}
				return;
			}
		}

		const appPortal = new AppPortal(component, this, callback);
		this.portals.push(appPortal);
		return appPortal;
	}
	close(portal: AppPortal) {
		for (let i = 0; i < this.portals.length; i++) {
			if (this.portals[i] === portal) {
				this.portals.splice(i, 1);
				break;
			}
		}
	}
}
