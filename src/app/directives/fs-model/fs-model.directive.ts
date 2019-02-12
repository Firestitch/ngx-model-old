import { QueryList, ElementRef, AfterViewInit, Directive, ContentChildren, IterableDiffers, EventEmitter, Output, OnDestroy, OnInit } from '@angular/core';
import { jsPlumb } from 'jsplumb';
import { FsModelObjectDirective } from '../fs-model-object/fs-model-object.directive';
import { guid } from '@firestitch/common/util';
import { filter } from 'lodash';
import { ConnectionConfig } from '../../interfaces';
import { ConnectionOverlayType } from '../../helpers';


@Directive({
  selector: '[fsModel]',
  host: {
    class: 'fs-model'
  }
})
export class FsModelDirective implements AfterViewInit, OnInit, OnDestroy {

  @Output() connectionCreated = new EventEmitter();
  @ContentChildren(FsModelObjectDirective) fsModelObjects: QueryList<FsModelObjectDirective>;

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

  ngOnInit() {
  }

  ngAfterViewInit() {

    const changeDiff = this._differ.diff(this.fsModelObjects);
    if(changeDiff) {
      changeDiff.forEachAddedItem(change => {
        this.addModelObject(change.item);
      });
    }

    this.fsModelObjects.changes.subscribe(fsModelObjects => {

      const changeDiff = this._differ.diff(fsModelObjects);
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

  ngOnDestroy() {
    this._jsPlumb.reset();
  }

  public applyConnectionConfig(connection, config: ConnectionConfig = {}) {
    connection.setData({ data: config.data });

    connection.addClass('fs-model-connection');

    if(config) {

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

      // connection.bind('mouseover', function(conn) {
      //   filter(config.overlays,{ type: ConnectionOverlayType.Tooltip }).forEach(overlay => {
      //     if (conn.hasOwnProperty('component')) {
      //       conn = conn.component
      //     }

      //   });
      // });

      // connection.bind('mouseout', function(conn) {
      //  // conn.removeOverlay('connection-tooltip');
      // });

      if (config.overlays) {
        const tooltip = filter(config.overlays,{ type: ConnectionOverlayType.Tooltip })[0];

        filter(config.overlays,{ type: ConnectionOverlayType.Label })
        .forEach(overlay => {

          if (!overlay.id) {
            overlay.id = guid();
          }

          let cssClass = 'fs-model-connection-label';
          if(overlay.click) {
            cssClass += ' fs-model-clickable';
          }

          let label = overlay.label;

          if (tooltip) {
            label += '<div class="fs-model-connection-tooltip">' + tooltip.label + '</div>';
          }

          connection.addOverlay(['Label',
          {
            label: label,
            cssClass: cssClass,
            id: overlay.id
          }]);
        });
      }
    }
  }

  public connect(source: any, target: any, config: ConnectionConfig = {}) {

    const sourceModel: FsModelObjectDirective = this._modelObjects.get(source);
    const targetModel: FsModelObjectDirective = this._modelObjects.get(target);

    //Hack to wait for initing of directives. Must rewrite.
    if(!sourceModel || !targetModel) {
      this._queuedConnections.push({ source: source, target: target, config: config });
      return;
    }

    const connection = this._jsPlumb.connect({
      source:  sourceModel.element.nativeElement,
      target:  targetModel.element.nativeElement
    });

    this.applyConnectionConfig(connection, config);
  }

  public disconnect(connection) {
    this._jsPlumb.deleteConnection(connection);
  }

  public getConnections(filter: { target?: any, source? :any }) {

    const sourceModel = this._modelObjects.get(filter.source);
    const targetModel = this._modelObjects.get(filter.target);

    if(targetModel && sourceModel) {
      return this._jsPlumb.getConnections({
        source: sourceModel.element.nativeElement,
        target: targetModel.element.nativeElement
      });
    }

    if(sourceModel) {
      return this._jsPlumb.getConnections({
        source: sourceModel.element.nativeElement
      });
    }

    if(targetModel) {
      return this._jsPlumb.getConnections({
        target: targetModel.element.nativeElement
      });
    }

    return [];
  }

  private addModelObject(directive: FsModelObjectDirective) {
    directive.init(this._jsPlumb, this);
    this._modelObjects.set(directive.data,directive);

    //Hack to wait for initing of directives. Must rewrite.
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
    }).concat(this._jsPlumb.getConnections({
      target: modelObject.element.nativeElement
    }))
    .forEach(connection => {
      this._jsPlumb.deleteConnection(connection);
    });

    this._modelObjects.delete(modelObject.data);
  }

  private init() {

    this._jsPlumb = jsPlumb.getInstance();
    this._jsPlumb.bind('connection',(info: any, e: Event) => {

      const event = Object.assign(info,{  event: e,
                                          targetModelObject: info.connection.target.fsModelObjectdirective,
                                          sourceModelObject: info.connection.source.fsModelObjectdirective });
      this.connectionCreated.emit(event);
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
