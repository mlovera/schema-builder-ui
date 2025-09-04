"use client"

/**
 * Schema List Manager Component
 *
 * Main component for managing multiple schemas. Provides functionality to:
 * - Create, edit, and delete schemas
 * - Switch between list view, individual schema editing, and JSON view
 * - Export all schemas as JSON
 * - Access documentation
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Edit, ArrowLeft, Copy, Eye, HelpCircle } from "lucide-react"
import { SchemaBuilder } from "./schema-builder"
import { SchemaDocumentation } from "./documentation/schema-documentation"
import type { Schema } from "@/lib/types/schema"
import { generateUUID, copyToClipboard } from "@/lib/utils/schema-utils"

/**
 * Main schema management component with list view, editing, and JSON export
 */
export function SchemaListManager() {
  const [schemas, setSchemas] = useState<Schema[]>([])
  const [selectedSchema, setSelectedSchema] = useState<Schema | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newSchemaName, setNewSchemaName] = useState("")
  const [showJsonView, setShowJsonView] = useState(false)
  const [showDocumentation, setShowDocumentation] = useState(false)

  /**
   * Creates a new schema with the provided name
   */
  const createSchema = () => {
    if (!newSchemaName.trim()) return

    const newSchema: Schema = {
      id: generateUUID(),
      name: newSchemaName.trim(),
      fields: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setSchemas([...schemas, newSchema])
    setSelectedSchema(newSchema)
    setNewSchemaName("")
    setIsCreating(false)
  }

  /**
   * Deletes a schema by ID and clears selection if it was selected
   */
  const deleteSchema = (schemaId: string) => {
    setSchemas(schemas.filter((s) => s.id !== schemaId))
    if (selectedSchema?.id === schemaId) {
      setSelectedSchema(null)
    }
  }

  /**
   * Updates a schema's fields and modification timestamp
   */
  const updateSchema = (schemaId: string, fields: any[]) => {
    setSchemas(schemas.map((s) => (s.id === schemaId ? { ...s, fields, updatedAt: new Date() } : s)))
  }

  /**
   * Renames a schema and updates both the list and selected schema
   */
  const renameSchema = (schemaId: string, newName: string) => {
    setSchemas(schemas.map((s) => (s.id === schemaId ? { ...s, name: newName, updatedAt: new Date() } : s)))
    if (selectedSchema?.id === schemaId) {
      setSelectedSchema((prev) => (prev ? { ...prev, name: newName, updatedAt: new Date() } : null))
    }
  }

  /**
   * Generates complete JSON output for all schemas
   */
  const generateCompleteJson = () => {
    return schemas.map((schema) => ({
      name: schema.name,
      schema: schema.fields,
    }))
  }

  /**
   * Copies all schemas JSON to clipboard
   */
  const copyJsonToClipboard = () => {
    const jsonOutput = JSON.stringify(generateCompleteJson(), null, 2)
    copyToClipboard(jsonOutput)
  }

  // Individual schema editing view
  if (selectedSchema) {
    const currentSchema = selectedSchema

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setSelectedSchema(null)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Schemas
              </Button>
              <div className="flex-1">
                <Input
                  value={currentSchema.name}
                  onChange={(e) => {
                    const newName = e.target.value
                    renameSchema(currentSchema.id, newName)
                  }}
                  className="text-lg font-semibold border-none p-0 h-auto bg-transparent"
                  placeholder="Schema name"
                />
              </div>
              <Badge variant="outline" className="text-xs">
                {currentSchema.fields.length} fields
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => setShowDocumentation(true)}>
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        <SchemaBuilder
          key={currentSchema.id}
          initialSchema={currentSchema.fields}
          onSchemaChange={(fields) => updateSchema(currentSchema.id, fields)}
        />

        <SchemaDocumentation isOpen={showDocumentation} onClose={() => setShowDocumentation(false)} />
      </div>
    )
  }

  // JSON view for all schemas
  if (showJsonView) {
    const completeJson = generateCompleteJson()

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setShowJsonView(false)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Schemas
                </Button>
                <CardTitle>All Schemas JSON View</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowDocumentation(true)}>
                  <HelpCircle className="h-4 w-4" />
                </Button>
                <Button onClick={copyJsonToClipboard} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy JSON
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                {JSON.stringify(completeJson, null, 2)}
              </pre>
            </div>
            {schemas.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No schemas available. Create some schemas first to see the JSON output.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <SchemaDocumentation isOpen={showDocumentation} onClose={() => setShowDocumentation(false)} />
      </div>
    )
  }

  // Main schema list view
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Schema Manager</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowDocumentation(true)}>
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setShowJsonView(true)}>
                <Eye className="h-4 w-4 mr-2" />
                JSON View
              </Button>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Schema
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isCreating && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/50">
              <Label className="text-sm font-medium mb-2 block">Create New Schema</Label>
              <div className="flex gap-2">
                <Input
                  value={newSchemaName}
                  onChange={(e) => setNewSchemaName(e.target.value)}
                  placeholder="Enter schema name"
                  onKeyDown={(e) => e.key === "Enter" && createSchema()}
                  autoFocus
                />
                <Button onClick={createSchema} disabled={!newSchemaName.trim()}>
                  Create
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false)
                    setNewSchemaName("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {schemas.length === 0 && !isCreating && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No schemas created yet. Click "New Schema" to get started.</p>
              </div>
            )}

            {schemas.map((schema) => (
              <Card key={schema.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => setSelectedSchema(schema)}>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{schema.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {schema.fields.length} fields
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Created: {schema.createdAt.toLocaleDateString()}
                        {schema.updatedAt.getTime() !== schema.createdAt.getTime() && (
                          <span className="ml-3">Updated: {schema.updatedAt.toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedSchema(schema)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteSchema(schema.id)
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <SchemaDocumentation isOpen={showDocumentation} onClose={() => setShowDocumentation(false)} />
    </div>
  )
}
