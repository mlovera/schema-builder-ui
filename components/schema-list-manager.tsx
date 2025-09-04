"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Edit, ArrowLeft, Copy, Eye, HelpCircle, X } from "lucide-react"
import { SchemaBuilder } from "./schema-builder"

interface Schema {
  id: string
  name: string
  fields: any[]
  createdAt: Date
  updatedAt: Date
}

export function SchemaListManager() {
  const [schemas, setSchemas] = useState<Schema[]>([])
  const [selectedSchema, setSelectedSchema] = useState<Schema | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newSchemaName, setNewSchemaName] = useState("")
  const [showJsonView, setShowJsonView] = useState(false)
  const [showDocumentation, setShowDocumentation] = useState(false)

  const createSchema = () => {
    if (!newSchemaName.trim()) return

    const newSchema: Schema = {
      id: Math.random().toString(36).substr(2, 9),
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

  const deleteSchema = (schemaId: string) => {
    setSchemas(schemas.filter((s) => s.id !== schemaId))
    if (selectedSchema?.id === schemaId) {
      setSelectedSchema(null)
    }
  }

  const updateSchema = (schemaId: string, fields: any[]) => {
    setSchemas(schemas.map((s) => (s.id === schemaId ? { ...s, fields, updatedAt: new Date() } : s)))
  }

  const renameSchema = (schemaId: string, newName: string) => {
    setSchemas(schemas.map((s) => (s.id === schemaId ? { ...s, name: newName, updatedAt: new Date() } : s)))
    if (selectedSchema?.id === schemaId) {
      setSelectedSchema((prev) => (prev ? { ...prev, name: newName, updatedAt: new Date() } : null))
    }
  }

  const generateCompleteJson = () => {
    return schemas.map((schema) => ({
      name: schema.name,
      schema: schema.fields,
    }))
  }

  const copyJsonToClipboard = () => {
    const jsonOutput = JSON.stringify(generateCompleteJson(), null, 2)
    navigator.clipboard.writeText(jsonOutput)
  }

  const DocumentationModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Schema Builder Documentation</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowDocumentation(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-8">
            <section>
              <h3 className="text-xl font-semibold mb-3">What is a Schema?</h3>
              <p className="text-muted-foreground mb-4">
                A schema is a blueprint that defines the structure, data types, and validation rules for data. It acts
                as a contract that specifies what fields are required, their types, and what constraints they must
                satisfy.
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Example:</strong> A user registration schema might define that an email field is required,
                  must be a string, and follow email format validation.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">Getting Started</h3>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>
                  Click <strong>"New Schema"</strong> to create a new schema
                </li>
                <li>Enter a descriptive name for your schema</li>
                <li>
                  Click <strong>"Create"</strong> to start building your schema
                </li>
                <li>
                  Add fields using the <strong>"Add"</strong> button and select data types
                </li>
                <li>Configure validation rules for each field as needed</li>
              </ol>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">Available Data Types</h3>
              <div className="grid gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">String</h4>
                  <p className="text-sm text-muted-foreground mb-2">Text data with validation options:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>
                      <strong>Required:</strong> Field must have a value
                    </li>
                    <li>
                      <strong>Min Length:</strong> Minimum number of characters
                    </li>
                    <li>
                      <strong>Max Length:</strong> Maximum number of characters
                    </li>
                    <li>
                      <strong>Pattern:</strong> Regular expression the text must match
                    </li>
                    <li>
                      <strong>Has Symbols:</strong> Must contain special characters
                    </li>
                    <li>
                      <strong>Has Numbers:</strong> Must contain numeric digits
                    </li>
                    <li>
                      <strong>Has Uppercase:</strong> Must contain uppercase letters
                    </li>
                    <li>
                      <strong>Has Lowercase:</strong> Must contain lowercase letters
                    </li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Number</h4>
                  <p className="text-sm text-muted-foreground mb-2">Numeric data with validation options:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>
                      <strong>Required:</strong> Field must have a value
                    </li>
                    <li>
                      <strong>Min:</strong> Minimum allowed value
                    </li>
                    <li>
                      <strong>Max:</strong> Maximum allowed value
                    </li>
                    <li>
                      <strong>Integer Only:</strong> Must be a whole number
                    </li>
                    <li>
                      <strong>Positive Only:</strong> Must be greater than zero
                    </li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Boolean</h4>
                  <p className="text-sm text-muted-foreground mb-2">True/false values with validation:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>
                      <strong>Required:</strong> Field must have a value
                    </li>
                    <li>
                      <strong>Must Be True:</strong> Value must be true (useful for agreements)
                    </li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Array</h4>
                  <p className="text-sm text-muted-foreground mb-2">List of items with validation:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>
                      <strong>Required:</strong> Field must have a value
                    </li>
                    <li>
                      <strong>Min Items:</strong> Minimum number of items in the array
                    </li>
                    <li>
                      <strong>Max Items:</strong> Maximum number of items in the array
                    </li>
                    <li>
                      <strong>Unique Items:</strong> All items must be unique
                    </li>
                    <li>
                      <strong>Item Schema:</strong> Define the structure for each item in the array
                    </li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Object</h4>
                  <p className="text-sm text-muted-foreground mb-2">Nested structure with properties:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>
                      <strong>Required:</strong> Field must have a value
                    </li>
                    <li>
                      <strong>Properties:</strong> Define nested fields within the object
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">Schema Properties</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Display Name</h4>
                  <p className="text-sm text-muted-foreground">
                    A human-readable name for the field. This is what users will see in forms or documentation.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Data Type</h4>
                  <p className="text-sm text-muted-foreground">
                    The type of data this field will contain (string, number, boolean, array, or object).
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Validation Rules</h4>
                  <p className="text-sm text-muted-foreground">
                    Constraints that the data must satisfy. Each data type has specific validation options available.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">isExpanded</h4>
                  <p className="text-sm text-muted-foreground">
                    A UI state property that controls whether nested objects or arrays are shown expanded or collapsed
                    in the interface. This doesn't affect the actual schema validation, only the visual presentation.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">How to Use This Tool</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Creating Schemas</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Start by creating a new schema with a descriptive name. You can manage multiple schemas and switch
                    between them.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Adding Fields</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Use the data type selector to choose the type of field you want to add, then click "Add" to create
                    it. You can add multiple fields of the same type consecutively.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Configuring Validation</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Each field shows available validation rules based on its data type. Toggle the switches to enable
                    rules and configure their values using the input fields.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Nested Structures</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Objects and arrays can contain nested fields. Click the expand/collapse buttons to manage complex
                    hierarchies. There's no limit to how deep you can nest structures.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Exporting Schemas</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Use the "JSON View" to see all your schemas in a structured format, or view individual schema JSON
                    in the schema builder. Copy buttons let you export the data for use in your applications.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">Tips & Best Practices</h3>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                <li>Use descriptive display names that clearly indicate the field's purpose</li>
                <li>Start with required fields and basic validation, then add more specific rules as needed</li>
                <li>For arrays of objects, define the item schema to ensure consistent structure</li>
                <li>Use the expand/collapse feature to manage complex nested structures</li>
                <li>Regularly check the JSON output to ensure your schema matches your requirements</li>
                <li>
                  Consider using pattern validation for strings that need specific formats (emails, phone numbers, etc.)
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  )

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

        {showDocumentation && <DocumentationModal />}
      </div>
    )
  }

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

        {showDocumentation && <DocumentationModal />}
      </div>
    )
  }

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

      {showDocumentation && <DocumentationModal />}
    </div>
  )
}
