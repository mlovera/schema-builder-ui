/**
 * Validation Rules Configuration
 *
 * Defines available validation rules for each data type in the schema builder.
 * Each data type has specific validation options with their input types and labels.
 */

import type { DataType, ValidationRuleConfig } from "@/lib/types/schema"

/**
 * Mapping of data types to their available validation rules
 * Used to dynamically generate validation UI based on selected data type
 */
export const VALIDATION_RULES_BY_TYPE: Record<DataType, ValidationRuleConfig[]> = {
  string: [
    { name: "required", type: "boolean", label: "Required" },
    { name: "min_length", type: "number", label: "Minimum Length", placeholder: "0" },
    { name: "max_length", type: "number", label: "Maximum Length", placeholder: "100" },
    { name: "pattern", type: "text", label: "Regex Pattern", placeholder: "^[a-zA-Z]+$" },
    { name: "has_symbols", type: "boolean", label: "Must Have Symbols" },
    { name: "has_numbers", type: "boolean", label: "Must Have Numbers" },
    { name: "has_uppercase", type: "boolean", label: "Must Have Uppercase" },
    { name: "has_lowercase", type: "boolean", label: "Must Have Lowercase" },
  ],
  number: [
    { name: "required", type: "boolean", label: "Required" },
    { name: "min", type: "number", label: "Minimum Value", placeholder: "0" },
    { name: "max", type: "number", label: "Maximum Value", placeholder: "100" },
    { name: "integer_only", type: "boolean", label: "Integer Only" },
    { name: "positive_only", type: "boolean", label: "Positive Only" },
  ],
  boolean: [
    { name: "required", type: "boolean", label: "Required" },
    { name: "must_be_true", type: "boolean", label: "Must Be True" },
  ],
  array: [
    { name: "required", type: "boolean", label: "Required" },
    { name: "min_items", type: "number", label: "Minimum Items", placeholder: "0" },
    { name: "max_items", type: "number", label: "Maximum Items", placeholder: "10" },
    { name: "unique_items", type: "boolean", label: "Unique Items Only" },
  ],
  object: [{ name: "required", type: "boolean", label: "Required" }],
}
