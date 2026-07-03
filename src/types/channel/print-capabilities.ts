export interface PrintCapabilityOption {
  value: string;
  label: string;
  default?: boolean;
}

export interface PrintLabelCapabilities {
  source: string;
  document_types: PrintCapabilityOption[];
  document_sizes: PrintCapabilityOption[];
}
