import { QueryList, ElementRef, AfterViewInit, Directive, ContentChildren, IterableDiffers, ViewChildren, Input, EventEmitter, Output } from '@angular/core';
import { jsPlumb } from 'jsplumb';
import { FsModelObjectDirective } from '../fs-model-object/fs-model-object.directive';
import { guid } from '@firestitch/common/util';
import { filter } from 'lodash';
import { ConnectionConfig } from '../../interfaces';


@Directive({
  selector: '[fsModel]',
  host: {
    class: 'fs-model'
  },
  queries: {
    fsModelObjects: new ContentChildren(FsModelObjectDirective)
  },
})
export class FsModelDirective implements AfterViewInit {

  @Output() connectionCreated = new EventEmitter();

  fsModelObjects: QueryList<FsModelObjectDirective>;

  private _queuedConnections = [];
  private _differ;
  private _jsPlumb = null;
  private _modelObjects = new Map<any, FsModelObjectDirective>();

  constructor(private _element: ElementRef, private differs: IterableDiffers) {
    this._differ = this.differs.find([]).create(null);
    this.init();
  }

  get element(): ElementRef {
    return this._element;
  }

  ngAfterViewInit() {

    this.fsModelObjects.changes.subscribe(changes => {

      let changeDiff = this._differ.diff(changes);

      if (changeDiff) {
        changeDiff.forEachAddedItem((change) => {
          this.addModelObject(change.item);
        });

        changeDiff.forEachRemovedItem((change) => {
          this.removeModelObject(change.item);
        });
      }
    });
  }
  public configConnection(connection, config: ConnectionConfig = {}) {
    connection.setData({ data: config.data });

    connection.addClass('fs-model-connection');

    if(config) {

      if(config.click) {
        connection.addClass('fs-model-clickable');

        connection.bind('click', (e, originalEvent) => {
            const data = {  data: connection.getData(),
                            event: originalEvent,
                            connection: connection };

            if (e.type) {
              const overlay = filter(config.overlays, { id: e.id })[0];

              if (overlay && overlay.click) {
                overlay.click.bind(this)(data);
              }
            } else {
              config.click.bind(this)(data);
            }
        });
      }

      if (config.overlays) {
        config.overlays.forEach(overlay => {

          if (!overlay.id) {
            overlay.id = guid();
          }

          let cssClass = 'fs-model-connection-label';
          if(overlay.click) {
            cssClass += ' fs-model-clickable';
          }

          connection.addOverlay(['Label',
          {
            label: overlay.label,
            cssClass: cssClass,
            id: overlay.id
          }]);
        });
      }
    }
  }

  public connect(source, target, config: ConnectionConfig = {}) {

    const sourceModel = this._modelObjects.get(source);
    const targetModel = this._modelObjects.get(target);

    if(!sourceModel || !targetModel) {
      this._queuedConnections.push({ source: source, target: target, config: config });
      return;
    }

    const connection = this._jsPlumb.connect({
      source:  sourceModel.element.nativeElement,
      target:  targetModel.element.nativeElement
    });

    this.configConnection(connection, config);
  }

  public disconnect(connection) {
    this._jsPlumb.deleteConnection(connection);
  }

  private addModelObject(directive: FsModelObjectDirective) {
    directive.init(this._jsPlumb, this);
    this._modelObjects.set(directive.data,directive);

    for (let i = this._queuedConnections.length - 1; i >= 0; --i) {
      const connection = this._queuedConnections[i];
      const sourceModel = this._modelObjects.get(connection.source);
      const targetModel = this._modelObjects.get(connection.target);

      if (sourceModel && targetModel) {
        this._queuedConnections.splice(i, 1);
        this.connect(connection.source,connection.target,connection.config);
      }
    }
  }

  private removeModelObject(modelObject: FsModelObjectDirective) {

    this._jsPlumb.getConnections({
      source: modelObject.element.nativeElement
    }).forEach(connection => {
      this._jsPlumb.deleteConnection(connection);
    });

    this._jsPlumb.getConnections({
      target: modelObject.element.nativeElement
    }).forEach(connection => {
      this._jsPlumb.deleteConnection(connection);
    });

    this._modelObjects.delete(modelObject.data);
  }

  private init() {

    this._jsPlumb = jsPlumb.getInstance();

    this._jsPlumb.bind('connection',(info: any, e: Event) => {
      this.connectionCreated.emit(Object.assign(info,{ event: e }));
    });

    this._jsPlumb.importDefaults(
        {	ConnectionsDetachable: false,
          Anchor: 'Continuous',
          EndpointStyle: { fill: 'transparent', stroke: 'transparent' },
          PaintStyle: {
            stroke: '#2196f3',
            strokeWidth: 2,
            outlineStroke: 'transparent',
            outlineWidth: 0
          },
          HoverPaintStyle: {
            stroke: '#2196f3',
            strokeWidth: 4,
            outlineStroke: 'transparent',
            outlineWidth: 0
          },
          Connector: [
            'Flowchart',
            {
              stub: [40, 60],
              gap: 1,
              cornerRadius: 5,
              alwaysRespectStubs: true
            }
          ],
          Overlays: [
            [ 'Arrow', {
                location: 1,
                id: 'arrow',
                length: 10,
                width: 10,
                foldback: 1
            }]
          ]
        });
  }
}
