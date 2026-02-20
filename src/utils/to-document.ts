export function toDocument(root: Element | Document): Document {
    if (root instanceof Document) {
        return root
    }

    return new DOMParser().parseFromString(root.outerHTML, "text/html")
}