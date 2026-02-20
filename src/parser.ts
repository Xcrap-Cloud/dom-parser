import { selectManyElements, selectFirstElement } from "./utils/index.js"
import { ExtractionModel } from "./extraction-model.interface.js"
import { HTMLElementNotFoundError } from "./errors.js"
import { ExtractorFunction } from "./extractors.js"
import { QueryConfig } from "./query-builders.js"

export type ExtractValuesOptions = {
    query: QueryConfig
    extractor: ExtractorFunction
    limit?: number
}

export type ExtractValueOptions = {
    query?: QueryConfig
    extractor: ExtractorFunction
    default?: string | null
}

export type ExtractModelOptions = {
    query?: QueryConfig
    model: ExtractionModel
}

export type ExtractModelsOptions = {
    query: QueryConfig
    model: ExtractionModel
    limit?: number
}

export class DomParser {
    readonly root: Document

    constructor(readonly source: string) {
        this.root = new window.DOMParser().parseFromString(source, "text/html")
    }

    extractValues({
        query,
        extractor,
        limit
    }: ExtractValuesOptions): (string | undefined)[] {
        const elements = selectManyElements(query, this.root)

        const items: (string | undefined)[] = []

        for (const element of elements) {
            if (limit !== undefined && items.length >= limit) break
            const data = extractor(element as HTMLElement)
            items.push(data)
        }

        return items
    }

    extractValue({
        query,
        extractor,
        default: default_
    }: ExtractValueOptions): any | undefined | null {
        let data: any | undefined | null

        if (query) {
            const element = selectFirstElement(query, this.root)

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

    extractModel({ model, query }: ExtractModelOptions) {
        const element = query
            ? selectFirstElement(query, this.root)
            : this.root.documentElement

        if (!element) {
            throw new HTMLElementNotFoundError(query)
        }

        return model.parse(element.outerHTML)
    }

    extractModels({ model, query, limit }: ExtractModelsOptions) {
        const elements = selectManyElements(query, this.root)

        const dataList: any[] = []

        for (const element of elements) {
            if (limit !== undefined && dataList.length >= limit) break
            const data = model.parse(element.outerHTML)
            dataList.push(data)
        }

        return dataList
    }
}
