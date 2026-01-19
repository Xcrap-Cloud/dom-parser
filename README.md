# 🕷️ Xcrap DOM Parser: Parsing HTML using declarative models

Xcrap DOM is a package from the Xcrap framework, designed to handle DOM data extraction (client-side) using declarative models. It is perfect for use in web scraping extensions and TamperMonkey user scripts.

---

## 📦 Installation

Installation is very simple; you can use NPM or any other package manager of your choice, such as PNPM, Yarn, etc.

```bash
npm i @xcrap/dom

```

---

## 🛠️ How to Use

There are several ways to use this parsing engine, from using pre-made models to expanding it by creating parsers for other file types and maintaining the interlocking of these models.

### Providing an HTML string

```ts
import { DomParser } from "@xcrap/dom"

const html = "<html><head><title>Page Title</title></head><body></body></html>" // or document.documentElement.outerHTML
const parser = new DomParser(html)

```

### Data extraction without using models

```ts
import { DomParser, extract } from "@xcrap/dom"

const html = `<html><head><title>Page Title</title></head><body><a href="https://example.com">Link</a></body></html>`
const parser = new DomParser(html)

// parseFirst() searches for and extracts something from the first element found
// extract(key: string, isAttribute?: boolean) is a generic extraction function; you can use some that are already created and ready for use by importing them from the same location :)
const title = parser.parseFirst({ query: "title", extractor: extract("innerText") })

// parseMany() searches for all elements matching a query (you can limit the number of results) and uses the extractor to get the data
const links = parser.parseMany({ query: "a", extractor: extract("href", true) })

console.log(title) // "Page Title"
console.log(links) // ["https://example.com"]

```

### Data extraction using models

ParsingModels are sufficiently decoupled so that you don't have to rely on Parser instances, but we will use them here nonetheless:

```ts
import { DomParser, DomParsingModel, extract } from "@xcrap/dom"

const html = `<html><body><h1>Header</h1><div><p id="id">1</p><p id="name">Name</p><p class="age">23</p></div></body></html>`
const parser = new DomParser(html)

const rootParsingModel = new DomParsingModel({
	heading: {
		query: "h1",
		extractor: extract("innerText")
	},
	id: {
		query: "#id",
		extractor: extract("innerText")
	},
	name: {
		query: "#name",
		extractor: extract("innerText")
	},
	age: {
		query: ".age",
		extractor: extract("innerText")
	}
})

const data = parser.extractFirst({ model: rootParsingModel })

console.log(data) // { heading: "Header", id: "1", name: "Name", age: "23" }

```

## 🧠 Create your own Parser: Concepts

### What is a Parser?

A Parser for this library is a class that handles a file type in some way, loads that file, and may or may not have methods to easily extract data.

A parser has a default method called `parseModel`, which is a wrapper that receives a `ParsingModel` and calls the `parse()` method, providing the internal `source` property.

### What is a ParsingModel?

A Parsing Model is a class that receives a `shape` in its constructor and stores it as a property. It must have a method called `parse()` that receives a `source`, which is the code/text containing the information to be extracted.

This `shape` is used to declare how the information will be extracted from the `source`.

## 🧪 Testing

Automated tests are located in `__tests__`. To run them:

```bash
npm run test

```

## 🤝 Contributing

* Want to contribute? Follow these steps:
* Fork the repository.
* Create a new branch (`git checkout -b feature-new`).
* Commit your changes (`git commit -m 'Add new feature'`).
* Push to the branch (`git push origin feature-new`).
* Open a Pull Request.

## 📝 License

This project is licensed under the MIT License.
