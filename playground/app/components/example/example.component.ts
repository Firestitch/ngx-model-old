import { Component, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { FsModelDirective } from 'src/app/directives/fs-model';
import { random } from 'lodash';
import { FsPrompt } from '@firestitch/prompt';
import { of, Observable } from 'rxjs';
import { ConnectionOverlayType } from 'src/app/helpers';
import { p } from '@angular/core/src/render3';


@Component({
  selector: 'example',
  templateUrl: 'example.component.html',
  styleUrls: ['example.component.scss']
})
export class ExampleComponent implements AfterViewInit, OnInit {

  @ViewChild(FsModelDirective)
  public model: FsModelDirective;
  public objects = [];

  constructor(private fsPrompt: FsPrompt) {
  }

  ngAfterViewInit() {
    //this.load();
  }

  ngOnInit() {
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

    if(idx) {

      const object1 = this.objects[idx - 1];
      const object2 = this.objects[idx];

      let config = {
          overlays: [
            {
              type: ConnectionOverlayType.Label,
              label: 'Label ' + idx,
              click: this.connectionLabelClick.bind(this)
            },
            {
              type: ConnectionOverlayType.Tooltip,
              label: 'Tooltip that spans\nmultiple lines and support <br><b>HTML</b>'
            }
          ],
          data: {
            object: object
          }
      };

      this.model.connect(object1, object2, config);
    }
  }

  public connectionCreated(e) {
    if(e.event) {
      debugger;
      const config =  {
        overlays: [
          {
            type: ConnectionOverlayType.Label,
            label: '<b>New Connection Label</b>',
            click: this.connectionLabelClick.bind(this)
          }
        ],
        //click: this.connectionLabelClick.bind(this)
      };

      this.model.applyConnectionConfig(e.connection,config);
    }
  }

  connectionLabelClick(e) {
    this.fsPrompt.confirm({
      title: 'Confirm',
      template: 'Would you like to delete this connection?'
    }).subscribe(() => {
      const connection = this.model.getConnections({ source: e.connection.source.fsModelObjectdirective.data, target: e.connection.target.fsModelObjectdirective.data })[0];

      //this.model.disconnect(e.connection);
      this.model.disconnect(connection);

    });
  }

  objectDragStart(e) {
    e.e.stopPropagation();
    console.log('objectDragStart',e);
  }

  objectDragStop(e) {
    console.log('objectDragStop',e);
  }

  objectClick(e: Event) {
    if (!e.defaultPrevented) {
      console.log('objectClick',e);
    }
  }
}
