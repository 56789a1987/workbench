import { Component, ViewChild } from '@angular/core';
import { cloneDeep } from 'lodash';
import { compressToBase64, decompressFromBase64 } from 'lz-string';
import { saveAs } from 'file-saver';
import { AppPortalsService } from 'src/app/services/app-portals.service';
import { ColorsService, defaultColors } from 'src/app/services/colors.service';
import { AppCursor, CursorService, defaultCursor } from 'src/app/services/cursor.service';
import { GlobalSettings, SettingsService } from 'src/app/services/settings.service';
import { WindowComponent } from 'src/app/window/window.component';
import { readFileAsText, rect } from 'src/utils';
import { AppColors, AppPointer } from '..';
import { StorageService } from 'src/app/services/storage.service';
import { BeepService } from 'src/app/services/beep.service';

const w = 420, h = 470;

@Component({
	selector: 'app-preferences',
	templateUrl: './preferences.html',
	styleUrls: ['./preferences.scss']
})
export class AppPreferences {
	@ViewChild(WindowComponent) window!: WindowComponent;
	close = () => { };
	readonly size = rect(window.innerWidth / 2 - w / 2 | 0, window.innerHeight / 2 - h / 2 | 0, w, h);
	private lastSettings = cloneDeep(this.settings);
	private lastColors = cloneDeep(this.colors.colors);
	private lastCursor = cloneDeep(this.cursor.cursor);
	previewIcon = 'folder';
	constructor(
		private service: SettingsService,
		private colors: ColorsService,
		private cursor: CursorService,
		private portals: AppPortalsService,
		private storage: StorageService,
		private audio: BeepService,
	) { }
	get settings() {
		return this.service.settings;
	}
	get dblClickDelay() {
		return this.settings.dblClick || 400;
	}
	set dblClickDelay(value: number) {
		this.settings.dblClick = value;
	}
	get beepVolume() {
		return this.settings.beepVolume === undefined ? 100 : this.settings.beepVolume * 100;
	}
	set beepVolume(value: number) {
		this.settings.beepVolume = Math.round(value) / 100;
	}
	togglePreviewIcon() {
		this.previewIcon = this.previewIcon === 'folder' ? 'folder-open' : 'folder';
	}
	playBeep() {
		this.audio.beep(880, 100);
	}
	openPointer() {
		this.portals.openComponent(AppPointer, instance => instance.fromPrefs = true);
	}
	openColors() {
		this.portals.openComponent(AppColors, instance => instance.fromPrefs = true);
	}
	private applySettings(settings: GlobalSettings) {
		for (const key of Object.keys(this.settings)) {
			delete (this.settings as any)[key];
		}
		Object.assign(this.settings, settings);
	}
	private applyColors(colors: number[][]) {
		const instance = this.colors.colors;
		for (let i = 0; i < instance.length; i++) {
			instance[i][0] = colors[i][0];
			instance[i][1] = colors[i][1];
			instance[i][2] = colors[i][2];
		}
		this.colors.applyColors();
	}
	private applyCursor(cursor: AppCursor) {
		const instance = this.cursor.cursor;
		for (let i = 0; i < instance.bitmap.length; i++) {
			instance.bitmap[i] = cursor.bitmap[i];
		}
		for (let i = 0; i < instance.colors.length; i++) {
			instance.colors[i][0] = cursor.colors[i][0];
			instance.colors[i][1] = cursor.colors[i][1];
			instance.colors[i][2] = cursor.colors[i][2];
		}
		instance.point[0] = cursor.point[0];
		instance.point[1] = cursor.point[1];
		this.cursor.applyCursor();
	}
	resetToLast() {
		this.applySettings(this.lastSettings);
		this.applyColors(this.lastColors);
		this.applyCursor(this.lastCursor);
	}
	resetToSaved() {
		this.applySettings(this.storage.getObject<GlobalSettings>('workbench-settings') || {});
		this.applyColors(this.storage.getObject<number[][]>('workbench-palette') || defaultColors());
		this.applyCursor(this.storage.getObject<AppCursor>('workbench-cursor') || defaultCursor());
	}
	resetToDefault() {
		this.applySettings({});
		this.applyColors(defaultColors());
		this.applyCursor(defaultCursor());
	}
	save() {
		this.service.saveSettings();
		this.colors.saveColors();
		this.cursor.saveCursor();
	}
	export() {
		const object = {
			settings: this.settings,
			cursor: this.cursor.cursor,
			colors: this.colors.colors,
		};
		const blob = new Blob([compressToBase64(JSON.stringify(object))], { type: 'text/plain' });
		saveAs(blob, 'workbench-settings.dat');
	}
	async import(file: File) {
		if (!file)
			return;

		try {
			const data = await readFileAsText(file);
			const { settings, colors, cursor } = JSON.parse(decompressFromBase64(data)!);
			settings && this.applySettings(settings);
			colors && this.applyColors(colors);
			cursor && this.applyCursor(cursor);
		} catch (e) {
			console.error(e);
			this.colors.warn('Failed to import, parse or apply settings');
		}
	}
}
