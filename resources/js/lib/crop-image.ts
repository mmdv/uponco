/** A crop region in the source image's natural pixels, from react-easy-crop. */
export type PixelCrop = {
    x: number;
    y: number;
    width: number;
    height: number;
};

// Avatars never need to be larger than this; capping the export keeps uploads
// small and well under the server's size limit regardless of the source photo.
const MAX_OUTPUT_SIZE = 512;

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', () =>
            reject(new Error('Could not load the selected image.')),
        );
        image.src = src;
    });
}

/**
 * Keep the export in the source's own format when it is one we accept, so a PNG
 * stays lossless and a JPEG/WebP stays compact; anything else falls back to JPEG.
 */
function outputFormatFor(sourceType: string): { mime: string; extension: string } {
    if (sourceType === 'image/png') {
        return { mime: 'image/png', extension: 'png' };
    }

    if (sourceType === 'image/webp') {
        return { mime: 'image/webp', extension: 'webp' };
    }

    return { mime: 'image/jpeg', extension: 'jpg' };
}

/**
 * Draw the chosen crop region onto a square canvas and return it as an upload
 * file. The canvas is square by construction, so the result is always 1:1 — the
 * shape the server enforces.
 */
export async function cropImageToSquareFile(
    imageSrc: string,
    crop: PixelCrop,
    sourceType: string,
): Promise<File> {
    const image = await loadImage(imageSrc);

    // Never upscale past the source crop; only shrink oversized photos.
    const size = Math.min(MAX_OUTPUT_SIZE, Math.round(crop.width));

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('Canvas is not available in this browser.');
    }

    context.imageSmoothingQuality = 'high';
    context.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        size,
        size,
    );

    const { mime, extension } = outputFormatFor(sourceType);

    const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, mime, 0.92);
    });

    if (!blob) {
        throw new Error('Could not export the cropped image.');
    }

    return new File([blob], `avatar.${extension}`, { type: mime });
}
