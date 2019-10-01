import {
  AfterViewInit,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  IterableDiffers,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  Input,
  HostBinding
} from '@angular/core';

import { guid } from '@firestitch/common';

import { Subject, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { filter } from 'lodash-es';

import { FsModelObjectDirective } from '../fs-model-object/fs-model-object.directive';
import { ConnectionConfig } from '../../interfaces';
import { ConnectionOverlayType, ConnectionConnector } from '../../helpers';
import { ModelConfig } from '../../interfaces/model-config';
import { jsPlumb } from '@firestitch/jsplumb';


@Directive({
  selector: '[fsModel]'
})
export class FsModelDirective implements AfterViewInit, OnInit, OnDestroy {

  public config: ModelConfig = {};

  @HostBinding('class.fs-model') classFsModel = true;

  @Input('config') set setConfig(value) {
    this.initConfig(value);
  }

  @Output() connectionCreated = new EventEmitter();
  @ContentChildren(FsModelObjectDirective) fsModelObjects: QueryList<FsModelObjectDirective>;

  private _queuedConnections = [];
  private _differ;
  private _jsPlumb = null;
  private _modelObjects = new Map<any, FsModelObjectDirective>();
  private _destroy$ = new Subject<void>();
  private defaultOverlay = { length: 10, width: 10, foldback: 1 };

  constructor(private _element: ElementRef, private differs: IterableDiffers) {
    this._differ = this.differs.find([]).create(null);
    this.initConfig({});
  }

  ngOnInit() {
    this._init();
  }

  get element(): ElementRef {
    return this._element;
  }

  get jsPlumb() {
    return this._jsPlumb;
  }

  initConfig(config) {

    this.config = config || {};
    this.config.paintStyle = this.config.paintStyle || {};
    this.config.hoverPaintStyle = this.config.hoverPaintStyle || {};

    this.config.paintStyle.stroke = this.config.paintStyle.stroke || '#2196f3';
    this.config.paintStyle.strokeWidth = this.config.paintStyle.strokeWidth || 2;
    this.config.hoverPaintStyle.stroke = this.config.hoverPaintStyle.stroke || '#ccc';
    this.config.hoverPaintStyle.strokeWidth = this.config.hoverPaintStyle.strokeWidth || 2;
  }

  ngOnDestroy() {
    this._jsPlumb.reset();
    this._destroy$.next();
    this._destroy$.complete();
  }

  ngAfterViewInit() {

    let changeDiff = this._differ.diff(this.fsModelObjects);
    if (changeDiff) {
      changeDiff.forEachAddedItem(change => {
        this._addModelObject(change.item);
      });
    }

    this.fsModelObjects.changes
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe(fsModelObjects => {

        changeDiff = this._differ.diff(fsModelObjects);
        if (changeDiff) {
          changeDiff.forEachAddedItem((change) => {
            this._addModelObject(change.item);
          });

          changeDiff.forEachRemovedItem((change) => {
            this._removeModelObject(change.item);
          });
        }
      });
  }

  public applyConnectionConfig(connection, config: ConnectionConfig = {}) {

    if (config.defaultOverlays === false) {
      connection.removeAllOverlays();
    }

    if (config.connector) {
      connection.setConnector(config.connector);
    }

    connection.setData(config.data);
    connection.addClass('fs-model-connection');
    connection.scope = config.name;

    const tooltipId = 'tooltip_' + connection.id;

    if (config) {

      connection.addClass('fs-model-clickable');
      if (config.tooltip) {
        connection.bind('mouseover', (conn, event) => {
          const tip = document.querySelector(`.fs-model-connection-tooltip_${conn.id}`);
          if (tip) {

            if (conn.tooltipTimer) {
              clearInterval(conn.tooltipTimer);
            }

            tip.classList.add('show');
          }
        });

        connection.bind('mouseout', (conn, event) => {
          const tip = document.querySelector(`.fs-model-connection-tooltip_${conn.id}`);

          if (tip) {
            conn.tooltipTimer = setTimeout(() => {
              tip.classList.remove('show');
            }, 100);
          }
        });

        connection.addOverlay([ConnectionOverlayType.Label,
          {
            label: `<div class="fs-model-connection-tooltip fs-model-connection-tooltip_${connection.id}">${config.tooltip}</div>`,
            id: tooltipId,
            cssClass: 'fs-model-connection-tooltip-overlay'
          }]);
      }

      connection.bind('click', (e, originalEvent) => {
        const data = {
          data: connection.getData(),
          event: originalEvent,
          connection: connection
        };

        if (e.type) {

          if (tooltipId === e.id) {
            // If the connection tooltip is clicked
            if (config.click) {
              config.click.bind(this)(data);
            }

          } else {

            // If the overlay is clicked
            const overlay = filter(config.overlays, { id: e.id })[0];

            if (overlay && overlay.click) {
              overlay.click.bind(this)(data);
            }
          }
        } else {
          // If the connection tooltip is clicked
          if (config.click) {
            config.click.bind(this)(data);
          }
        }
      });

      if (config.overlays) {

        filter(config.overlays, { type: ConnectionOverlayType.Label })
          .forEach(overlay => {

            if (!overlay.id) {
              overlay.id = guid();
            }

            let cssClass = 'fs-model-connection-label';
            if (overlay.click) {
              cssClass += ' fs-model-clickable';
            }

            let label = overlay.label;

            if (overlay.tooltip) {
              label += '<div class="fs-model-connection-label-tooltip">' + overlay.tooltip + '</div>';
            }

            connection.addOverlay([overlay.type,
              {
                label: label,
                cssClass: cssClass,
                id: overlay.id,
                location: overlay.location
              }]);
          });

          filter(config.overlays, { type: ConnectionOverlayType.Arrow })
          .forEach(overlay => {

            overlay = Object.assign(
              {},
              this.defaultOverlay,
              {
                id: overlay.id,
                location: overlay.location,
                direction: overlay.direction
              },
              overlay);

            connection.addOverlay([overlay.type, overlay]);
          });
      }
    }
  }

  public connect(source: any, target: any, config: ConnectionConfig = {}) {

    const sourceModel: FsModelObjectDirective = this._modelObjects.get(source);
    const targetModel: FsModelObjectDirective = this._modelObjects.get(target);

    // Hack to wait for initing of directives. Must rewrite.
    if (!sourceModel || !targetModel) {
      this._queuedConnections.push({ source: source, target: target, config: config });
      return;
    }

    const connection = this._jsPlumb.connect({
      source: sourceModel.element.nativeElement,
      target: targetModel.element.nativeElement
    });

    this.applyConnectionConfig(connection, config);
  }

  public disconnect(connection) {
    this._jsPlumb.deleteConnection(connection);
  }

  public getConnections(options: { target?: any, source?: any, name?: string }) {

    const sourceModel = this._modelObjects.get(options.source);
    const targetModel = this._modelObjects.get(options.target);

    if (targetModel && sourceModel) {
      return this._jsPlumb.getConnections({
        source: sourceModel.element.nativeElement,
        target: targetModel.element.nativeElement,
        scope: options.name || '*'
      });

    } else if (sourceModel) {
      return this._jsPlumb.getConnections({
        source: sourceModel.element.nativeElement,
        scope: options.name || '*'
      });

    } else if (targetModel) {
      return this._jsPlumb.getConnections({
        target: targetModel.element.nativeElement,
        scope: options.name || '*'
      });

    } else if (options.name) {
      return this._jsPlumb.getConnections({
        scope: options.name
      });
    }

    return this.jsPlumb.getAllConnections();
  }

  public repaint() {
    this.jsPlumb.repaintEverything();
  }

  public getModelObjectDirective(data: any): FsModelObjectDirective {
    return this._modelObjects.get(data);
  }

  private _addModelObject(directive: FsModelObjectDirective) {
    directive.init(this._jsPlumb, this);
    this._modelObjects.set(directive.data, directive);

    // Hack to wait for initing of directives. Must rewrite.
    for (let i = this._queuedConnections.length - 1; i >= 0; --i) {
      const connection = this._queuedConnections[i];
      const sourceModel = this._modelObjects.get(connection.source);
      const targetModel = this._modelObjects.get(connection.target);

      if (sourceModel && targetModel) {
        this._queuedConnections.splice(i, 1);
        this.connect(connection.source, connection.target, connection.config);
      }
    }
  }

  private _removeModelObject(modelObject: FsModelObjectDirective) {

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

  private _init() {

    this._jsPlumb = jsPlumb.getInstance();
    this._jsPlumb.bind('connection', (info: any, e: Event) => {

      if (e && e.defaultPrevented) {
        return;
      }

      if (info.connection.target && info.connection.source) {
        const target = info.connection.target.fsModelObjectDirective;
        const source = info.connection.source.fsModelObjectDirective;

        const event = Object.assign(info, {
          event: e,
          targetModelObject: target,
          sourceModelObject: source
        });

        this.connectionCreated.emit(event);
      }
    });

    this._jsPlumb.importDefaults(
      {
        ConnectionsDetachable: false,
        Anchor: 'Continuous',
        EndpointStyle: {
          fill: 'transparent',
          stroke: 'transparent'
        },
        PaintStyle: {
          stroke: this.config.paintStyle.stroke,
          strokeWidth: this.config.paintStyle.strokeWidth,
          outlineStroke: 'transparent-',
          outlineWidth: 5,
          dashstyle : '0'
        },
        HoverPaintStyle: {
          stroke: this.config.hoverPaintStyle.stroke,
          strokeWidth: this.config.hoverPaintStyle.strokeWidth
        },
        Connector: [
          ConnectionConnector.Flowchart,
          {
            stub: [60, 60],
            gap: 1,
            cornerRadius: 5,
            alwaysRespectStubs: true
          }
        ],
        Overlays: [
          [ConnectionOverlayType.Arrow,
            Object.assign(
              this.defaultOverlay,
              {
                  id: 'arrow',
                  location: 1
              })
            ]
        ]
      });
  }
}
