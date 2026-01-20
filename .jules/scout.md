## 2024-05-23 - Textmode.js Type & Safety Patterns
**Finding:** `textmode.js` type definitions require specific handling. `TextmodeFont` is under `loadables` namespace, and core properties like `drawFramebuffer` are optional, necessitating non-null assertions (`!`) as runtime checks are discouraged.
**Implication:** Agents might fail to build if they assume top-level exports or strict null safety without assertions.
**Guidance:** Use `import { loadables } from 'textmode.js'` for font types. Use `!` for accessing `drawFramebuffer` when confident it exists.
