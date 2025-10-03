/**
 * Convert a pixel array to an RGBA object.
 * @param pixels Pixel array (Uint8Array)
 * @param index Starting index in the pixel array
 * @returns RGBA object
 */
export function pixelsToRGBA(pixels: Uint8Array, index: number): { r: number; g: number; b: number; a: number } {
    return {
        r: pixels[index],
        g: pixels[index + 1],
        b: pixels[index + 2],
        a: pixels[index + 3]
    };
}