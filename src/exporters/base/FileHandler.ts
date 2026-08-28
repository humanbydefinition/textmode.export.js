/**
 * Base class for file handling operations.
 * Provides common functionality for downloading files in the browser.
 */
export class FileHandler {
	/**
	 * Downloads content as a file
	 *
	 * @param blob The content to download
	 * @param filename The filename to use for the downloaded file
	 */
	public $downloadFile(blob: Blob, filename: string | undefined, extension?: `.${string}`): void {
		const sanitizedFilename = extension
			? new FilenamePolicy().$resolve(filename, extension)
			: new FilenamePolicy().$sanitizeStem(filename);
		const url = URL.createObjectURL(blob);
		const downloadLink = document.createElement('a');
		try {
			downloadLink.href = url;
			downloadLink.download = sanitizedFilename;
			downloadLink.style.display = 'none';
			downloadLink.rel = 'noopener';
			document.body.appendChild(downloadLink);
			downloadLink.click();
		} finally {
			downloadLink.remove();
			setTimeout(() => URL.revokeObjectURL(url), 0);
		}
	}
}
import { FilenamePolicy } from './FilenamePolicy';
