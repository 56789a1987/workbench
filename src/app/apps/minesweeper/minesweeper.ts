import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { clamp, sample } from 'lodash';
import { WindowComponent } from 'src/app/window/window.component';
import { rect } from 'src/utils';

interface Tile {
	class: string;
	mine: boolean;
	flagged: boolean;
	number: number;
}

@Component({
	selector: 'app-minesweeper',
	templateUrl: './minesweeper.html',
	styleUrls: ['./minesweeper.scss']
})
export class AppMinesweeper implements OnInit, OnDestroy {
	readonly size = rect(120, 120, 100, 100);
	readonly size2 = rect(0, 0, 205, 140);
	@ViewChild('window', { static: true }) window!: WindowComponent;
	@ViewChild('timer', { static: true }) timeField!: ElementRef<HTMLElement>;
	close = () => { };
	private width = 9;
	private height = 9;
	private mines = 10;
	private initedMines = false;
	private time = 0;
	private timer = 0;
	success = false;
	gameOver = -1;
	panelWidth = 0;
	minesLeft = 0;
	showMenu = false;
	showCustom = false;
	customWidth = 0;
	customHeight = 0;
	customMines = 0;
	panel: Tile[] = [];
	constructor(private zone: NgZone) { }
	ngOnInit() {
		this.init(true);
	}
	ngOnDestroy() {
		window.clearInterval(this.timer);
	}
	init(initial?: boolean) {
		this.panelWidth = this.width * 16 + 2;
		this.panel.length = this.width * this.height;
		for (let i = 0; i < this.panel.length; i++) {
			if (this.panel[i]) {
				this.panel[i].class = '';
				this.panel[i].mine = false;
				this.panel[i].flagged = false;
				this.panel[i].number = 0;
			} else {
				this.panel[i] = {
					class: '',
					mine: false,
					flagged: false,
					number: 0,
				};
			}
		}

		this.initedMines = false;
		this.gameOver = -1;
		this.success = false;
		this.time = 0;
		this.minesLeft = this.mines;
		this.size.w = this.panelWidth + 20;
		this.size.h = this.height * 16 + 96;
		this.showMenu = false;

		if (!initial) {
			this.window.fixRect();
			this.timeField.nativeElement.innerHTML = '0';
		}
	}
	setSize(width: number, height: number, mines: number) {
		this.width = clamp(width, 9, 30);
		this.height = clamp(height, 9, 24);
		this.mines = clamp(mines, 10, (this.width * this.height * 0.8) | 0);
		this.init();
	}
	startTimer() {
		const element = this.timeField.nativeElement;
		this.time = 0;
		window.clearInterval(this.timer);
		this.zone.runOutsideAngular(() => {
			this.timer = window.setInterval(() => {
				this.time++;
				element.innerHTML = this.time.toString();
			}, 1000);
		});
	}
	openCustom() {
		this.showMenu = false;

		if (this.showCustom) {
			return;
		}

		this.customWidth = this.width;
		this.customHeight = this.height;
		this.customMines = this.mines;
		this.size2.x = this.size.x + 10;
		this.size2.y = this.size.y + 30;
		this.showCustom = true;
	}
	applyCustom() {
		this.setSize(this.customWidth | 0, this.customHeight | 0, this.customMines | 0);

		this.showCustom = false;
	}
	private initMines(exclude: number) {
		const indices: number[] = [];

		for (let i = 0; i < this.width * this.height; i++) {
			if (i !== exclude) {
				indices.push(i);
			}
		}

		for (let i = 0; i < this.mines; i++) {
			const index = sample(indices);
			if (index !== undefined) {
				this.panel[index].mine = true;
				for (let j = indices.length - 1; j >= 0; j--) {
					if (indices[j] === index) {
						indices.splice(j, 1);
						break;
					}
				}
			}
		}

		this.startTimer();
		this.initedMines = true;
	}
	click(index: number) {
		const tile = this.panel[index];

		if (this.success || this.gameOver !== -1 || tile.flagged) {
			return;
		}

		if (!this.initedMines) {
			this.initMines(index);
		}

		if (tile.mine) {
			for (const t of this.panel) {
				if (t.mine) {
					t.class += `show mine`;
				}
			}
			this.gameOver = index;
			window.clearInterval(this.timer);
		} else if (tile.class) {
			if (tile.number !== 0) {
				const x = index % this.width, y = Math.floor(index / this.width);
				this.tryNeighbors(x, y);
				this.checkSuccess();
			}
		} else {
			const x = index % this.width, y = Math.floor(index / this.width);
			this.floodClick(x, y);
			this.checkSuccess();
		}
	}
	toggleFlag(index: number, event?: MouseEvent) {
		event?.preventDefault();
		const tile = this.panel[index];

		if (this.success || this.gameOver !== -1 || tile.class) {
			return;
		}

		tile.flagged = !tile.flagged;
		tile.flagged ? this.minesLeft-- : this.minesLeft++;
	}
	private toIndex = (x: number, y: number) => x + y * this.width;
	private inRange = (x: number, y: number) => x >= 0 && x < this.width && y >= 0 && y < this.height;
	private canClick = (x: number, y: number) => {
		if (!this.inRange(x, y)) return false;
		const tile = this.panel[this.toIndex(x, y)];
		return !tile.class && !tile.flagged;
	}
	private tryClick = (x: number, y: number) => this.canClick(x, y) && this.click(this.toIndex(x, y));
	private getNeighborMines(ox: number, oy: number) {
		let count = 0;

		for (let y = -1; y <= 1; y++) {
			for (let x = -1; x <= 1; x++) {
				if (x !== 0 || y !== 0) {
					const tx = x + ox, ty = y + oy;
					if (this.inRange(tx, ty) && this.panel[this.toIndex(tx, ty)].mine) {
						count++;
					}
				}
			}
		}

		return count;
	}
	private getNeighborFlags(ox: number, oy: number) {
		let count = 0;

		for (let y = -1; y <= 1; y++) {
			for (let x = -1; x <= 1; x++) {
				if (x !== 0 || y !== 0) {
					const tx = x + ox, ty = y + oy;
					if (this.inRange(tx, ty) && this.panel[this.toIndex(tx, ty)].flagged) {
						count++;
					}
				}
			}
		}

		return count;
	}
	private floodClick(x: number, y: number) {
		const stack = [x, y];
		const pushStack = (x: number, y: number) => this.canClick(x, y) && stack.push(x, y);

		while (stack.length) {
			const y = stack.pop()!;
			const x = stack.pop()!;
			const neighbors = this.getNeighborMines(x, y);
			const tile = this.panel[this.toIndex(x, y)];
			tile.number = neighbors;
			tile.class = `show n${neighbors}`;

			if (neighbors === 0) {
				pushStack(x - 1, y - 1);
				pushStack(x, y - 1);
				pushStack(x + 1, y - 1);
				pushStack(x - 1, y);
				pushStack(x + 1, y);
				pushStack(x - 1, y + 1);
				pushStack(x, y + 1);
				pushStack(x + 1, y + 1);
			}
		}
	}
	private tryNeighbors(x: number, y: number) {
		const tile = this.panel[this.toIndex(x, y)];

		if (tile.number <= this.getNeighborFlags(x, y)) {
			this.tryClick(x - 1, y - 1);
			this.tryClick(x, y - 1);
			this.tryClick(x + 1, y - 1);
			this.tryClick(x - 1, y);
			this.tryClick(x + 1, y);
			this.tryClick(x - 1, y + 1);
			this.tryClick(x, y + 1);
			this.tryClick(x + 1, y + 1);
		}
	}
	private checkSuccess() {
		for (const t of this.panel) {
			if (!t.mine && !t.class) {
				return;
			}
		}

		for (const t of this.panel) {
			if (t.mine) {
				t.flagged = true;
			}
		}

		window.clearInterval(this.timer);
		this.minesLeft = 0;
		this.success = true;
	}
}
