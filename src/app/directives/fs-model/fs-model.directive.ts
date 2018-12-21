import { QueryList, ElementRef, AfterViewInit, Directive, ContentChildren, IterableDiffers } from '@angular/core';
import { jsPlumb } from 'jsplumb';
import { FsModelObjectDirective } from 'src/app/directives/fs-model-object';


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

  fsModelObjects: QueryList<FsModelObjectDirective>;

  private _queuedConnections = [];
  private _differ;
  private _jsPlumb = null;
  private _modelObjects = new Map<string, FsModelObjectDirective>();

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
    this._modelObjects.set(directive.id,directive);


    for (let i = this._queuedConnections.length - 1; i >= 0; --i) {
      const connection = this._queuedConnections[i];
      const modelObject1 = this._modelObjects.get(connection.id1);
      const modelObject2 = this._modelObjects.get(connection.id2);

      if (modelObject1 && modelObject2) {
        this._queuedConnections.splice(i, 1);
        this.connect(connection.id1,connection.id2,connection.options);
      }
    }
  }

  private removeModelObject(modelObject: FsModelObjectDirective) {

    this._jsPlumb.getConnections().forEach(connection => {
      if( connection.source.isEqualNode(modelObject.element.nativeElement) ||
          connection.target.isEqualNode(modelObject.element.nativeElement)) {
        this._jsPlumb.deleteConnection(connection);
      }
    });

    this._modelObjects.delete(modelObject.id);
  }

  private init() {

    this._jsPlumb = jsPlumb.getInstance({
      ConnectionsDetachable: false,
      EndpointStyle: { fill: 'transparent', stroke: 'transparent' },
      Connector: [
        'Flowchart',
        { stub: [40, 60],
          gap: 7,
          cornerRadius: 5,
          alwaysRespectStubs: true
        }
      ],
      HoverPaintStyle: {
        stroke: '#2196f3'
      },
      Container: 'data-canvas',
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

    this._jsPlumb
      .registerConnectionType('basicConnectionType',
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

    // this._jsPlumb.bind('click', function(info) {
    //   debugger;
    // });
  }

  public connect(id1, id2, options?) {

    const modelObject1 = this._modelObjects.get(id1);
    const modelObject2 = this._modelObjects.get(id2);

    if(!modelObject1 || !modelObject2) {
      this._queuedConnections.push({ id1: id1, id2: id2, options: options });
      return;
    }

    const connection = this._jsPlumb.connect({
      source:  modelObject1.element.nativeElement,
      target:  modelObject2.element.nativeElement,
      type: 'basicConnectionType',
      data: { options: options }
    });

    connection.addClass('fs-model-connection');

    if(options) {
      if(options.click) {
        connection.addClass('fs-model-connection-click');

        connection.bind('click', (connection, originalEvent) => {
          const data = connection.getData();
          data.options.click.bind(this)(data.options.data, originalEvent);
        });
      }

      if(options.label) {

        let cssClass = 'fs-model-connection-label';
        if(options.click) {
          cssClass += ' fs-model-label-click';
        }

        connection.addOverlay(['Label', {
          label: options.label,
          location: 0.20,
          cssClass: cssClass
        }]);
      }
    }
  }
}
