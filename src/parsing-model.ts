import { MultipleQueryError, HTMLElementNotFoundError } from "./errors.js"
import { ParsingModel } from "./parsing-model.interface.js"
import { ExtractorFunction } from "./extractors.js"

export type DomParsingModelShapeBaseValue = {
    query?: string
    default?: string | string[] | null
    multiple?: boolean
    limit?: number
    extractor: ExtractorFunction
}

export type DomParsingModelShapeNestedValue = {
    query: string
    limit?: number
    multiple?: boolean
    model: ParsingModel
    extractor?: ExtractorFunction
}

export type DomParsingModelValue =
    | DomParsingModelShapeBaseValue
    | DomParsingModelShapeNestedValue

export type DomParsingModelShape = {
    [key: string]: DomParsingModelValue
}

export type ParseBaseValueReturnType =
    | (undefined | string)[]
    | string
    | null
    | undefined

export class DomParsingModel implements ParsingModel {
    constructor(readonly shape: DomParsingModelShape) { }

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
        value: DomParsingModelShapeBaseValue,
        root: Element
    ): ParseBaseValueReturnType {
        if (value.multiple) {
            if (!value.query) {
                throw new MultipleQueryError()
            }

            let elements = Array.from(root.querySelectorAll(value.query))

            if (value.limit !== undefined) {
                elements = elements.slice(0, value.limit)
            }

            return elements.map(element => value.extractor(element as HTMLElement))
        } else {
            const element = value.query
                ? root.querySelector(value.query)
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
        value: DomParsingModelShapeNestedValue,
        root: Element
    ) {
        if (value.multiple) {
            let elements = Array.from(root.querySelectorAll(value.query))

            if (value.limit !== undefined) {
                elements = elements.slice(0, value.limit)
            }

            return elements.map(element => value.model.parse(element.outerHTML))
        } else {
            const element = root.querySelector(value.query)

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
