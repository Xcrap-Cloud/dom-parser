export type QueryConfig = {
    value: string
    type: "css" | "xpath"
}

export function css(query: string): QueryConfig {
    return {
        value: query,
        type: "css",
    }
}

export function xpath(query: string): QueryConfig {
    return {
        value: query,
        type: "xpath",
    }
}
