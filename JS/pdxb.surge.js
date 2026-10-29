// Source: user-supplied pdxb.js; original author and public URL not supplied.
// Surge adaptation: explicit abort, configurable exact dimensions, URL-free logs, parser bounds.
// The original 1125x1931 sample is not a verified iPhone 18 Pro asset size.
// Rebuild with scripts/build_apps.py; original file archived in maintenance/apps/source/pdxb.js.
// ======================================================
// SPDB splash ad image dimension filter
//
//
// Goal:
// Match image assets by configured dimensions; the default is 1125 x 1931 and is not inferred from the device model.
//
// Supported formats:
// JPEG / JPG / PNG / GIF
//
// Pass through all other dimensions and formats.
//
// Required setup:
// requires-body=true
// binary-body-mode=true
// max-size=-1 (Surge)
// ======================================================





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

    if (bytes.length < 33) {
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

    if (!isPNG || readBE32(bytes, 8) !== 13 || String.fromCharCode(...bytes.subarray(12, 16)) !== "IHDR") {
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

    if (bytes.length < 13) {
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

    while (pos < bytes.length) {

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
        if (marker === 0xD9 || marker === 0xDA) return null;

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

        if (isSOF && segmentLength >= 8 && bytes[pos + 7] > 0 && segmentLength === 8 + 3 * bytes[pos + 7]) {

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


(function () {
    let verbose = true;
    function log(message) { if (verbose) console.log("[SPDB] " + message); }
    try {
        const options = {};
        const argument = typeof $argument === "string" ? $argument : "";
        for (const pair of argument.split("&")) {
            const i = pair.indexOf("=");
            if (i > 0) options[pair.slice(0, i)] = pair.slice(i + 1);
        }
        verbose = options.log !== "0";
        function dimension(key, fallback) {
            if (!Object.prototype.hasOwnProperty.call(options, key)) return fallback;
            const value = options[key];
            return /^[1-9][0-9]{0,4}$/.test(value) && Number(value) <= 65535 ? Number(value) : null;
        }
        const width = dimension("width", 1125), height = dimension("height", 1931);
        if (!width || !height) { log("INVALID_TARGET PASS"); $done({}); return; }
        const request = typeof $request !== "undefined" && $request ? $request : {};
        const response = typeof $response !== "undefined" && $response ? $response : {};
        if (!/^https?:\/\/images?\.spdbccc\.com\.cn\/.+/i.test(request.url || "") ||
            (request.method && request.method.toUpperCase() !== "GET") || Number(response.status) !== 200) {
            $done({}); return;
        }
        const raw = response.body;
        let body;
        if (Object.prototype.toString.call(raw) === "[object ArrayBuffer]") body = new Uint8Array(raw);
        else if (ArrayBuffer.isView(raw)) body = new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength);
        if (!body || !body.length) { log("NO_BINARY_BODY PASS"); $done({}); return; }
        const info = getPNGSize(body) || getGIFSize(body) || getJPEGSize(body);
        if (!info || !info.width || !info.height) { log("UNKNOWN_IMAGE PASS"); $done({}); return; }
        const matched = info.width === width && info.height === height;
        log(info.type + " " + info.width + "x" + info.height + " target=" + width + "x" + height + (matched ? " BLOCK" : " PASS"));
        // In Surge $done() means passthrough. abort:true explicitly stops delivery.
        $done(matched ? {abort: true} : {});
    } catch (_) {
        log("PARSE_ERROR PASS");
        $done({});
    }
})();
