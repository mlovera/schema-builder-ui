/**
 * Schema Utility Functions
 *
 * Helper functions for schema manipulation, validation, and data processing.
 * These utilities provide reusable logic for the schema builder components.
 */

import type { DataType, SchemaField, ValidationRule } from "@/lib/types/schema"
import { VALIDATION_RULES_BY_TYPE } from "@/lib/constants/validation-rules"

/**
 * Generates a cryptographically secure UUID
 * Falls back to a pseudo-random UUID for older browsers
 */
export const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c == "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Creates a new schema field with default validation rules
 * @param type - The data type for the new field
 * @returns A new SchemaField with appropriate defaults
 */
export const createSchemaField = (type: DataType): SchemaField => {
  const validationRules: ValidationRule[] = VALIDATION_RULES_BY_TYPE[type].map((rule) => ({
    name: rule.name,
    enabled: false,
    value: rule.type === "boolean" ? false : rule.type === "number" ? 0 : "",
  }))

  return {
    id: generateUUID(),
    display_name: "",
    data_type: type,
    validation_rules: validationRules,
    properties: type === "object" ? [] : undefined,
    item_schema: type === "array" ? undefined : undefined,
    selectedTypeToAdd: type === "object" || type === "array" ? "string" : undefined,
    isExpanded: true,
  }
}

/**
 * Updates a nested field in the schema tree using a dot-notation path
 * @param fields - Array of schema fields to search
 * @param path - Dot-notation path to the target field (e.g., "field1.subfield2")
 * @param updater - Function that receives the target field and returns the updated field
 * @returns Updated array of schema fields
 */
export const updateNestedField = (
  fields: SchemaField[],
  path: string,
  updater: (field: SchemaField) => SchemaField,
): SchemaField[] => {
  const pathParts = path.split(".")
  const fieldId = pathParts[0]

  return fields.map((field) => {
    if (field.id === fieldId) {
      if (pathParts.length === 1) {
        return updater(field)
      } else {
        const remainingPath = pathParts.slice(1).join(".")
        if (field.properties) {
          return {
            ...field,
            properties: updateNestedField(field.properties, remainingPath, updater),
          }
        } else if (field.item_schema) {
          return {
            ...field,
            item_schema: updater(field.item_schema),
          }
        }
      }
    }
    return field
  })
}

/**
 * Cleans schema fields for JSON export by removing UI-specific properties
 * and filtering out disabled validation rules
 * @param fields - Array of schema fields to clean
 * @returns Cleaned schema data suitable for JSON export
 */
export const cleanSchemaForExport = (fields: SchemaField[]): any[] => {
  return fields.map((field) => {
    const cleaned: any = {
      display_name: field.display_name,
      data_type: field.data_type,
      validation_rules: field.validation_rules
        .filter((rule) => rule.enabled)
        .reduce(
          (acc, rule) => {
            acc[rule.name] = rule.value
            return acc
          },
          {} as Record<string, any>,
        ),
    }

    if (field.data_type === "object" && field.properties) {
      cleaned.properties = cleanSchemaForExport(field.properties)
    } else if (field.data_type === "array" && field.item_schema) {
      cleaned.item_schema = cleanSchemaForExport([field.item_schema])[0]
    }

    return cleaned
  })
}

/**
 * Copies text to the system clipboard
 * @param text - Text to copy to clipboard
 * @returns Promise that resolves when copy is complete
 */
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error("Failed to copy to clipboard:", err)
    // Fallback for older browsers
    const textArea = document.createElement("textarea")
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand("copy")
    document.body.removeChild(textArea)
  }
}
