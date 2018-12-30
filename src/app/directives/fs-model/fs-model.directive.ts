import { QueryList, ElementRef, AfterViewInit, Directive, ContentChildren, IterableDiffers, ViewChildren, Input } from '@angular/core';
import { jsPlumb } from 'jsplumb';
import { FsModelObjectDirective } from '../fs-model-object/fs-model-object.directive';
import { guid } from '@firestitch/common/util';
import { filter } from 'lodash';
import { DefaultConnectionType } from '../../helpers/consts';
import { Observable } from "rxjs";


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

  @Input() connectionCreated;

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

  private addModelObject(directive: FsModelObjectDirective) {
    directive.init(this._jsPlumb, this);
    this._modelObjects.set(directive.data,directive);

    for (let i = this._queuedConnections.length - 1; i >= 0; --i) {
      const connection = this._queuedConnections[i];
      const sourceModel = this._modelObjects.get(connection.source);
      const targetModel = this._modelObjects.get(connection.target);

      if (sourceModel && targetModel) {
        this._queuedConnections.splice(i, 1);
        this.connect(connection.source,connection.target,connection.options);
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

    this._jsPlumb = jsPlumb.getInstance({
      ConnectionsDetachable: false,
      EndpointStyle: { fill: 'transparent', stroke: 'transparent' },
      Connector: [
        'Flowchart',
        { stub: [40, 60],
          gap: 27,
          cornerRadius: 5,
          alwaysRespectStubs: true
        }
      ],
      HoverPaintStyle: {
        stroke: '#2196f3'
      },
      ConnectionOverlays: [
        [ 'Label', {
            location: 0.5,
            id: 'label',
            cssClass: 'aLabel'
        }],
        [ 'Arrow', {
            location: 1,
            id: 'arrow',
            length: 10,
            width: 10,
            foldback: 1
        }]
      ]
    });

    this._jsPlumb.bind('connection',(info, e) => {

      if (this.connectionCreated) {
        info.event = e;
        const result = this.connectionCreated(info);

        if (result instanceof Observable) {
          result.subscribe(options => {
            this._processConnection(info.connection, options);
          });
        }
      }
    });

    this._jsPlumb
      .registerConnectionType(DefaultConnectionType,
        {	anchor: 'Continuous',
          paintStyle: {
            stroke: '#2196f3',
            strokeWidth: 2,
            outlineStroke: 'transparent',
            outlineWidth: 0
          },
          hoverPaintStyle: {
            stroke: '#2196f3',
            strokeWidth: 4,
            outlineStroke: 'transparent',
            outlineWidth: 0
          },
          connector: [
            'Flowchart',
            {
              stub: [40, 60],
              gap: 1,
              cornerRadius: 5,
              alwaysRespectStubs: true
            }
          ]
        });
  }

  public disconnect(connection) {
    this._jsPlumb.deleteConnection(connection);
  }

  private _processConnection(connection, options) {
    connection.setData({ options: options });

    connection.addClass('fs-model-connection');

    if(options) {

      if(options.click) {
        connection.addClass('fs-model-clickable');

        connection.bind('click', (e, originalEvent) => {
            const data = {  data: connection.getData(),
                            event: originalEvent,
                            connection: connection };

            if (e.type) {
              const overlay = filter(options.overlays, { id: e.id })[0];

              if (overlay && overlay.click) {
                overlay.click.bind(this)(data);
              }
            } else {
              options.click.bind(this)(data);
            }
        });
      }

      if (options.overlays) {
        options.overlays.forEach(overlay => {

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

  public connect(source, target, options?) {

    const sourceModel = this._modelObjects.get(source);
    const targetModel = this._modelObjects.get(target);

    if(!sourceModel || !targetModel) {
      this._queuedConnections.push({ source: source, target: target, options: options });
      return;
    }

    const connection = this._jsPlumb.connect({
      source:  sourceModel.element.nativeElement,
      target:  targetModel.element.nativeElement,
      type: DefaultConnectionType
    });

    this._processConnection(connection, options);
  }
}
