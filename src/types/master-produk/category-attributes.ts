

export interface FormAttributeOption {
  id: number
  value: string
}

export interface FormAttributeChannelStatus {
  mapped: boolean
  required: boolean
}

export interface FormAttribute {
  attribute_id: number
  name: string
  is_required: boolean
  options: FormAttributeOption[]
  channels: Record<string, FormAttributeChannelStatus>
}

export interface CategoryFormAttributes {
  specifications: FormAttribute[]
  variant_types: FormAttribute[]
}
