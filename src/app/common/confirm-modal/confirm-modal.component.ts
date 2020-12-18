import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import * as _ from 'underscore';

@Component({
	selector: 'app-entryResult',
	templateUrl: './confirm-modal.component.html',
	styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent implements OnInit {
	gameName: ""
	message: "";
	title: "";
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef: MatDialogRef<ConfirmModalComponent>) { }
	
	close(): void {
		this.dialogRef.close();
	}

	valid(data): any {
		return false;
	}

	save(): void {
		this.dialogRef.close('save');
	}

	ngOnInit() {
		this.message = this.data.messsage
		this.title = this.data.title
		this.gameName = this.data.game.name
	}

}
