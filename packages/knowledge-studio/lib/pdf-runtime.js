//#region node_modules/unpdf/dist/index.mjs
function polyfillDOMMatrix() {
	if (typeof globalThis.DOMMatrix !== "undefined") return;
	globalThis.DOMMatrix = class DOMMatrix {
		constructor(init) {
			if (Array.isArray(init) && init.length === 6) {
				this.a = init[0];
				this.b = init[1];
				this.c = init[2];
				this.d = init[3];
				this.e = init[4];
				this.f = init[5];
			} else {
				this.a = 1;
				this.b = 0;
				this.c = 0;
				this.d = 1;
				this.e = 0;
				this.f = 0;
			}
		}
		translateSelf(tx, ty = 0) {
			this.e = this.a * tx + this.c * ty + this.e;
			this.f = this.b * tx + this.d * ty + this.f;
			return this;
		}
		scaleSelf(sx, sy = sx) {
			this.a *= sx;
			this.b *= sx;
			this.c *= sy;
			this.d *= sy;
			return this;
		}
	};
}
/**
* Stubs browser globals that PDF.js expects at the module level
* in non-browser environments.
*
* @remarks
* Must be called before importing any PDF.js module, since PDF.js
* accesses these globals at parse time (top-level constants).
*/
function stubBrowserGlobals() {
	polyfillDOMMatrix();
}
let resolvedModule;
const isNode = globalThis.process?.release?.name === "node";
/**
* Returns a `PDFDocumentProxy` instance from a given binary data.
*
* Applies the following defaults:
* - `useSystemFonts: true`
*
* In Node.js environments, additionally applies:
* - `disableFontFace: true`
* - `standardFontDataUrl` resolved from the local `pdfjs-dist` package
* - `cMapUrl` and `cMapPacked` resolved from the local `pdfjs-dist` package
*/
async function getDocumentProxy(data, options = {}) {
	const { getDocument } = await getResolvedPDFJS();
	let nodeDefaults = {};
	if (isNode) try {
		const base = import.meta.resolve("pdfjs-dist/package.json");
		nodeDefaults = {
			disableFontFace: true,
			standardFontDataUrl: new URL("./standard_fonts/", base).href,
			cMapUrl: new URL("./cmaps/", base).href,
			cMapPacked: true
		};
	} catch {}
	return await getDocument({
		data,
		useSystemFonts: true,
		...nodeDefaults,
		...options
	}).promise;
}
/**
* Runs an operation on a `PDFDocumentProxy` resolved from either binary data
* or an existing proxy. Documents created here are destroyed once the
* operation settles – caller-supplied proxies keep their lifecycle with the
* caller.
*/
async function withDocument(data, operation, options) {
	const pdf = isPDFDocumentProxy(data) ? data : await getDocumentProxy(data, options);
	try {
		return await operation(pdf);
	} finally {
		if (pdf !== data) await pdf.loadingTask.destroy();
	}
}
async function getResolvedPDFJS() {
	if (!resolvedModule) await resolvePDFJSImport();
	return resolvedModule;
}
async function resolvePDFJSImport(pdfjsResolver, { reload = false } = {}) {
	if (resolvedModule && !reload) return;
	stubBrowserGlobals();
	if (pdfjsResolver) try {
		resolvedModule = await interopDefault(pdfjsResolver());
		return;
	} catch (error) {
		throw new Error(`PDF.js could not be resolved: ${error}`);
	}
	try {
		resolvedModule = await import("./pdfjs.js");
	} catch (error) {
		throw new Error(`Serverless PDF.js bundle could not be resolved: ${error}`);
	}
}
function isPDFDocumentProxy(data) {
	return typeof data === "object" && data !== null && "_pdfInfo" in data;
}
async function interopDefault(m) {
	const resolved = await m;
	return resolved.default || resolved;
}
/**
* Derived from the PDF.js project by the Mozilla Foundation.
* @see https://github.com/mozilla/pdf.js/blob/b8de9a372f9bbf7e33adb362eeae5ef1919dba73/src/display/canvas_factory.js#L18
* @license Apache-2.0
*/
/**
* Derived from the PDF.js project by the Mozilla Foundation.
* @see https://github.com/mozilla/pdf.js/blob/b8de9a372f9bbf7e33adb362eeae5ef1919dba73/src/display/canvas_factory.js#L18
* @license Apache-2.0
*/
async function extractText$1(data, options = {}) {
	const { mergePages = false } = options;
	return await withDocument(data, async (pdf) => {
		const texts = await Promise.all(Array.from({ length: pdf.numPages }, (_, i) => getPageText(pdf, i + 1)));
		return {
			totalPages: pdf.numPages,
			text: mergePages ? normalizeMergedText(texts) : texts
		};
	});
}
async function getPageText(document, pageNumber) {
	return (await (await document.getPage(pageNumber)).getTextContent()).items.filter((item) => item.str != null).map((item) => item.str + (item.hasEOL ? "\n" : "")).join("");
}
/**
* Collapses whitespace without destroying the line structure: `hasEOL` and
* page-join line breaks survive, but at most one blank line remains.
*/
function normalizeMergedText(texts) {
	return texts.join("\n").replace(/[^\S\n]+/g, " ").replace(/ ?\n ?/g, "\n").replace(/\n{3,}/g, "\n\n");
}
const extractText = async (...args) => {
	await resolvePDFJSImport();
	return await extractText$1(...args);
};
//#endregion
//#region src/host/pdf-runtime.ts
function extractPdfText(bytes) {
	return extractText(bytes, { mergePages: false });
}
//#endregion
export { extractPdfText };
