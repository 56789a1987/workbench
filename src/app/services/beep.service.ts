import { Injectable } from '@angular/core';
import { delay } from '../../utils';
import { SettingsService } from './settings.service';

@Injectable({
	providedIn: 'root'
})
export class BeepService {
	private audioCtx?: AudioContext;
	constructor(private settings: SettingsService) { }
	get context() {
		this.audioCtx = this.audioCtx || new AudioContext();
		return this.audioCtx;
	}
	get volume() {
		const { beepVolume = 1 } = this.settings.settings;
		return beepVolume;
	}
	createBase(frequency: number, type: OscillatorType = 'square') {
		this.audioCtx = this.audioCtx || new AudioContext();
		const oscillator = this.audioCtx.createOscillator();
		const gainNode = this.audioCtx.createGain();
		oscillator.connect(gainNode);
		gainNode.connect(this.audioCtx.destination);
		oscillator.type = type;
		oscillator.frequency.value = frequency;
		return { oscillator, gainNode };
	}
	beep(frequency: number, duration: number, type?: OscillatorType) {
		const { oscillator, gainNode } = this.createBase(frequency, type);
		const now = this.audioCtx!.currentTime;
		gainNode.gain.setValueAtTime(this.volume, now);
		oscillator.start(now);
		oscillator.stop(now + duration / 1000);
		return delay(duration);
	}
}
