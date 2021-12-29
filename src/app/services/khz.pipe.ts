import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'khz' })
export class KHZPipe implements PipeTransform {
	transform(hz: number) {
		return Math.floor(hz / 1000) + ' kHz';
	}
}
