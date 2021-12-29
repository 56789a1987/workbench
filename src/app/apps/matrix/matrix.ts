import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { rect, randChar, repeatStr, Rect, getSampleChars } from '../../../utils';

const sampleChars = getSampleChars();

@Component({
	selector: 'app-matrix',
	templateUrl: './matrix.html',
	styleUrls: ['./matrix.scss']
})
export class AppMatrix implements OnInit, OnDestroy {
	readonly size = rect(60, 80, 640, 480);
	close = () => { };
	// Fix
	get i() {
		return { o: '' };
	}
	items: { s: string, d: number, y: number, o: string[] }[] = [];
	cols = 0;
	rows = 0;
	private timer = 0;
	constructor(private zone: NgZone, private cdRef: ChangeDetectorRef) { }
	ngOnInit() {
		this.resized(this.size);
		this.zone.runOutsideAngular(() => this.onframe());
	}
	ngOnDestroy() {
		window.clearTimeout(this.timer);
	}
	private onframe = () => {
		for (let x = 0; x < this.cols; x++) {
			if (!this.items[x] || !this.items[x].s.replace(/-/g, '')) {
				if (Math.random() > .9) {
					this.items[x] = { s: randChar(0, sampleChars), d: this.rows / 2 + Math.random() * this.rows, y: 0, o: [] };
				} else if (!this.items[x]) {
					this.items[x] = { s: '-', d: 1, y: 0, o: [] };
				}
			} else if (this.items[x].s.length > this.items[x].d) {
				const i = this.items[x].s.lastIndexOf('-');
				this.items[x].s = repeatStr('-', i + 2) + this.items[x].s.slice(i + 2);
				this.items[x].y++;
			} else {
				this.items[x].s += randChar(0, sampleChars);
				this.items[x].y++;
			}
		}

		this.items.map(i => {
			const s = i.s;
			const n1 = s.lastIndexOf('-') + 1;
			const n2 = Math.max(n1, i.y - this.rows / 2);
			const n3 = Math.max(n2, i.y);

			i.o[0] = s.slice(0, n1);
			i.o[1] = s.slice(n1, n2);
			i.o[2] = s.slice(n2, n3);
			i.o[3] = s.slice(n3);
		});

		this.cdRef.detectChanges();
		this.timer = window.setTimeout(this.onframe, 85);
	}
	resized(rect: Rect) {
		this.cols = Math.ceil(rect.w / 12);
		this.rows = Math.ceil((rect.h - 20) / 18);
		this.items = this.items.slice(0, this.cols);
	}
	closeApp() {
		this.zone.run(() => this.close());
	}
}
