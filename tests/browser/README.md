# JSON sequence browser check

Run `npm run dev` and open `/tests/browser/json-sequence.html` on the Vite
server in a browser with WebGL2. The page reports `PASS` when two actual
renderer redraws export distinct glyphs into a valid v4 document. A `FAIL`
result includes the error. This check uses the installed `textmode.js` package
and complements the mocked unit tests; it is not part of `npm run check`.
