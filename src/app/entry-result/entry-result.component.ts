import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import * as _ from 'underscore';

@Component({
	selector: 'app-entryResult',
	templateUrl: './entry-result.component.html',
	styleUrls: ['./entry-result.component.scss']
})
export class EntryResultComponent implements OnInit {
	players: [];
	constructor(
		public toastr: ToastrService,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef: MatDialogRef<EntryResultComponent>) { }

	player1 = '';
	player2 = '';
	player1Score = '';
	player2Score = '';
	game = {}

	onChange(res, id) {
		if (id == 1) { this.player1Score = res } else if (id == 2) {this.player2Score = res}
	}

	close(): void {
		this.dialogRef.close();
	}

	valid(data): any {
		let existPlayer1 = _.contains(this.players, data.player1)
		let existPlayer2 = _.contains(this.players, data.player2)
		if (data.player1 == "") {
			this.toastr.error("Proszę uzupełnić pole Gracz nr 1.", "")
			return true;
		}

		if (data.player2 == "") {
			this.toastr.error("Proszę uzupełnić pole Gracz nr 2.", "")
			return true;
		}

		if (!existPlayer1) {
			this.toastr.error("Nie znaleziono gracza nr 1. Wybierz z listy.", "")
			return true;
		}
		if (!existPlayer2) {
			this.toastr.error("Nie znaleziono gracza nr 2. Wybierz z listy.", "")
			return true;
		}
		
		if (data.player1 == data.player2) {
			this.toastr.error("Wybrani gracze są tacy sami.", "")
			return true;
		}

		if (data.player1Score !== 0 && data.player1Score === "") {
			this.toastr.error("Proszę uzupełnić wynik gracza nr 1.", "")
			return true;
		}

		if (data.player2Score !== 0 && data.player2Score === "") {
			this.toastr.error("Proszę uzupełnić wynik gracza nr 2.", "")
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
		
		let dataToSend = {
			dataScore: this.data.dataScore,
			game: this.data.game
		}
		
		this.dialogRef.close(dataToSend);
	}

	ngOnInit() {
		this.game = this.data.game
		this.players = this.data.playerList
	}

}
