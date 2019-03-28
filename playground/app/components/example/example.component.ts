import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FsPrompt } from '@firestitch/prompt';
import { ConnectionOverlayType, FsModelDirective } from '@firestitch/model';
import { random } from 'lodash-es';
import { ConnectionConfig } from 'src/app/interfaces';
import { ConnectionConnector } from 'src/app/helpers';
import { ModelConfig } from 'package/public_api';


@Component({
  selector: 'example',
  templateUrl: 'example.component.html',
  styleUrls: ['example.component.scss']
})
export class ExampleComponent implements AfterViewInit, OnInit {

  @ViewChild(FsModelDirective)
  public model: FsModelDirective;
  public objects = [];
  public startObject = {};
  public modelConfig: ModelConfig = {};

  constructor(private fsPrompt: FsPrompt) {
  }

  ngAfterViewInit() {
    // this.load();
  }

  ngOnInit() {
    this.modelConfig = { paintStyle: { stroke: '' }}

    this.load();
  }

  load() {
    for (let i = 0; i < 5; i++) {
      this.add();
    }
  }

  remove(object) {
    this.objects = this.objects.filter(obj => obj !== object);
  }

  add() {

    const x1 = random(0, 1000);
    const y1 = random(0, 500);

    const idx = this.objects.length;

    const object = { name: 'Object ' + (idx + 1), x1: x1, y1: y1, id: idx + 1 };

    this.objects.push(object);

    if (this.objects.length === 1) {
      this.model.connect(this.startObject, object);
    }

    if (idx) {

      const object1 = this.objects[idx - 1];
      const object2 = this.objects[idx];

      const config = {
        overlays: [
          {
            type: ConnectionOverlayType.Label,
            label: 'Label ' + idx,
            tooltip: 'Tooltip that spans\nmultiple lines and support <br><b>HTML</b>',
            click: this.connectionLabelClick.bind(this)
          }
        ],
        data: {
          object: object
        }
      };

      this.model.connect(object1, object2, config);
    }
  }

  public addExternal(object) {
    const config: ConnectionConfig = {
      overlays: [
        {
          type: ConnectionOverlayType.Arrow,
          location: .4,
          direction: 1
        },
        {
          type: ConnectionOverlayType.Label,
          label: 'google.com'
        }
      ],
      defaultOverlays: false,
      click: this.connectionLabelClick.bind(this)
    };

    this.model.connect(object, object, config);
  }

  public connectionCreated(e) {

    console.log('connectionCreated', e);

    if (e.event) {

      const config: ConnectionConfig = {
        overlays: [
          {
            type: ConnectionOverlayType.Label,
            label: 'New Connection Label',
            tooltip: 'New Connection Tooltip',
            click: this.connectionLabelClick.bind(this)
          }
        ],
        // click: this.connectionLabelClick.bind(this)
      };

      if (e.source === e.target) {
        config.connector = ConnectionConnector.StateMachine;
      }

      this.model.applyConnectionConfig(e.connection, config);
    }
  }

  connectionLabelClick(e) {
    this.fsPrompt.confirm({
      title: 'Confirm',
      template: 'Would you like to delete this connection?'
    }).subscribe(() => {
      const connection = this.model.getConnections({
        source: e.connection.source.fsModelObjectdirective.data,
        target: e.connection.target.fsModelObjectdirective.data
      })[0];

      this.model.disconnect(connection);
    });
  }

  objectDragStart(e) {
    e.e.stopPropagation();
    console.log('objectDragStart', e);
  }

  objectDragStop(e) {
    console.log('objectDragStop', e);
  }

  objectClick(e: Event) {
    if (!e.defaultPrevented) {
      console.log('objectClick', e);
    }
  }
}
