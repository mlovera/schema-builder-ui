"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Copy, ChevronDown, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { JSX } from "react" // Import JSX to fix the undeclared variable error

type JsonValueType = "string" | "number" | "boolean" | "null" | "object" | "array"

interface JsonNode {
  id: string
  type: JsonValueType
  key?: string
  value?: any
  children?: JsonNode[]
  collapsed?: boolean
  selectedTypeToAdd?: JsonValueType // Added state to track selected type for adding
}

interface JsonBuilderProps {
  initialValue?: any
}

export function JsonBuilder({ initialValue }: JsonBuilderProps) {
  const { toast } = useToast()
  const [rootNode, setRootNode] = useState<JsonNode>(() => ({
    id: "root",
    type: "object",
    children: [],
    selectedTypeToAdd: "string", // Default type to add
  }))

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const createNode = (type: JsonValueType, key?: string): JsonNode => ({
    id: generateId(),
    type,
    key,
    value: getDefaultValue(type),
    children: type === "object" || type === "array" ? [] : undefined,
    collapsed: false,
    selectedTypeToAdd: type === "object" || type === "array" ? "string" : undefined, // Added default selectedTypeToAdd for container types
  })

  const getDefaultValue = (type: JsonValueType) => {
    switch (type) {
      case "string":
        return ""
      case "number":
        return 0
      case "boolean":
        return false
      case "null":
        return null
      case "object":
        return {}
      case "array":
        return []
      default:
        return null
    }
  }

  const updateNode = useCallback((nodeId: string, updates: Partial<JsonNode>) => {
    const updateNodeRecursive = (node: JsonNode): JsonNode => {
      if (node.id === nodeId) {
        return { ...node, ...updates }
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNodeRecursive),
        }
      }
      return node
    }
    setRootNode(updateNodeRecursive)
  }, [])

  const addChild = useCallback(
    (parentId: string) => {
      const parentNode = getNodeById(rootNode, parentId)
      if (!parentNode?.selectedTypeToAdd) return

      const newNode = createNode(parentNode.selectedTypeToAdd)

      const addChildRecursive = (node: JsonNode): JsonNode => {
        if (node.id === parentId) {
          return {
            ...node,
            children: [...(node.children || []), newNode],
          }
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(addChildRecursive),
          }
        }
        return node
      }
      setRootNode(addChildRecursive)
    },
    [rootNode],
  )

  const removeNode = useCallback((nodeId: string) => {
    const removeNodeRecursive = (node: JsonNode): JsonNode => {
      if (node.children) {
        return {
          ...node,
          children: node.children.filter((child) => child.id !== nodeId).map(removeNodeRecursive),
        }
      }
      return node
    }
    setRootNode(removeNodeRecursive)
  }, [])

  const toggleCollapse = useCallback(
    (nodeId: string) => {
      updateNode(nodeId, { collapsed: !getNodeById(rootNode, nodeId)?.collapsed })
    },
    [updateNode, rootNode],
  )

  const getNodeById = (node: JsonNode, id: string): JsonNode | null => {
    if (node.id === id) return node
    if (node.children) {
      for (const child of node.children) {
        const found = getNodeById(child, id)
        if (found) return found
      }
    }
    return null
  }

  const convertToJson = (node: JsonNode): any => {
    if (node.type === "object") {
      const obj: any = {}
      node.children?.forEach((child) => {
        if (child.key) {
          obj[child.key] = convertToJson(child)
        }
      })
      return obj
    }

    if (node.type === "array") {
      return node.children?.map(convertToJson) || []
    }

    return node.value
  }

  const getJsonString = () => {
    try {
      return JSON.stringify(convertToJson(rootNode), null, 2)
    } catch (error) {
      return "Invalid JSON structure"
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getJsonString())
      toast({
        title: "Copied!",
        description: "JSON copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const renderNode = (node: JsonNode, depth = 0, isArrayItem = false): JSX.Element => {
    const indent = depth * 20

    return (
      <div key={node.id} className="relative">
        <div
          className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
          style={{ marginLeft: `${indent}px` }}
        >
          {/* Collapse/Expand button for containers */}
          {(node.type === "object" || node.type === "array") && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleCollapse(node.id)}>
              {node.collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          )}

          {/* Key input for object properties */}
          {!isArrayItem && node.id !== "root" && (
            <Input
              placeholder="key"
              value={node.key || ""}
              onChange={(e) => updateNode(node.id, { key: e.target.value })}
              className="w-24 h-8 text-sm"
            />
          )}

          {/* Type selector */}
          <Select
            value={node.type}
            onValueChange={(type: JsonValueType) => {
              const newValue = getDefaultValue(type)
              updateNode(node.id, {
                type,
                value: newValue,
                children: type === "object" || type === "array" ? [] : undefined,
              })
            }}
          >
            <SelectTrigger className="w-20 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">String</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
              <SelectItem value="null">Null</SelectItem>
              <SelectItem value="object">Object</SelectItem>
              <SelectItem value="array">Array</SelectItem>
            </SelectContent>
          </Select>

          {/* Value input for primitive types */}
          {node.type === "string" && (
            <Input
              placeholder="Enter string value"
              value={node.value || ""}
              onChange={(e) => updateNode(node.id, { value: e.target.value })}
              className="flex-1 h-8 text-sm"
            />
          )}

          {node.type === "number" && (
            <Input
              type="number"
              placeholder="Enter number"
              value={node.value || 0}
              onChange={(e) => updateNode(node.id, { value: Number.parseFloat(e.target.value) || 0 })}
              className="w-32 h-8 text-sm"
            />
          )}

          {node.type === "boolean" && (
            <Select
              value={node.value?.toString() || "false"}
              onValueChange={(value) => updateNode(node.id, { value: value === "true" })}
            >
              <SelectTrigger className="w-20 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">true</SelectItem>
                <SelectItem value="false">false</SelectItem>
              </SelectContent>
            </Select>
          )}

          {node.type === "null" && (
            <Badge variant="secondary" className="text-xs">
              null
            </Badge>
          )}

          {/* Container labels */}
          {(node.type === "object" || node.type === "array") && (
            <Badge variant="outline" className="text-xs">
              {node.type} ({node.children?.length || 0} items)
            </Badge>
          )}

          {(node.type === "object" || node.type === "array") && !node.collapsed && (
            <div className="flex gap-2 items-center">
              {/* Type selector for adding */}
              <Select
                value={node.selectedTypeToAdd || "string"}
                onValueChange={(type: JsonValueType) => updateNode(node.id, { selectedTypeToAdd: type })}
              >
                <SelectTrigger className="w-20 h-6 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="null">Null</SelectItem>
                  <SelectItem value="object">Object</SelectItem>
                  <SelectItem value="array">Array</SelectItem>
                </SelectContent>
              </Select>

              {/* Add button */}
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs bg-transparent"
                onClick={() => addChild(node.id)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
          )}

          {/* Remove button */}
          {node.id !== "root" && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              onClick={() => removeNode(node.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Render children */}
        {(node.type === "object" || node.type === "array") && !node.collapsed && node.children && (
          <div className="ml-4 border-l border-border/50">
            {node.children.map((child) => renderNode(child, depth + 1, node.type === "array"))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Builder Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            JSON Structure Builder
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRootNode({ id: "root", type: "object", children: [], selectedTypeToAdd: "string" })}
            >
              Clear All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[600px] overflow-y-auto">{renderNode(rootNode)}</CardContent>
      </Card>

      {/* Preview Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            JSON Preview
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={getJsonString()}
            readOnly
            className="min-h-[500px] font-mono text-sm"
            placeholder="Your JSON will appear here..."
          />
        </CardContent>
      </Card>
    </div>
  )
}
