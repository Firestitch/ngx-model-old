import { Component, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { FsModelDirective } from 'src/app/directives/fs-model';
import { random } from 'lodash';
import { FsPrompt } from '@firestitch/prompt';
import { of, Observable } from 'rxjs';


@Component({
  selector: 'example',
  templateUrl: 'example.component.html',
  styleUrls: ['example.component.scss']
})
export class ExampleComponent implements AfterViewInit {

  @ViewChild(FsModelDirective)
  public model: FsModelDirective;
  public connectionCreated;
  public objects = [];

  constructor(private fsPrompt: FsPrompt) {
    this.connectionCreated = this._connectionCreated.bind(this);
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

      this.model.connect(object1, object2,
        {
          overlays: [
            {
              type: 'label',
              label: 'Label ' + idx,
              click: this.connectionLabelClick.bind(this)
            }
          ],
          click: this.connectionLabelClick.bind(this),
          data: {
            object: object
          }
      });
    }
  }

  private _connectionCreated(e) {
    if(e.event) {
      return of(
        {
          overlays: [
            {
              type: 'label',
              label: 'Label ',
              click: this.connectionLabelClick.bind(this)
            }
          ],
          click: this.connectionLabelClick.bind(this)
        });
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
