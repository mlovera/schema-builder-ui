import { SchemaListManager } from "@/components/schema-list-manager"

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Schema Manager</h1>
          <p className="text-muted-foreground text-lg">
            Create, manage, and edit multiple data schemas with validation rules and infinite hierarchy
          </p>
        </div>
        <SchemaListManager />
      </div>
    </div>
  )
}
