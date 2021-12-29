export function createWaveFile(data: Uint8Array, rate: number, channels = 1) {
	const metadataLength = 12 + 24 + 8;
	const dataLength = data.length;

	const meta = Buffer.alloc(metadataLength);

	// Header
	meta.write('RIFF', 0); // "RIFF"
	meta.writeUInt32LE(metadataLength + dataLength, 4); // ChunkSize
	meta.write('WAVE', 8); // "WAVE"

	// "fmt " subchunk
	meta.write('fmt ', 12); // "fmt "
	meta.writeUInt32LE(16, 16); // PCM subchunk size = 16
	meta.writeUInt16LE(1, 20); // AudioFormat = 1 (PCM)
	meta.writeUInt16LE(channels, 22); // Number of Channels = 1
	meta.writeUInt32LE(rate, 24); // Sample Rate
	meta.writeUInt32LE(rate * channels, 28); // Byte Rate = SampleRate * NumChannels * BitsPerSample / 8
	meta.writeUInt16LE(channels, 32); // BlockAlign = NumChannels * BitsPerSample / 8
	meta.writeUInt16LE(8, 34); // Bits per Sample = 8

	// "data" subchunk
	meta.write('data', 36); // "data"
	meta.writeUInt32LE(dataLength, 40); // Data Size

	const result = Buffer.concat([meta, data]);
	const blob = new Blob([result], { type: 'audio/x-wav' });
	return blob;
}

function repeatEach<T>(items: T[], count: number): T[] {
	if (count === 1) return items;

	const result: T[] = [];
	const add = (item: T) => {
		for (let i = 0; i < count; i++) {
			result.push(item);
		}
	};
	items.map(add);
	return result;
}

export function generateFromJS(source: string, duration: number, rate: number, quality = 1) {
	const composer = window.compileComposer(source) as (t: number) => number;
	const bytes = new Array<number>();

	for (let t = 0; t < duration * rate; t++) {
		bytes.push(composer(t) & 0xff);
	}

	return {
		bytes,
		blob: createWaveFile(Uint8Array.from(repeatEach(bytes, quality)), rate * quality),
	};
}
