import { QueryConfig } from "../query-builders.js"
import { toDocument } from "./to-document.js"

export function selectManyElements(query: QueryConfig, root: Element | Document): Element[] {
    if (query.type === "css") {
        return Array.from(root.querySelectorAll(query.value))
    } else {
        const document = toDocument(root)

        const result = document.evaluate(
            query.value,
            root,
            null,
            XPathResult.ORDERED_NODE_ITERATOR_TYPE,
            null
        )

        const elements: Element[] = []
        let node = result.iterateNext()

        while (node) {
            elements.push(node as Element)
            node = result.iterateNext()
        }

        return elements
    }
}