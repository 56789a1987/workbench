import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

export interface GlobalSettings {
	dblClick?: number;
	beepVolume?: number;
	noFlashing?: boolean;
	clickToFront?: boolean;
	dragWithContent?: boolean;
	resizeWithContent?: boolean;
}

@Injectable({
	providedIn: 'root'
})
export class SettingsService {
	public settings: GlobalSettings;
	constructor(private storage: StorageService) {
		this.settings = this.storage.getObject<GlobalSettings>('workbench-settings') || {};
	}
	saveSettings() {
		this.storage.setObject('workbench-settings', this.settings);
	}
}
