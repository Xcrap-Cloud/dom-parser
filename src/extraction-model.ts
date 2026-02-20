import { MultipleQueryError, HTMLElementNotFoundError } from "./errors.js"
import { selectManyElements, selectFirstElement } from "./utils/index.js"
import { ExtractionModel } from "./extraction-model.interface.js"
import { ExtractorFunction } from "./extractors.js"
import { QueryConfig } from "./query-builders.js"

export type DomExtractionModelShapeBaseValue = {
    query?: QueryConfig
    default?: string | string[] | null
    multiple?: boolean
    limit?: number
    extractor: ExtractorFunction
}

export type DomExtractionModelShapeNestedValue = {
    query: QueryConfig
    limit?: number
    multiple?: boolean
    model: ExtractionModel
    extractor?: ExtractorFunction
}

export type DomExtractionModelValue =
    | DomExtractionModelShapeBaseValue
    | DomExtractionModelShapeNestedValue

export type DomExtractionModelShape = {
    [key: string]: DomExtractionModelValue
}

export type ParseBaseValueReturnType =
    | (undefined | string)[]
    | string
    | null
    | undefined

export class DomExtractionModel implements ExtractionModel {
    constructor(readonly shape: DomExtractionModelShape) { }

    parse(source: string): any {
        const document = new window.DOMParser().parseFromString(source, "text/html")
        const root = document.documentElement

        const data: Record<keyof typeof this.shape, any> = {}

        for (const key in this.shape) {
            const value = this.shape[key]
            const isNestedValue = "model" in value

            if (isNestedValue) {
                data[key] = this.parseNestedValue(value, root)
            } else {
                data[key] = this.parseBaseValue(value, root)
            }
        }

        return data
    }

    protected parseBaseValue(
        value: DomExtractionModelShapeBaseValue,
        root: Element
    ): ParseBaseValueReturnType {
        if (value.multiple) {
            if (!value.query) {
                throw new MultipleQueryError()
            }

            let elements = selectManyElements(value.query, root)

            if (value.limit !== undefined) {
                elements = elements.slice(0, value.limit)
            }

            return elements.map(element => value.extractor(element as HTMLElement))
        } else {
            const element = value.query
                ? selectFirstElement(value.query, root)
                : root

            if (!element) {
                if (value.default === undefined) {
                    throw new HTMLElementNotFoundError(value.query)
                }

                return value.default
            }

            return value.extractor(element as HTMLElement)
        }
    }

    protected parseNestedValue(
        value: DomExtractionModelShapeNestedValue,
        root: Element
    ) {
        if (value.multiple) {
            let elements = selectManyElements(value.query, root)

            if (value.limit !== undefined) {
                elements = elements.slice(0, value.limit)
            }

            return elements.map(element => value.model.parse(element.outerHTML))
        } else {
            const element = selectFirstElement(value.query, root)

            if (!element) {
                throw new HTMLElementNotFoundError(value.query)
            }

            const source = value.extractor
                ? (value.extractor(element as HTMLElement)) as string
                : element.outerHTML

            return value.model.parse(source)
        }
    }
}
