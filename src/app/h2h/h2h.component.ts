import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material'
import { ToastrService } from 'ngx-toastr';
import { DataproviderService } from '../common/dataprovider.service';
import * as moment from 'moment';
import * as _ from 'underscore';

export interface H2H {
	date: string;
	player1: string;
	player2: string;
	result: string;
}

@Component({
	selector: 'app-entryResult',
	templateUrl: './h2h.component.html',
	styleUrls: ['./h2h.component.scss']
})

export class H2HComponent implements OnInit {
	@ViewChild(MatPaginator, null) paginator: MatPaginator;
	@ViewChild(MatSort, null) sort: MatSort;

	players: [];
	constructor(
		public toastr: ToastrService,
		public dataprovider: DataproviderService,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef: MatDialogRef<H2HComponent>) { }

	player1 = '';
	player2 = '';
	game = {}
	hideTable = true;
	loading = false;
	wins = {}
	draws = 0;

	displayedColumns: string[] = ['date', 'player1', 'player2', 'result'];
	dataSource = new MatTableDataSource<H2H>();

	getMatches() {
		this.hideTable = true;
		let data = {
			player1: this.player1,
			player2: this.player2
		}

		if (this.valid(data)) { return }
		this.loading = true;
		this.dataprovider.getMatches({ player1: this.player1, player2: this.player2, game: this.data.game.name }).subscribe(response => {
			if (!_.isEmpty(response)) {
				let matches = []
				let player1 = data.player1
				let wins = {
					player1: 0,
					player2: 0
				}
				let draws = 0;
				_.each(response, function (v) {
					let firstPlayerScore = ""
					let secondPlayerScore = ""

					if (v.player1 == player1) {
						firstPlayerScore = v.player1Score
						secondPlayerScore = v.player2Score
					} else {
						firstPlayerScore = v.player2Score
						secondPlayerScore = v.player1Score
					}

					if (firstPlayerScore > secondPlayerScore) {
						wins.player1++
					} else if (secondPlayerScore > firstPlayerScore) {
						wins.player2++
					} else if (firstPlayerScore == secondPlayerScore) {
						draws++
					}

					let mappedObject = {
						date: v.date,
						player1: v.player1,
						player2: v.player2,
						result: v.player1Score + " - " + v.player2Score
					}
					matches.push(mappedObject)
				})
				matches = _.sortBy(matches, 'date').reverse()
				this.wins = wins
				this.draws = draws
				this.dataSource = new MatTableDataSource<H2H>(matches)
				this.dataSource.paginator = this.paginator;
				this.dataSource.sort = this.sort;
				this.hideTable = false
				this.loading = false;
			} else {
				this.toastr.error('Brak danych dla wybranych graczy.')
				this.loading = false;
				return;
			}
		});
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
		return false;
	}

	ngOnInit() {
		this.game = this.data.game
		this.players = this.data.playerList
	}

}
