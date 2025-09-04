"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Plus, ChevronDown, ChevronRight, Copy } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

type DataType = "string" | "number" | "boolean" | "array" | "object"

interface ValidationRule {
  name: string
  enabled: boolean
  value?: string | number | boolean
}

interface SchemaField {
  id: string
  display_name: string
  data_type: DataType
  validation_rules: ValidationRule[]
  properties?: SchemaField[] // for objects
  item_schema?: SchemaField // for arrays
  selectedTypeToAdd?: DataType
  isExpanded?: boolean
}

const VALIDATION_RULES_BY_TYPE: Record<
  DataType,
  Array<{ name: string; type: "text" | "number" | "boolean"; label: string; placeholder?: string }>
> = {
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

interface SchemaBuilderProps {
  initialSchema?: any[]
  onSchemaChange?: (schema: any[]) => void
}

export function SchemaBuilder({ initialSchema = [], onSchemaChange }: SchemaBuilderProps) {
  const [schema, setSchema] = useState<SchemaField[]>([])
  const [selectedTypeToAdd, setSelectedTypeToAdd] = useState<DataType>("string")

  useEffect(() => {
    if (initialSchema.length > 0 || schema.length === 0) {
      setSchema(initialSchema)
    }
  }, [initialSchema]) // Use length instead of the full array to prevent unnecessary updates

  useEffect(() => {
    if (onSchemaChange) {
      onSchemaChange(schema)
    }
  }, [schema]) // Only depend on schema, not onSchemaChange

  const createField = (type: DataType): SchemaField => {
    const validationRules = VALIDATION_RULES_BY_TYPE[type].map((rule) => ({
      name: rule.name,
      enabled: false,
      value: rule.type === "boolean" ? false : rule.type === "number" ? 0 : "",
    }))

    return {
      id: Math.random().toString(36).substr(2, 9),
      display_name: "",
      data_type: type,
      validation_rules: validationRules,
      properties: type === "object" ? [] : undefined,
      item_schema: type === "array" ? undefined : undefined,
      selectedTypeToAdd: type === "object" || type === "array" ? "string" : undefined,
      isExpanded: true,
    }
  }

  const addField = (parentPath?: string) => {
    const newField = createField(selectedTypeToAdd)

    if (!parentPath) {
      setSchema([...schema, newField])
    } else {
      setSchema((prev) =>
        updateNestedField(prev, parentPath, (field) => {
          if (field.data_type === "object") {
            return {
              ...field,
              properties: [...(field.properties || []), newField],
            }
          }
          return field
        }),
      )
    }
  }

  const updateNestedField = (
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

  const updateField = (path: string, updates: Partial<SchemaField>) => {
    setSchema((prev) => updateNestedField(prev, path, (field) => ({ ...field, ...updates })))
  }

  const updateValidationRule = (
    path: string,
    ruleName: string,
    enabled: boolean,
    value?: string | number | boolean,
  ) => {
    setSchema((prev) =>
      updateNestedField(prev, path, (field) => ({
        ...field,
        validation_rules: field.validation_rules.map((rule) =>
          rule.name === ruleName ? { ...rule, enabled, value } : rule,
        ),
      })),
    )
  }

  const removeField = (path: string) => {
    const pathParts = path.split(".")
    if (pathParts.length === 1) {
      setSchema((prev) => prev.filter((field) => field.id !== pathParts[0]))
    } else {
      const parentPath = pathParts.slice(0, -1).join(".")
      const fieldId = pathParts[pathParts.length - 1]
      setSchema((prev) =>
        updateNestedField(prev, parentPath, (field) => ({
          ...field,
          properties: field.properties?.filter((prop) => prop.id !== fieldId) || [],
        })),
      )
    }
  }

  const setArrayItemSchema = (path: string, itemType: DataType) => {
    const newItemSchema = createField(itemType)
    setSchema((prev) =>
      updateNestedField(prev, path, (field) => ({
        ...field,
        item_schema: newItemSchema,
      })),
    )
  }

  const copySchema = () => {
    const cleanSchema = (fields: SchemaField[]): any[] => {
      return fields.map((field) => {
        const cleaned: any = {
          display_name: field.display_name,
          data_type: field.data_type,
          validation_rules: field.validation_rules
            .filter((rule) => rule.enabled)
            .map((rule) => ({
              [rule.name]: rule.value,
            })),
        }

        if (field.data_type === "object" && field.properties) {
          cleaned.properties = cleanSchema(field.properties)
        } else if (field.data_type === "array" && field.item_schema) {
          cleaned.item_schema = cleanSchema([field.item_schema])[0]
        }

        return cleaned
      })
    }

    const schemaString = JSON.stringify(cleanSchema(schema), null, 2)
    navigator.clipboard.writeText(schemaString)
  }

  const renderValidationRules = (field: SchemaField, path: string) => {
    const availableRules = VALIDATION_RULES_BY_TYPE[field.data_type]

    return (
      <div className="space-y-3 mt-4">
        <Label className="text-sm font-medium">Validation Rules</Label>
        <div className="grid gap-3">
          {availableRules.map((ruleConfig) => {
            const rule = field.validation_rules.find((r) => r.name === ruleConfig.name)
            if (!rule) return null

            return (
              <div key={ruleConfig.name} className="flex items-center gap-3 p-3 border rounded-lg">
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={(enabled) => {
                    let defaultValue = rule.value
                    if (enabled && ruleConfig.type === "boolean") {
                      defaultValue = true
                    } else if (enabled && ruleConfig.type === "number") {
                      defaultValue = defaultValue || 0
                    } else if (enabled && ruleConfig.type === "text") {
                      defaultValue = defaultValue || ""
                    }
                    updateValidationRule(path, rule.name, enabled, defaultValue)
                  }}
                />
                <Label className="flex-1 text-sm">{ruleConfig.label}</Label>
                {rule.enabled && ruleConfig.type !== "boolean" && (
                  <div className="w-32">
                    {ruleConfig.type === "number" ? (
                      <Input
                        type="number"
                        value={(rule.value as number) || ""}
                        onChange={(e) => updateValidationRule(path, rule.name, true, Number(e.target.value))}
                        placeholder={ruleConfig.placeholder}
                        className="h-8"
                      />
                    ) : (
                      <Input
                        value={(rule.value as string) || ""}
                        onChange={(e) => updateValidationRule(path, rule.name, true, e.target.value)}
                        placeholder={ruleConfig.placeholder}
                        className="h-8"
                      />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderField = (field: SchemaField, path: string, depth = 0) => {
    const isContainer = field.data_type === "object" || field.data_type === "array"

    return (
      <Card key={field.id} className={`${depth > 0 ? "ml-6 border-l-2 border-l-blue-200" : ""}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            {isContainer && (
              <Collapsible open={field.isExpanded} onOpenChange={(open) => updateField(path, { isExpanded: open })}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                    {field.isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            )}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Display Name</Label>
                <Input
                  value={field.display_name}
                  onChange={(e) => updateField(path, { display_name: e.target.value })}
                  placeholder="Field name"
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Data Type</Label>
                <Select
                  value={field.data_type}
                  onValueChange={(value: DataType) => {
                    const newField = createField(value)
                    updateField(path, {
                      data_type: value,
                      validation_rules: newField.validation_rules,
                      properties: value === "object" ? [] : undefined,
                      item_schema: value === "array" ? undefined : undefined,
                      selectedTypeToAdd: value === "object" || value === "array" ? "string" : undefined,
                    })
                  }}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="array">Array</SelectItem>
                    <SelectItem value="object">Object</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Badge variant="outline" className="text-xs">
                  {field.validation_rules.filter((r) => r.enabled).length} rules active
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeField(path)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {renderValidationRules(field, path)}

          {field.data_type === "array" && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
              <Label className="text-sm font-medium mb-3 block">Array Item Schema</Label>
              {!field.item_schema ? (
                <div className="flex gap-2">
                  <Select value="string" onValueChange={(value: DataType) => setArrayItemSchema(path, value)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select item type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="array">Array</SelectItem>
                      <SelectItem value="object">Object</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={() => setArrayItemSchema(path, "string")}>
                    Set Item Type
                  </Button>
                </div>
              ) : (
                renderField(field.item_schema, `${path}.item_schema`, depth + 1)
              )}
            </div>
          )}

          {field.data_type === "object" && field.isExpanded && (
            <Collapsible open={field.isExpanded}>
              <CollapsibleContent>
                <div className="mt-4 space-y-4">
                  <div className="flex gap-2 items-center p-3 border rounded-lg bg-muted/50">
                    <Select
                      value={field.selectedTypeToAdd}
                      onValueChange={(value: DataType) => updateField(path, { selectedTypeToAdd: value })}
                    >
                      <SelectTrigger className="h-8 w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="array">Array</SelectItem>
                        <SelectItem value="object">Object</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      onClick={() => {
                        const newField = createField(field.selectedTypeToAdd || "string")
                        updateField(path, {
                          properties: [...(field.properties || []), newField],
                        })
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Property
                    </Button>
                  </div>

                  {field.properties?.map((prop) => renderField(prop, `${path}.${prop.id}`, depth + 1))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Schema Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-6">
            <Select value={selectedTypeToAdd} onValueChange={setSelectedTypeToAdd}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="string">String</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="array">Array</SelectItem>
                <SelectItem value="object">Object</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => addField()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
            <Button variant="outline" onClick={copySchema} disabled={schema.length === 0}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Schema
            </Button>
          </div>

          <div className="space-y-4">
            {schema.map((field) => renderField(field, field.id))}
            {schema.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No fields added yet. Click "Add Field" to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {schema.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Schema Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={JSON.stringify(
                schema.map((field) => ({
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
                  ...(field.data_type === "object" && field.properties ? { properties: field.properties } : {}),
                  ...(field.data_type === "array" && field.item_schema ? { item_schema: field.item_schema } : {}),
                })),
                null,
                2,
              )}
              readOnly
              className="min-h-[200px] font-mono text-sm"
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
