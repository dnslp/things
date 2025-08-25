export interface AACSymbol {
  title: string
  file_name: string
  slug: string
  category: string
  tags: string[]
  volume: number
  added_on?: string
}

export interface SemanticRelation {
  category: string
  attributes?: string[]
  relatedConcepts?: string[]
  contexts?: string[]
  actions?: string[]
  descriptors?: string[]
  objects?: string[]
  tools?: string[]
  locations?: string[]
  times?: string[]
  relatedActions?: string[]
}

export interface PhraseTemplate {
  id: string
  structure: string[]
  category: string
  frequency?: number
}