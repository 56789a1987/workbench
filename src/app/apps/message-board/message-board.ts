import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { rect, toHalfWidth } from '../../../utils';
import { WindowComponent } from 'src/app/window/window.component';

const serviceUrl = './services/board.json.php';
// const serviceUrl = 'http://localhost/workbench/services/board.json.php';

@Component({
	selector: 'app-message-board',
	templateUrl: './message-board.html',
	styleUrls: ['./message-board.scss']
})
export class AppMessageBoard implements OnInit {
	readonly size = rect(70, 50, 360, 600);
	@ViewChild(WindowComponent) window!: WindowComponent;
	close = () => {};
	board?: { name: string, message: string, time: number, date?: Date }[];
	userInput = '';
	message = '';
	constructor(private http: HttpClient) { }
	ngOnInit() {
		lastValueFrom(this.http.get(serviceUrl))
			.then((data: any) => {
				if (data.board) {
					this.board = data.board;
					this.message = '';

					for (const item of this.board!) {
						item.date = new Date(item.time * 1000);
					}
				} else if (data.message) {
					this.message = data.message;
				} else {
					this.message = 'Service unavailable';
				}
			})
			.catch(() => this.message = 'Service unavailable');
	}
	private submit() {
		if (!this.board || this.message === 'Submitting...') {
			return;
		}
		this.message = 'Submitting...';

		try {
			this.userInput = toHalfWidth(this.userInput).trim();
			const index = this.userInput.indexOf(':');
			if (index < 0) {
				throw new Error('Syntax error');
			}

			const name = this.userInput.slice(0, index).trim();
			const message = this.userInput.slice(index + 1).trim();
			if (!name || !message) {
				throw new Error('Syntax error');
			}

			const params = new HttpParams().set('name', name).set('message', message);
			lastValueFrom(this.http.get(serviceUrl, { params }))
				.then((data: any) => {
					if (data.message === 'ok') {
						this.ngOnInit();
					} else if (data.message) {
						this.message = data.message;
					} else {
						this.message = 'Service unavailable';
					}
				})
				.catch(() => this.message = 'Service unavailable');
		} catch (e) {
			if (e instanceof Error) {
				this.message = e.message;
			}
		}
		this.userInput = '';
	}
	keydown(e: KeyboardEvent) {
		if (e.keyCode === 13) {
			this.submit();
		}
	}
}
