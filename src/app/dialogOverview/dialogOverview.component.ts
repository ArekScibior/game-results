import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import * as _ from 'underscore';

@Component({
	selector: 'app-dialogOverview',
	templateUrl: './dialogOverview.component.html',
	styleUrls: ['./dialogOverview.component.css']
})
export class DialogOverviewComponent implements OnInit {
	players: [];
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef: MatDialogRef<DialogOverviewComponent>) { }

	player1 = '';
	player2 = '';
	player1Score = '';
	player2Score = '';
	selectedPlayer(result, id) {
		console.log(result, id)
		if (id == 1) { this.player1 = result } else if (id == 2) {this.player2 = result}
	}

	onChange(res, id) {
		if (id == 1) { this.player1Score = res } else if (id == 2) {this.player2Score = res}
	}

	close(): void {
		this.dialogRef.close();
	}

	valid(data): any {
		console.log('data', data)
		let existPlayer1 = _.contains(this.players, data.player1)
		console.log(existPlayer1, this.players)
		let existPlayer2 = _.contains(this.players, data.player2)
		if (!existPlayer1) {
			console.log('Błędny zawodnik numer 1')
			return true;
		}
		if (!existPlayer2) {
			console.log('Błędny zawodnik numer 2')
			return true;
		}

		if (data.player1Score == "") {
			console.log('Brak uzupełnionego wyniku zawodnika numer 1')
			return true;
		}
		if (data.player2Score == "") {
			console.log('Brak uzupełnionego wyniku zawodnika numer 2')
			return true;
		}
		return false;
	}

	save(): void {
		this.data.dataScore = {
			player1: this.player1,
			player2: this.player2,
			player1Score: this.player1Score,
			player2Score: this.player2Score,
		}
		const toValidArray = [this.data.dataScore.player1, this.data.dataScore.player2, this.data.dataScore.player1Score, this.data.dataScore.player2Score]
		if (this.valid(this.data.dataScore)) {return}
		this.dialogRef.close(this.data.dataScore);
	}

	ngOnInit() {
		this.players = this.data.playerList
	}

}
