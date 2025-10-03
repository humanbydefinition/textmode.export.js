/**
 * Base class for file handling operations.
 * Provides common functionality for downloading files in the browser.
 */
export declare class FileHandler {
    /**
     * Downloads content as a file
     * @param blob The content to download
     * @param filename The filename to use for the downloaded file
     */
    $downloadFile(blob: Blob, filename: string | undefined): void;
    /**
     * Validates and sanitizes filename for safety and compatibility
     * @param filename The filename to validate
     * @returns Sanitized filename
     */
    private _sanitizeFilename;
    /**
     * Generates a default filename with timestamp
     * @returns Generated filename
     */
    private _generateDefaultFilename;
}
//# sourceMappingURL=FileHandler.d.ts.map