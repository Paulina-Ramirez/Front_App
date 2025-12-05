import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-actualizar-modal',
  templateUrl: './actualizar-modal.component.html',
  styleUrls: ['./actualizar-modal.component.scss']
})
export class ActualizarModalComponent {

  constructor(
    public dialogRef: MatDialogRef<ActualizarModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  public onCancel(): void {
    this.dialogRef.close({ isConfirmed: false });
  }

  public onConfirm(): void {
    this.dialogRef.close({ isConfirmed: true });
  }
}
