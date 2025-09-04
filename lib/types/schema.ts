/**
 * Schema Builder Type Definitions
 *
 * This file contains all TypeScript interfaces and types used throughout
 * the schema builder application for type safety and consistency.
 */

/** Supported data types in the schema builder */
export type DataType = "string" | "number" | "boolean" | "array" | "object"

/** Validation rule configuration for form inputs */
export interface ValidationRuleConfig {
  name: string
  type: "text" | "number" | "boolean"
  label: string
  placeholder?: string
}

/** Individual validation rule with its current state */
export interface ValidationRule {
  name: string
  enabled: boolean
  value?: string | number | boolean
}

/** Core schema field definition with all properties */
export interface SchemaField {
  id: string
  display_name: string
  data_type: DataType
  validation_rules: ValidationRule[]
  properties?: SchemaField[] // for objects
  item_schema?: SchemaField // for arrays
  selectedTypeToAdd?: DataType
  isExpanded?: boolean
}

/** Schema metadata for the schema list manager */
export interface Schema {
  id: string
  name: string
  fields: SchemaField[]
  createdAt: Date
  updatedAt: Date
}

/** Props for the SchemaBuilder component */
export interface SchemaBuilderProps {
  initialSchema?: SchemaField[]
  onSchemaChange?: (schema: SchemaField[]) => void
}

/** Complete schema output format for JSON export */
export interface SchemaOutput {
  name: string
  schema: SchemaField[]
}
