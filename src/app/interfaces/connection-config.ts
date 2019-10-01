import { ConnectionOverlayConfig } from './connection-overlay-config';
import { ConnectionConnector } from '../helpers';


export interface ConnectionConfig {
  overlays?: ConnectionOverlayConfig[];
  click?: Function;
  data?: any;
  defaultOverlays?: boolean,
  connector?: ConnectionConnector,
  tooltip?: string,
  name?: string
}
