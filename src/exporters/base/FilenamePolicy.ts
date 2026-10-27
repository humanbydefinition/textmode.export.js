const MAX_FILENAME_BYTES = 255;
const encoder = new TextEncoder();

function truncateUTF8(value: string, maximumBytes: number): string {
	let output = '';
	let byteLength = 0;
	for (const character of value) {
		const characterBytes = encoder.encode(character).byteLength;
		if (byteLength + characterBytes > maximumBytes) break;
		output += character;
		byteLength += characterBytes;
	}
	return output;
}

/** Central filename normalization and canonical-extension policy. */
export class FilenamePolicy {
	public $resolve(filename: string | undefined, extension: `.${string}`, createdAt: Date = new Date()): string {
		const normalizedExtension = extension.toLowerCase();
		const supplied = filename?.trim();
		const withoutExtension = supplied?.toLowerCase().endsWith(normalizedExtension)
			? supplied.slice(0, -normalizedExtension.length)
			: supplied;
		const stem = this.$sanitizeStem(
			withoutExtension,
			createdAt,
			MAX_FILENAME_BYTES - encoder.encode(extension).length
		);
		return `${stem}${normalizedExtension}`;
	}

	public $sanitizeStem(
		filename: string | undefined,
		createdAt: Date = new Date(),
		maximumBytes = MAX_FILENAME_BYTES
	): string {
		const fallback = this.$defaultStem(createdAt);
		if (!filename?.trim()) return truncateUTF8(fallback, maximumBytes);

		const controlSafe = Array.from(filename.normalize('NFC'), (character) => {
			const codePoint = character.codePointAt(0) ?? 0;
			return codePoint < 32 || codePoint === 127 ? '_' : character;
		}).join('');
		const normalized = controlSafe
			.trim()
			.replace(/[<>:"/\\|?*]/g, '_')
			.replace(/\s+/g, '_')
			.replace(/\.{2,}/g, '_')
			.replace(/_+/g, '_')
			.replace(/^[._]+|[._]+$/g, '');
		const truncated = truncateUTF8(normalized, maximumBytes).replace(/[._]+$/g, '');
		return truncated || truncateUTF8(fallback, maximumBytes);
	}

	public $defaultStem(createdAt: Date = new Date()): string {
		return `textmode-export-${createdAt.toISOString().slice(0, 19).replace(/:/g, '-')}`;
	}
}
