import { QueryConfig } from "../query-builders.js"
import { toDocument } from "./to-document.js"

export function selectFirstElement(query: QueryConfig, root: Element | Document): Element | null {
    if (query.type === "css") {
        return root.querySelector(query.value)
    } else {
        const document = toDocument(root)

        return document.evaluate(
            query.value,
            root,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue as Element | null
    }
}