import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class StorageService {
	private data?: Map<string, string> = undefined;
	constructor() {
		try {
			if (typeof localStorage === 'undefined') {
				this.data = new Map();
			}
		} catch {
			this.data = new Map();
		}
	}
	getItem(key: string) {
		if (this.data) {
			return this.data.get(key);
		} else {
			try {
				const value = localStorage.getItem(key);
				return value == null ? undefined : value;
			} catch {
				return undefined;
			}
		}
	}
	setItem(key: string, data: string) {
		try {
			localStorage.setItem(key, data);
			this.data = undefined;
		} catch {
			if (!this.data) {
				this.data = new Map();
			}
			this.data.set(key, data);
		}
	}
	removeItem(key: string) {
		if (this.data) {
			this.data.delete(key);
		} else {
			try {
				localStorage.removeItem(key);
			} catch { }
		}
	}
	clear() {
		if (this.data) {
			this.data.clear();
		} else {
			try {
				localStorage.clear();
			} catch { }
		}
	}
	getBoolean(key: string) {
		return this.getItem(key) === 'true';
	}
	setBoolean(key: string, value: boolean) {
		if (value) {
			this.setItem(key, 'true');
		} else {
			this.removeItem(key);
		}
	}
	getObject<T>(key: string) {
		try {
			const item = this.getItem(key);
			return item ? JSON.parse(item) as T : undefined;
		} catch {
			return undefined;
		}
	}
	setObject(key: string, value: any) {
		this.setItem(key, JSON.stringify(value));
	}
}
