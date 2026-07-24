import * as React from "react"

export type RegisteredComponent = React.ComponentType<any>

const registry: Record<string, RegisteredComponent> = {}

export const DialogRegistry = {
  register(id: string, component: RegisteredComponent) {
    registry[id] = component
  },

  get(id: string): RegisteredComponent | undefined {
    return registry[id]
  },

  list(): string[] {
    return Object.keys(registry)
  }
}
