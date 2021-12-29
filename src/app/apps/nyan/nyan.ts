import { Component, ViewChild, ElementRef, OnDestroy, NgZone } from '@angular/core';
import { rect } from '../../../utils';
import { BeepService } from '../../services/beep.service';

const w = 164, h = 122;

const FRAMES = 12;
const NYAN = 'KLNNSSKLNSUWURSSNNKLNNSSURSUXWXUNNPPIKKGJIGGGGIIJJJIGIKNPKNIKGIGKKNNPKNIKGJKJIGIJJGIKNIKIGIIGGIINNPPIKKGJIGGGGIIJJJIGIKNPKNIKGIGKKNNPKNIKGJKJIGIJJGIKNIKIGIIGGIIGGBDGGBDGIKGLKLNGGGGBDGBLKIGB?@BGGBDGGBDGGIKGBDBGGGFGBDGLKLNGGFFGGBDGGBDGIKGLKLNGGGGBDGBLKIGB?@BGGBDGGBDGGIKGBDBGGGFGBDGLKLNGGII';
const INTERVALS = [100, 75, 50, 25, 10, 400, 200];

@Component({
	selector: 'app-nyan',
	templateUrl: './nyan.html',
	styleUrls: ['./nyan.scss']
})
export class AppNyan implements OnDestroy {
	readonly size = rect(80, window.innerHeight - h - 80, w, h);
	close = () => {};
	private frame = 0;
	private note = 0;
	private interval = 100;
	playing = false;
	private timer = 0;
	@ViewChild('colors') colors!: ElementRef;
	constructor(private beep: BeepService, private zone: NgZone) { }
	ngOnDestroy() {
		this.playing = false;
		window.clearTimeout(this.timer);
	}
	private onframe = () => {
		if (!this.playing)
			return;

		if (this.colors && this.colors.nativeElement) {
			const element = this.colors.nativeElement as HTMLDivElement;
			element.style.setProperty('--index', `${this.frame}`);
			this.frame = (this.frame + 1) % FRAMES;
		}

		this.timer = window.setTimeout(this.onframe, this.interval * .7);
	}
	private onnote = async () => {
		if (!this.playing)
			return;

		const p = NYAN.charCodeAt(this.note) - 69;
		const freq = 440 * Math.pow(2, p / 12);
		await this.beep.beep(freq, this.interval);

		this.note = this.note + 1;
		if (this.note >= NYAN.length)
			this.note = 32;
		this.onnote();
	}
	click() {
		if (!this.playing) {
			this.playing = true;
			this.zone.runOutsideAngular(() => {
				this.onframe();
				this.onnote();
			});
		} else {
			this.interval = INTERVALS[(INTERVALS.indexOf(this.interval) + 1) % INTERVALS.length];
		}
	}
}
