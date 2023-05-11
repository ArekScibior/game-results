import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import * as _ from 'underscore';
import * as  clubsJOSN from '../../assets/clubs.json';

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

	name          = '';
	dateOfBirth   = '';
	favouriteClub = '';
	clubs         = _.sortBy(_.map(_.pluck(_.flatten(_.pluck(CLUBS, 'clubs')), 'name')));
	avatarBase64;
	avatar;

	close(): void {
		this.dialogRef.close();
	}

	valid(data): any {
		if (this.name == "") {
			this.toastr.error("Proszę uzupełnić imię i nazwisko.", "")
			return true;
		}
		
		console.log(this.dateOfBirth)
		var dateOfBirth = moment(this.dateOfBirth).format('YYYY-MM-DD')
		console.log(dateOfBirth)
		if (dateOfBirth == "") {
			this.toastr.error("Proszę uzupełnić datę urodzenia.", "")
			return true;
		}

		return false;
	}

	handleUpload(event): void {
		if (!event.target.files.length) {
			this.avatarBase64 = ""
		} else {
			const file = event.target.files[0];
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => {
				this.avatarBase64 = reader.result	
			};
		}
}

	save(): void {
		this.data.dataPlayer = {
			name: this.name,
			dateOfBirth: moment(this.dateOfBirth).format('YYYY-MM-DD'),
			favouriteClub: this.favouriteClub,
			avatarBase64: this.avatarBase64
		}
		if (this.valid(this.data.dataPlayer)) { return }

		let dataToSend = {
			dataPlayer: this.data.dataPlayer
		}
		console.log('dataToSend',dataToSend)
		this.dialogRef.close(dataToSend);
	}

	ngOnInit() { }

}
