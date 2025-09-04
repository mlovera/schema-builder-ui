"use client"

/**
 * Schema Builder Component
 *
 * Interactive component for building individual schemas with validation rules.
 * Supports nested objects, arrays, and all data types with their specific validation options.
 */

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

import type { DataType, SchemaField, SchemaBuilderProps } from "@/lib/types/schema"
import { VALIDATION_RULES_BY_TYPE } from "@/lib/constants/validation-rules"
import { createSchemaField, updateNestedField, cleanSchemaForExport, copyToClipboard } from "@/lib/utils/schema-utils"

/**
 * Main schema builder component for creating and editing individual schemas
 */
export function SchemaBuilder({ initialSchema = [], onSchemaChange }: SchemaBuilderProps) {
  const [schema, setSchema] = useState<SchemaField[]>([])
  const [selectedTypeToAdd, setSelectedTypeToAdd] = useState<DataType>("string")

  useEffect(() => {
    if (initialSchema.length > 0 || schema.length === 0) {
      setSchema(initialSchema)
    }
  }, [initialSchema])

  useEffect(() => {
    if (onSchemaChange) {
      onSchemaChange(schema)
    }
  }, [schema])

  /**
   * Adds a new field to the schema or nested within a parent field
   */
  const addField = (parentPath?: string) => {
    const newField = createSchemaField(selectedTypeToAdd)

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

  /**
   * Updates a field's properties using dot-notation path
   */
  const updateField = (path: string, updates: Partial<SchemaField>) => {
    setSchema((prev) => updateNestedField(prev, path, (field) => ({ ...field, ...updates })))
  }

  /**
   * Updates a specific validation rule for a field
   */
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

  /**
   * Removes a field from the schema
   */
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

  /**
   * Sets the item schema for an array field
   */
  const setArrayItemSchema = (path: string, itemType: DataType) => {
    const newItemSchema = createSchemaField(itemType)
    setSchema((prev) =>
      updateNestedField(prev, path, (field) => ({
        ...field,
        item_schema: newItemSchema,
      })),
    )
  }

  /**
   * Copies the current schema to clipboard as JSON
   */
  const copySchema = () => {
    const schemaString = JSON.stringify(cleanSchemaForExport(schema), null, 2)
    copyToClipboard(schemaString)
  }

  /**
   * Renders validation rules UI for a specific field
   */
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

  /**
   * Recursively renders a schema field with all its properties and nested fields
   */
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
                    const newField = createSchemaField(value)
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
                        const newField = createSchemaField(field.selectedTypeToAdd || "string")
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
              value={JSON.stringify(cleanSchemaForExport(schema), null, 2)}
              readOnly
              className="min-h-[200px] font-mono text-sm"
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
