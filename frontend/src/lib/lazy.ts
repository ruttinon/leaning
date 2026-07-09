import { lazy, type ComponentType } from 'react'

export function lazyNamed<T extends ComponentType<any>>(
  loader: () => Promise<Record<string, unknown>>,
  exportName: string,
) {
  return lazy(async () => {
    const module = await loader()
    const component = module[exportName]

    if (!component) {
      throw new Error(`Missing "${exportName}" export in lazy-loaded module`)
    }

    return { default: component as T }
  })
}
