import { sample } from 'lodash';

export interface Rect {
	x: number;
	y: number;
	w: number;
	h: number;
}

export interface Point {
	x: number;
	y: number;
}

export const enum RandStrFlag {
	None = 0,
	Number = 1,
	Uppercase = 2,
	Lowercase = 4,
	Symbols = 8,
}

export function getSampleChars(flags = RandStrFlag.Number | RandStrFlag.Uppercase | RandStrFlag.Lowercase) {
	let samp = '';
	if (flags & RandStrFlag.Number)
		samp += '0123456789';
	if (flags & RandStrFlag.Uppercase)
		samp += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	if (flags & RandStrFlag.Lowercase)
		samp += 'abcdefghijklmnopqrstuvwxyz';
	if (flags & RandStrFlag.Symbols)
		samp += '!"#$%&\'()*+,-./:;<=>?@[\\]_^`{|}~';
	return samp.split('');
}

export function randChar(flags?: RandStrFlag, samples = getSampleChars(flags)) {
	return sample(samples)!;
}

export function randStr(length = 32, flags?: RandStrFlag) {
	const samples = getSampleChars(flags);
	let s = '';
	for (let i = 0; i < length; i++)
		s += randChar(RandStrFlag.None, samples);
	return s;
}

export function repeatStr(str: string, times: number) {
	let s = '';
	for (let i = 0; i < times; i++)
		s += str;
	return s;
}

export function toHalfWidth(str: string) {
	let t = '';
	for (let i = 0; i < str.length; i++) {
		if (str.charCodeAt(i) === 12288) {
			t += String.fromCharCode(str.charCodeAt(i) - 12256);
			continue;
		}
		t += String.fromCharCode(str.charCodeAt(i) > 65280 && str.charCodeAt(i) < 65375 ? (str.charCodeAt(i) - 65248) : str.charCodeAt(i));
	}
	return t;
}

export function rect(x = 0, y = 0, w = 0, h = 0): Rect {
	return { x, y, w, h };
}

export function point(x = 0, y = 0): Point {
	return { x, y };
}

export const offsetTop = 20;
export function getContainerRect(id = 'container') {
	const range = document.getElementById(id)?.getBoundingClientRect();
	return rect(range?.left || 0, range?.top || 0, range?.width || window.innerWidth, range?.height || window.innerHeight);
}

export function getAsUint8Array(file: string): Promise<Uint8Array> {
	return fetch(file)
		.then(f => f.arrayBuffer())
		.then(buffer => new Uint8Array(buffer));
}

export function readFileAsArrayBuffer(file: File) {
	return new Promise<ArrayBuffer>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e: ProgressEvent<FileReader>) => resolve(e.target?.result as ArrayBuffer || new ArrayBuffer(0));
		reader.onerror = () => reject(new Error('Failed to read file'));
		reader.readAsArrayBuffer(file);
	});
}

export function readFileAsText(file: File) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e: ProgressEvent<FileReader>) => resolve(e.target?.result as string || '');
		reader.onerror = () => reject(new Error('Failed to read file'));
		reader.readAsText(file);
	});
}

export function delay(timeout: number) {
	return new Promise<void>(resolve => setTimeout(() => resolve(), timeout));
}

export function openLink(href: string) {
	const anchor = document.createElement('a');
	anchor.href = href;
	anchor.target = '_blank';
	anchor.rel = 'noopener noreferrer';
	document.body.appendChild(anchor);
	anchor.click();
	anchor.parentNode!.removeChild(anchor);
}
