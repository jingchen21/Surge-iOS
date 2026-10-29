// ======================================================
// SPDB splash ad image dimension filter
//
//
// Goal:
// Match images by actual dimensions. The original sample is 1125 x 1931; do not infer dimensions from the phone model.
//
// Supported formats:
// JPEG / JPG / PNG / GIF
//
// Pass through all other dimensions and formats.
//
// Required setup:
// requires-body=true
// binary-body-mode=true
// max-size=0
// ======================================================

const TARGET_WIDTH = 1125;
const TARGET_HEIGHT = 1931;


// ==========================
// Read a big-endian 32-bit integer
// ==========================

function readBE32(bytes, offset) {
    return (
        ((bytes[offset] << 24) >>> 0) |
        (bytes[offset + 1] << 16) |
        (bytes[offset + 2] << 8) |
        bytes[offset + 3]
    ) >>> 0;
}


// ==========================
// PNG
// ==========================

function getPNGSize(bytes) {

    if (bytes.length < 24) {
        return null;
    }

    const isPNG =
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4E &&
        bytes[3] === 0x47 &&
        bytes[4] === 0x0D &&
        bytes[5] === 0x0A &&
        bytes[6] === 0x1A &&
        bytes[7] === 0x0A;

    if (!isPNG) {
        return null;
    }

    return {
        type: "PNG",
        width: readBE32(bytes, 16),
        height: readBE32(bytes, 20)
    };
}


// ==========================
// GIF
// ==========================

function getGIFSize(bytes) {

    if (bytes.length < 10) {
        return null;
    }

    const isGIF =
        bytes[0] === 0x47 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x38 &&
        (bytes[4] === 0x37 || bytes[4] === 0x39) &&
        bytes[5] === 0x61;

    if (!isGIF) {
        return null;
    }

    return {
        type: "GIF",
        width: bytes[6] | (bytes[7] << 8),
        height: bytes[8] | (bytes[9] << 8)
    };
}


// ==========================
// JPEG / JPG
// ==========================

function getJPEGSize(bytes) {

    if (
        bytes.length < 4 ||
        bytes[0] !== 0xFF ||
        bytes[1] !== 0xD8
    ) {
        return null;
    }

    let pos = 2;

    while (pos + 8 < bytes.length) {

        if (bytes[pos] !== 0xFF) {
            pos++;
            continue;
        }

        while (
            pos < bytes.length &&
            bytes[pos] === 0xFF
        ) {
            pos++;
        }

        if (pos >= bytes.length) {
            break;
        }

        const marker = bytes[pos++];

        // Marker without a length field
        if (
            marker === 0xD8 ||
            marker === 0xD9 ||
            marker === 0x01 ||
            (marker >= 0xD0 && marker <= 0xD7)
        ) {
            continue;
        }

        if (pos + 1 >= bytes.length) {
            break;
        }

        const segmentLength =
            (bytes[pos] << 8) |
            bytes[pos + 1];

        if (
            segmentLength < 2 ||
            pos + segmentLength > bytes.length
        ) {
            break;
        }

        const isSOF =
            marker === 0xC0 ||
            marker === 0xC1 ||
            marker === 0xC2 ||
            marker === 0xC3 ||
            marker === 0xC5 ||
            marker === 0xC6 ||
            marker === 0xC7 ||
            marker === 0xC9 ||
            marker === 0xCA ||
            marker === 0xCB ||
            marker === 0xCD ||
            marker === 0xCE ||
            marker === 0xCF;

        if (isSOF && segmentLength >= 7) {

            const height =
                (bytes[pos + 3] << 8) |
                bytes[pos + 4];

            const width =
                (bytes[pos + 5] << 8) |
                bytes[pos + 6];

            return {
                type: "JPEG",
                width: width,
                height: height
            };
        }

        pos += segmentLength;
    }

    return null;
}


// ==========================
// Main logic
// ==========================

try {

    console.log("[SPDB] =========================");
    console.log("[SPDB] Script started");
    console.log("[SPDB] URL = " + $request.url);

    const body = $response.body;

    console.log(
        "[SPDB] Body type = " +
        Object.prototype.toString.call(body)
    );

    if (!(body instanceof Uint8Array)) {

        console.log(
            "[SPDB] Body is not a Uint8Array -> PASS"
        );

        $done({});

    } else {

        console.log(
            "[SPDB] Body size = " +
            body.length +
            " bytes"
        );

        const info =
            getPNGSize(body) ||
            getGIFSize(body) ||
            getJPEGSize(body);

        if (!info) {

            console.log(
                "[SPDB] Unrecognized image format -> PASS"
            );

            $done({});

        } else {

            console.log(
                "[SPDB] Image = " +
                info.type +
                " " +
                info.width +
                "x" +
                info.height
            );

            if (
                info.width === TARGET_WIDTH &&
                info.height === TARGET_HEIGHT
            ) {

                console.log(
                    "[SPDB] *** Splash ad matched " +
                    TARGET_WIDTH +
                    "x" +
                    TARGET_HEIGHT +
                    " → HARD DROP ★★★"
                );

                // Abort the response directly
                // Do not return the original ad image to the app
                $done();

            } else {

                console.log(
                    "[SPDB] Normal image " +
                    info.width +
                    "x" +
                    info.height +
                    " -> PASS"
                );

                $done({});
            }
        }
    }

} catch (error) {

    console.log(
        "[SPDB] ❌ ERROR = " +
        error
    );

    // Pass through by default on errors
    $done({});
}