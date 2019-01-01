import { Component, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { FsModelDirective } from 'src/app/directives/fs-model';
import { random } from 'lodash';
import { FsPrompt } from '@firestitch/prompt';
import { of, Observable } from 'rxjs';
import { ConnectionOverlayType } from 'src/app/helpers';


@Component({
  selector: 'example',
  templateUrl: 'example.component.html',
  styleUrls: ['example.component.scss']
})
export class ExampleComponent implements AfterViewInit {

  @ViewChild(FsModelDirective)
  public model: FsModelDirective;
  public objects = [];

  constructor(private fsPrompt: FsPrompt) {
  }

  ngAfterViewInit() {

    for (let i = 0; i < 5; i++) {
      this.add();
    }
  }

  remove(object) {
    this.objects = this.objects.filter(obj => obj !== object);
  }

  add() {

    const x1 = random(0, this.model.element.nativeElement.offsetWidth - 100 - 4);
    const y1 = random(0, this.model.element.nativeElement.offsetHeight - 100 - 4);

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
            }
          ],
          click: this.connectionLabelClick.bind(this),
          data: {
            object: object
          }
      };

      this.model.connect(object1, object2, config);
    }
  }

  public connectionCreated(e) {
    if(e.event) {
      const config =  {
        overlays: [
          {
            type: ConnectionOverlayType.Label,
            label: '<b>New Connection Label</b>',
            click: this.connectionLabelClick.bind(this)
          }
        ],
        click: this.connectionLabelClick.bind(this)
      };

      this.model.configConnection(e.connection,config);
    }
  }

  connectionLabelClick(e) {
    this.fsPrompt.confirm({
      title: 'Confirm',
      template: 'Would you like to delete this connection?'
    }).subscribe(() => {
      this.model.disconnect(e.connection);

    });
  }

  dragStop(e) {
    console.log('dragStop',e);
  }
}
