/**
 * Base class for file handling operations.
 * Provides common functionality for downloading files in the browser.
 */
export class FileHandler {

    /**
     * Downloads content as a file
     * @param blob The content to download
     * @param filename The filename to use for the downloaded file
     * @param extension The file extension to append if missing (e.g. '.png')
     */
    public $downloadFile(blob: Blob, filename: string | undefined, extension?: string): void {
        try {
            const sanitizedFilename = this._sanitizeFilename(filename, extension);

            const url = URL.createObjectURL(blob);

            // Create temporary download link
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = sanitizedFilename;
            downloadLink.style.display = 'none';
            downloadLink.rel = 'noopener';

            // Add to DOM, click, and remove
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            // Clean up the URL to free memory
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('[textmode-export] Failed to download file:', error);
        }
    }

    /**
     * Validates and sanitizes filename for safety and compatibility
     * @param filename The filename to validate
     * @param extension Optional extension to ensure is present
     * @returns Sanitized filename
     */
    private _sanitizeFilename(filename: string | undefined, extension?: string): string {
        let baseName = filename;

        if (!baseName || !baseName.trim()) {
            baseName = this._generateDefaultFilename();
        }

        const normalized = baseName.trim()
            .replace(/[<>:"/\\|?*]/g, '_')
            .replace(/\s+/g, '_');

        const collapsed = normalized
            .replace(/_{2,}/g, '_')
            .replace(/^_+|_+$/g, '');

        let sanitized = collapsed.substring(0, 255) || this._generateDefaultFilename();

        if (extension) {
            if (!sanitized.toLowerCase().endsWith(extension.toLowerCase())) {
                sanitized += extension;
            }
        }

        return sanitized;
    }

    /**
     * Generates a default filename with timestamp
     * @returns Generated filename
     */
    private _generateDefaultFilename(): string {
        return `textmode-export-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
    }
}
