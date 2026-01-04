// types/tabs.d.ts
export interface TabItem {
  path: string
  name: string,
  fullPath: string
  query: Record<string, any>
  params: Record<string, any>
  closable?: boolean,
  meta: metaType
}

export interface TabsStore {
  tabs: TabItem[]
  activeTab: string
  addTab: (route: any) => void
  removeTab: (path: string) => void
  removeOtherTabs: (path?: string) => void
  removeAllTabs: () => void
  setActiveTab: (path: string) => void
}

type metaType = {
  title: string,
  hidden: boolean
}