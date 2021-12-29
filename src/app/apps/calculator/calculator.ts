import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { rect } from '../../../utils';
import { ColorsService } from '../../services/colors.service';

const w = 535, h = 264;

@Component({
	selector: 'app-calculator',
	templateUrl: './calculator.html',
	styleUrls: ['./calculator.scss']
})
export class AppCalculator implements OnInit {
	readonly size = rect(window.innerWidth / 2 - w / 2 | 0, window.innerHeight / 2 - h / 2 | 0, w, h);
	close = () => {};
	@ViewChild('top', { static: true }) top!: ElementRef<HTMLElement>;
	@ViewChild('bottom', { static: true }) bottom!: ElementRef<HTMLElement>;
	@ViewChild('deg', { static: true }) deg!: ElementRef<HTMLElement>;
	@ViewChild('rad', { static: true }) rad!: ElementRef<HTMLElement>;
	@ViewChild('buttons', { static: true }) buttons!: ElementRef<HTMLElement>;
	constructor(private colors: ColorsService) { }
	ngOnInit() {
		const calc = new Calculator({
			top: this.top.nativeElement,
			bottom: this.bottom.nativeElement,
			deg: this.deg.nativeElement,
			rad: this.rad.nativeElement,
			buttons: Array.from(this.buttons.nativeElement.getElementsByTagName('button')),
		});
		calc.onError = () => this.colors.warn();
	}

	readonly size2 = rect(0, 0, 340, 120);
	showAbout = false;
	openAbout() {
		this.size2.x = (window.innerWidth / 2 - this.size2.w / 2) | 0;
		this.size2.y = (window.innerHeight / 2 - this.size2.h / 2) | 0;
		this.showAbout = true;
	}
	closeAbout() {
		this.showAbout = false;
	}
}
