import { ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { CustomDragEvent } from 'src/app/services/drag.directive';
import { rect } from 'src/utils';

let x = 120, y = 90;

@Component({
	selector: 'app-notepad',
	templateUrl: './notepad.html',
	styleUrls: ['./notepad.scss']
})
export class AppNotepad implements OnInit {
	readonly size = rect(x, y, 300, 200);
	@ViewChild('textArea', { static: true }) textArea!: ElementRef<HTMLTextAreaElement>;
	@ViewChild('scrollbar', { static: true }) scrollbar!: ElementRef<HTMLDivElement>;
	close = () => {};
	private lastScrollTop = 0;
	index = 0;
	text = new Array<string>(10).fill('');
	scrollerHeight = 100;
	scrollerTop = 0;
	constructor(private zone: NgZone, private cdRef: ChangeDetectorRef) {
		x += 32;
		y += 32;
		if (x + 300 > window.innerWidth)
			x = 120;
		if (y + 200 > window.innerHeight)
			y = 80;
	}
	ngOnInit() {
		this.zone.runOutsideAngular(() => this.textArea.nativeElement.addEventListener('scroll', this.updateScroller));
	}
	next() {
		if (this.index < 9) {
			this.index++;
			this.textArea.nativeElement.value = this.text[this.index];
			this.updateScroller();
		}
	}
	prev() {
		if (this.index > 0) {
			this.index--;
			this.textArea.nativeElement.value = this.text[this.index];
			this.updateScroller();
		}
	}
	resized() {
		window.setTimeout(() => this.updateScroller());
	}
	private updateScroller = () => {
		const { clientHeight, scrollHeight, scrollTop } = this.textArea.nativeElement;
		const scrollerHeight = clientHeight / scrollHeight * 100;
		let scrollerTop = scrollTop / (scrollHeight - clientHeight) * (100 - scrollerHeight);
		if (!isFinite(scrollerTop))
			scrollerTop = 0;

		if (this.scrollerHeight !== scrollerHeight || this.scrollerTop !== scrollerTop) {
			this.scrollerHeight = scrollerHeight;
			this.scrollerTop = scrollerTop;
			this.cdRef.detectChanges();
		}
	}
	scrollUp() {
		this.textArea.nativeElement.scrollTop -= 16;
	}
	scrollDown() {
		this.textArea.nativeElement.scrollTop += 16;
	}
	dragScroller({ event, type, dy }: CustomDragEvent) {
		event?.preventDefault();

		if (type === 'start') {
			this.lastScrollTop = this.textArea.nativeElement.scrollTop;
		} else if (type === 'move' && this.scrollerHeight !== 100) {
			const scrollerSpace = this.scrollbar.nativeElement.offsetHeight * (1 - this.scrollerHeight / 100);
			const contentSpace = this.textArea.nativeElement.scrollHeight - this.textArea.nativeElement.clientHeight;
			const scrollTop = this.lastScrollTop + dy / scrollerSpace * contentSpace;
			this.textArea.nativeElement.scrollTop = Math.round(scrollTop);
		}
	}
}
