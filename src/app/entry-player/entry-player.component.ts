import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import * as _ from 'underscore';
import * as  clubsJOSN  from  '../../assets/clubs.json';

let CLUBS = (clubsJOSN as any).default;

@Component({
	selector: 'app-entryResult',
	templateUrl: './entry-player.component.html',
	styleUrls: ['./entry-player.component.scss']
})
export class EntryPlayerComponent implements OnInit {
	players: [];
	constructor(
		public toastr: ToastrService,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef: MatDialogRef<EntryPlayerComponent>) { }

	name = '';
	age = '';
	favouriteClub = '';
	clubs  = _.sortBy(_.map(_.pluck(_.flatten(_.pluck(CLUBS, 'clubs')), 'name')));
	
	close(): void {
		this.dialogRef.close();
	}

	valid(data): any {
		if (this.name == "") {
			this.toastr.error("Proszę uzupełnić imię i nazwisko.", "")
			return true;
		}

		if (this.age == "") {
			this.toastr.error("Proszę uzupełnić wiek.", "")
			return true;
		}

		if (this.age !== "" && _.isNaN(Number(this.age))) {
			this.toastr.error("Proszę uzupełnić poprawnie wiek.", "")
			return true;
		}
		
		return false;
	}

	save(): void {
		this.data.dataPlayer = {
			name: this.name,
			age: this.age,
			favouriteClub: this.favouriteClub
		}
		if (this.valid(this.data.dataPlayer)) {return}
		
		let dataToSend = {
			dataPlayer: this.data.dataPlayer
		}
		
		this.dialogRef.close(dataToSend);
	}

	ngOnInit() {}

}
