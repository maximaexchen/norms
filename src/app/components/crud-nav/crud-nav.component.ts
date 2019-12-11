import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '@app/modules/auth/services/authentication.service';

@Component({
  selector: 'app-crud-nav',
  templateUrl: './crud-nav.component.html',
  styleUrls: ['./crud-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrudNavComponent implements OnInit {
  @Input() form: any;
  @Input() isNew: string;
  @Input() routeNew: string;
  @Input() validForm: boolean;
  @Input() dirtyForm: boolean;
  @Input() editable: boolean;
  @Input() deletable: boolean;
  @Input() readyToSave: boolean;
  @Input() role: string;
  @Output() save = new EventEmitter();
  @Output() create = new EventEmitter();
  @Output() edit = new EventEmitter();
  @Output() delete = new EventEmitter();
  @Output() cancle = new EventEmitter();

  constructor(
    private router: Router,
    public authenticationService: AuthenticationService
  ) {}

  ngOnInit() {}

  public onSubmit() {
    this.save.emit('CrudNav Submit');
  }

  public onCreate() {
    this.router.navigate([this.routeNew]);
  }

  public onEdit() {
    this.edit.emit('CrudNav Edit');
  }

  public onDelete() {
    this.delete.emit('CrudNav Delete');
  }

  public onCancle() {
    this.cancle.emit('CrudNav Cancle');
  }
}
