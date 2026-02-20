# 🕷️ Xcrap DOM Extractor

> Extracting data from HTML using declarative models — part of the [Xcrap](https://github.com/xcrap) framework.

Xcrap DOM is a **client-side** package designed for DOM data extraction using declarative models. It works natively in browser environments (browser extensions, TamperMonkey user scripts, etc.) and supports both **CSS selectors** and **XPath** queries out of the box.

---

## 📦 Installation

Installation is very simple; you can use NPM or any other package manager of your choice, such as PNPM, Yarn, etc.

```bash
npm i @xcrap/dom

```

---

## 🛠️ Quick Start

### Creating a parser

`DomParser` receives an HTML string and parses it into a document internally.

```ts
import { DomParser } from "@xcrap/dom"

const html = document.documentElement.outerHTML
const parser = new DomParser(html)
```

---

## 🔍 Query Builders

Instead of passing raw strings as queries, use the `css()` and `xpath()` helpers to build typed `QueryConfig` objects.

```ts
import { css, xpath } from "@xcrap/dom"

css("h1")               // { type: "css",   value: "h1" }
xpath("//h1")           // { type: "xpath", value: "//h1" }
```

---

## 📤 Extracting Data

### `extractValue` — single value from a single element

```ts
import { DomParser, css, extract } from "@xcrap/dom"

const html = `<html><body><h1>Hello World</h1></body></html>`
const parser = new DomParser(html)

const title = parser.extractValue({
    query: css("h1"),
    extractor: extract("innerText"),
    default: null  // returned if the element is not found
})

console.log(title) // "Hello World"
```

### `extractValues` — one value per matched element

```ts
import { DomParser, css, extractHref } from "@xcrap/dom"

const html = `<html><body><a href="/a">A</a><a href="/b">B</a></body></html>`
const parser = new DomParser(html)

const links = parser.extractValues({
    query: css("a"),
    extractor: extractHref,
    limit: 10  // optional
})

console.log(links) // ["/a", "/b"]
```

### `extractModel` — parse a subtree with a `DomExtractionModel`

```ts
import { DomParser, DomExtractionModel, css, extract } from "@xcrap/dom"

const html = `<html><body>
  <h1>Header</h1>
  <p id="user-id">42</p>
  <p class="username">john_doe</p>
</body></html>`

const parser = new DomParser(html)

const model = new DomExtractionModel({
    heading:  { query: css("h1"),        extractor: extract("innerText") },
    userId:   { query: css("#user-id"),  extractor: extract("innerText") },
    username: { query: css(".username"), extractor: extract("innerText") },
})

const data = parser.extractModel({ model })

console.log(data)
// { heading: "Header", userId: "42", username: "john_doe" }
```

### `extractModels` — parse a list of elements, each with the same model

```ts
import { DomParser, DomExtractionModel, css, extractInnerText, extractHref } from "@xcrap/dom"

const html = `<html><body>
  <ul>
    <li><a href="/page/1">Page 1</a></li>
    <li><a href="/page/2">Page 2</a></li>
    <li><a href="/page/3">Page 3</a></li>
  </ul>
</body></html>`

const parser = new DomParser(html)

const itemModel = new DomExtractionModel({
    label: { query: css("a"), extractor: extractInnerText },
    url:   { query: css("a"), extractor: extractHref },
})

const items = parser.extractModels({
    query: css("li"),
    model: itemModel,
    limit: 10  // optional
})

console.log(items)
// [
//   { label: "Page 1", url: "/page/1" },
//   { label: "Page 2", url: "/page/2" },
//   { label: "Page 3", url: "/page/3" },
// ]
```

---

## 🧩 `DomExtractionModel` — Declarative Extraction

`DomExtractionModel` receives a `shape` — a plain object where each key maps to an extraction descriptor.

### Base value descriptor

| Field | Type | Required | Description |
|---|---|---|---|
| `query` | `QueryConfig` | No | CSS or XPath query to locate the element |
| `extractor` | `ExtractorFunction` | **Yes** | Function that receives the element and returns a value |
| `multiple` | `boolean` | No | If `true`, matches all elements and returns an array |
| `limit` | `number` | No | Max number of elements when `multiple: true` |
| `default` | `string \| string[] \| null` | No | Fallback value when the element is not found |

### Nested model descriptor (sub-parsing)

| Field | Type | Required | Description |
|---|---|---|---|
| `query` | `QueryConfig` | **Yes** | Query to locate the root element for the nested model |
| `model` | `ExtractionModel` | **Yes** | Another `DomExtractionModel` to parse the subtree |
| `multiple` | `boolean` | No | If `true`, applies the model to every matched element |
| `limit` | `number` | No | Max number of elements when `multiple: true` |
| `extractor` | `ExtractorFunction` | No | Optional post-processor before feeding into `model.parse()` |

### Using XPath

```ts
import { DomExtractionModel, xpath, extract } from "@xcrap/dom"

const model = new DomExtractionModel({
    heading: {
        query: xpath("//h1"),
        extractor: extract("innerText")
    }
})
```

### Extracting arrays

```ts
import { DomExtractionModel, css, extractInnerText } from "@xcrap/dom"

const model = new DomExtractionModel({
    tags: {
        query: css("li"),
        extractor: extractInnerText,
        multiple: true,
        limit: 5
    }
})
```

### Nested models

```ts
import { DomExtractionModel, css, extractInnerText, extractHref } from "@xcrap/dom"

const linkModel = new DomExtractionModel({
    label: { query: css("a"), extractor: extractInnerText },
    href:  { query: css("a"), extractor: extractHref },
})

const pageModel = new DomExtractionModel({
    title: { query: css("h1"), extractor: extractInnerText },
    links: { query: css("li"), model: linkModel, multiple: true },
})
```

---

## ⚡ Built-in Extractors

Import and use pre-built extractors to avoid repetition:

| Extractor | Extracts |
|---|---|
| `extractInnerText` | `element.innerText` |
| `extractTextContent` | `element.textContent` |
| `extractInnerHtml` | `element.innerHTML` |
| `extractOuterHtml` | `element.outerHTML` |
| `extractTagName` | `element.tagName` |
| `extractClassList` | `element.classList` as `string[]` |
| `extractId` | `element.id` |
| `extractHref` | `href` attribute |
| `extractSrc` | `src` attribute |
| `extractValue` | `value` attribute |
| `extractStyle` | `style` attribute |
| `extractTitle` | `title` attribute |
| `extractPlaceholder` | `placeholder` attribute |
| `extractName` | `name` attribute |
| `extractType` | `type` attribute |
| `extractDisabled` | `disabled` attribute |
| `extractChecked` | `checked` attribute |
| `extractRequired` | `required` attribute |
| `extractAriaLabel` | `aria-label` attribute |
| `extractAriaHidden` | `aria-hidden` attribute |
| `extractAriaExpanded` | `aria-expanded` attribute |
| `extractChildElementCount` | `element.childElementCount` |
| `extractLocalName` | `element.localName` |
| `extractAttribute(name)` | any attribute by name |

### Using `extract()` directly

```ts
import { extract } from "@xcrap/dom"

// Property
extract("innerText")        // → element.innerText
extract("innerHTML")        // → element.innerHTML

// Attribute (second argument = true)
extract("data-id", true)    // → element.getAttribute("data-id")
extract("href", true)       // → element.getAttribute("href")
```

### Sibling helpers

```ts
import { fromNextElementSibling, fromPreviousElementSibling, extractInnerText } from "@xcrap/dom"

// Extracts innerText of the NEXT sibling
const nextText = fromNextElementSibling(extractInnerText)

// Extracts innerText of the PREVIOUS sibling
const prevText = fromPreviousElementSibling(extractInnerText)
```

---

## ⚠️ Environment

This package depends on browser-native APIs (`DOMParser`, `document.evaluate`, `XPathResult`, `window`, etc.).  
It is designed to run exclusively in **browser environments**:

- Browser extensions (Manifest V2 / V3)
- TamperMonkey / Greasemonkey user scripts
- In-browser web scraping tools

It will **not** work in Node.js without a DOM emulation layer (e.g., `jsdom` + `linkedom`).

---

## 🧪 Testing

```bash
npm run test
```

---

## 🤝 Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/my-feature`).
3. Commit your changes (`git commit -m 'feat: add my feature'`).
4. Push to the branch (`git push origin feature/my-feature`).
5. Open a Pull Request.

---

## 📝 License

This project is licensed under the [MIT License](./LICENSE).
