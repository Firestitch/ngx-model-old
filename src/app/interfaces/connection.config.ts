import { ConnectionOverlayType } from "../helpers";


export class ConnectionConfig {
  overlays?: ConnectionOverlayConfig[]
  click?: Function
  data?: any
}

export class ConnectionOverlayConfig {
  id?: string
  type: ConnectionOverlayType
  label?: string
  click?: Function
}