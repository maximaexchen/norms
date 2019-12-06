import { ControlContainer, NgForm } from '@angular/forms';
import {
  Component,
  Input,
  EventEmitter,
  Output,
  OnChanges
} from '@angular/core';
import { User } from '@models/user.model';
import { Group } from '@models/group.model';
import {
  EventBusService,
  EmitEvent,
  Events
} from '@app/services/eventbus.service';

@Component({
  selector: 'app-group-form',
  templateUrl: './group-form.component.html',
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class GroupFormComponent {
  @Input() group: Group;
  @Input() users: User[];
  @Input() editable: boolean;
  @Input() isNew: boolean;
  @Input() selectedUsers: string[];
  @Input() dropdownSettings: any;

  // @Output() deSelectAll = new EventEmitter();

  constructor(private eventbus: EventBusService) {}

  selectedChange(event) {
    this.group.users = this.selectedUsers.map(user => user['id']);
    this.eventbus.emit(new EmitEvent(Events.GroupUpdated, this.group));
  }
}
