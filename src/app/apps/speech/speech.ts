import { Component, ViewChild } from '@angular/core';
import { rect } from '../../../utils';
import { WindowComponent } from '../../window/window.component';

@Component({
	selector: 'app-speech',
	templateUrl: './speech.html',
	styleUrls: ['./speech.scss']
})
export class AppSpeech {
	readonly size = rect(120, 40, 280, 480);
	readonly minSize = rect(0, 0, 200, 426);
	close = () => { };
	private support = false;
	private utterance?: SpeechSynthesisUtterance;
	voices: string[] = [];

	@ViewChild(WindowComponent) window!: WindowComponent;
	constructor() {
		if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
			this.utterance = new SpeechSynthesisUtterance();
			this.loadVoices();
			speechSynthesis.onvoiceschanged = () => this.loadVoices();
			this.support = true;
		}

		if (this.supports) {
			this.utterance!.voice = speechSynthesis.getVoices()[0];
			this.utterance!.text = 'Hello world';
			this.volume = 1;
			this.rate = 1;
			this.pitch = 1;
		}
	}
	get supports() {
		return this.support;
	}
	loadVoices() {
		this.voices = speechSynthesis.getVoices().map(voice => voice.name);
	}
	get text() {
		return this.supports ? this.utterance!.text : '';
	}
	set text(value: string) {
		if (this.supports) this.utterance!.text = value;
	}
	setVoice(value: string) {
		if (this.supports) {
			const voice = speechSynthesis.getVoices().find(voice => voice.name === value);
			this.utterance!.voice = voice || null;
		}
	}
	get volume() {
		return this.supports ? this.utterance!.volume : 0;
	}
	get volumePercent() {
		return Math.round(this.volume * 100);
	}
	set volume(value: number) {
		if (this.supports) this.utterance!.volume = value;
	}
	get rate() {
		return this.supports ? this.utterance!.rate : 0;
	}
	get rateText() {
		return this.rate.toFixed(1);
	}
	set rate(value: number) {
		if (this.supports) this.utterance!.rate = value;
	}
	get pitch() {
		return this.supports ? Math.round(this.utterance!.pitch * 10) / 10 : 0;
	}
	get pitchText() {
		return this.pitch.toFixed(1);
	}
	set pitch(value: number) {
		if (this.supports) this.utterance!.pitch = value;
	}
	speech() {
		if (this.supports) {
			speechSynthesis.cancel();
			speechSynthesis.speak(this.utterance!);
		}
	}
}
