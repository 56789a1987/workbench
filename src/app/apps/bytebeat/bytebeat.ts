import { Component, ViewChild, NgZone, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { saveAs } from 'file-saver';
import { rect, Rect, readFileAsArrayBuffer } from '../../../utils';
import * as wave from './wave';
import { byteBeatCollection } from './bytebeat_collection';
import { ColorsService } from '../../services/colors.service';

@Component({
	selector: 'app-bytebeat',
	templateUrl: './bytebeat.html',
	styleUrls: ['./bytebeat.scss']
})
export class AppBytebeat implements OnDestroy {
	readonly size = rect(window.innerWidth / 2 - 350 | 0, window.innerHeight / 2 - 370 | 0, 700, 740);
	readonly minSize = rect(0, 0, 320, 320);
	readonly collection = byteBeatCollection;
	readonly canvasHeight = 256;
	close = () => {};
	canvasWidth = this.size.w - 30;
	tab = 0;
	error = '';
	duration = 30;
	rate = 8000;
	multiplier = 6;
	autoplay = true;
	script = '(t<<3)*[8/9,1,9/8,6/5,4/3,3/2,0][[0xd2d2c8,0xce4088,0xca32c8,0x8e4009][t>>14&3]>>(0x3dbe4688>>((t>>10&15)>9?18:t>>10&15)*3&7)*3&7]';
	rate2 = 48000;
	lastRate = 30;
	url?: string;
	blob?: Blob;
	private u8?: number[];
	@ViewChild('audio', { static: true }) audio!: ElementRef;
	@ViewChild('canvas', { static: true }) canvas!: ElementRef;
	constructor(private zone: NgZone, private colors: ColorsService, private cdRef: ChangeDetectorRef) { }
	ngOnDestroy() {
		this.release();
	}
	presetChanged() {
		const group = this.collection.find(x => x.collection.some(i => i.value === this.script));
		if (group) {
			this.rate = group.rate;
			this.multiplier = group.quality;
		}
	}
	compose() {
		this.error = '';
		try {
			const result = wave.generateFromJS(this.script, this.duration, this.rate, this.multiplier);
			this.release();
			this.blob = result.blob;
			this.u8 = result.bytes;
			this.url = URL.createObjectURL(result.blob);
			this.lastRate = this.rate;
			this.setupAudio(this.url);
		} catch (e) {
			this.colors.warn();
			this.error = e;
		}
	}
	async upload(file: File) {
		this.error = '';
		try {
			const array = new Uint8Array(await readFileAsArrayBuffer(file));
			this.lastRate = this.rate2;
			const result = wave.createWaveFile(array, this.rate2);
			this.blob = result;
			this.u8 = Array.from(array);
			this.url = URL.createObjectURL(result);
			this.setupAudio(this.url);
		} catch (e) {
			this.colors.warn();
			this.error = e;
		}
	}
	private setupAudio(src: string) {
		if (this.audio.nativeElement) {
			const audio = this.audio.nativeElement as HTMLAudioElement;
			audio.src = src;
			audio.currentTime = 0;
			this.zone.runOutsideAngular(() => audio.ontimeupdate = audio.onplay = this.startDraw);
			if (this.autoplay) {
				audio.play();
			}
		}
	}
	release() {
		this.url && URL.revokeObjectURL(this.url);
	}
	resized(event: Rect) {
		this.canvasWidth = event.w - 30;
		this.cdRef.detectChanges();
	}
	private animHandler = 0;
	private startDraw = () => {
		cancelAnimationFrame(this.animHandler);
		this.draw();
	}
	private draw = () => {
		this.zone.runOutsideAngular(() => {
			if (!this.canvas || !this.audio) return;

			const canvas = this.canvas.nativeElement as HTMLCanvasElement;
			const audio = this.audio.nativeElement as HTMLAudioElement;
			if (this.u8 && canvas && audio) {
				const index = (((audio.currentTime * this.lastRate / 256) | 0) * 256 - this.canvasWidth / 2) | 0;

				const ctx = canvas.getContext('2d');
				ctx!.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
				ctx!.fillStyle = this.colors.colorsCSS()[1];

				for (let t = 0; t <= this.canvasWidth; t++) {
					const y1 = 255 - (this.u8[index + t] | 0);
					const y2 = 255 - (this.u8[index + t - 1] | 0);
					ctx!.fillRect(t, Math.min(y1, y2), 1, Math.abs(y2 - y1) + 1);
				}

				if (!audio.paused && !audio.seeking)
					this.animHandler = requestAnimationFrame(this.draw);
			}
		});
	}
	download() {
		this.blob && saveAs(this.blob, Date.now() + '.wav');
	}
}
