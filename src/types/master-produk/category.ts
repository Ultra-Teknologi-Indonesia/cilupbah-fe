

export interface CategoryNode {
  id: string
  name: string
  children?: CategoryNode[]
}


export interface SelectedCategory {
  id: string
  name: string
  path: string[]
}
