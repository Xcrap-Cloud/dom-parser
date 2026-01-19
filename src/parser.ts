import { ParsingModel } from "./parsing-model.interface.js"
import { HTMLElementNotFoundError } from "./errors.js"
import { ExtractorFunction } from "./extractors.js"

export type ParseManyOptions = {
    query: string
    extractor: ExtractorFunction
    limit?: number
}

export type ParseFirstOptions = {
    query?: string
    extractor: ExtractorFunction
    default?: string | null
}

export type ExtractFirstOptions = {
    query?: string
    model: ParsingModel
}

export type ExtractManyOptions = {
    query: string
    model: ParsingModel
    limit?: number
}

export class DomParser {
    readonly root: Document

    constructor(readonly source: string) {
        this.root = new window.DOMParser().parseFromString(source, "text/html")
    }

    parseMany({
        query,
        extractor,
        limit
    }: ParseManyOptions): (string | undefined)[] {
        const elements = this.root.querySelectorAll(query)

        const items: (string | undefined)[] = []

        for (const element of elements) {
            if (limit !== undefined && items.length >= limit) break
            const data = extractor(element as HTMLElement)
            items.push(data)
        }

        return items
    }

    parseFirst({
        query,
        extractor,
        default: default_
    }: ParseFirstOptions): any | undefined | null {
        let data: any | undefined | null

        if (query) {
            const element = this.root.querySelector(query)

            if (!element) {
                if (default_ !== undefined) return default_
                throw new HTMLElementNotFoundError(query)
            }

            data = extractor(element as HTMLElement)
        } else {
            data = extractor(this.root.documentElement)
        }

        return data ?? default_
    }

    extractFirst({ model, query }: ExtractFirstOptions) {
        const element = query
            ? this.root.querySelector(query)
            : this.root.documentElement

        if (!element) {
            throw new HTMLElementNotFoundError(query)
        }

        return model.parse(element.outerHTML)
    }

    extractMany({ model, query, limit }: ExtractManyOptions) {
        const elements = this.root.querySelectorAll(query)

        const dataList: any[] = []

        for (const element of elements) {
            if (limit !== undefined && dataList.length >= limit) break
            const data = model.parse(element.outerHTML)
            dataList.push(data)
        }

        return dataList
    }
}
