import { Component, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { FsModelDirective } from 'src/app/directives/fs-model';
import { random } from 'lodash';


@Component({
  selector: 'example',
  templateUrl: 'example.component.html',
  styleUrls: ['example.component.scss']
})
export class ExampleComponent implements AfterViewInit {

  @ViewChild(FsModelDirective)
  public model: FsModelDirective;
  public objects = [];

  constructor() {}

  ngAfterViewInit() {

    for (let i = 0; i < 8; i++) {
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
          label: 'Label ' + idx,
          click: (data, e) => {
            console.log(data, e);
          },
          data: {
            object: object
          }
      });
    }
  }

  dragStop(e) {
    console.log(e);
  }
}
