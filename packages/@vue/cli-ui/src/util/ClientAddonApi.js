import Vue from 'vue'

export default class ClientAddonApi {
  constructor (addonId) {
    this.components = new Map()
    this.componentListeners = new Map()
  }

  component (id, definition) {
    this.components.set(id, definition)
    const componentId = toComponentId(id)
    Vue.component(componentId, definition)
    console.log(`Registered ${componentId} component`)
    // Call listeners
    const listeners = this.componentListeners.get(id)
    if (listeners) {
      listeners.forEach(l => l(definition))
      this.componentListeners.delete(id)
    }
  }

  getComponent (id) {
    return this.components.get(id)
  }

  listenForComponent (id, cb) {
    let listeners = this.componentListeners.get(id)
    if (!listeners) {
      listeners = []
      this.componentListeners.set(id, listeners)
    }
    listeners.push(cb)
  }

  awaitComponent (id) {
    return new Promise((resolve, reject) => {
      const result = this.getComponent(id)
      if (result) {
        resolve(result)
      } else {
        this.listenForComponent(id, resolve)
      }
    })
  }
}

export function toComponentId (id) {
  return `client-addon--${id}`
}