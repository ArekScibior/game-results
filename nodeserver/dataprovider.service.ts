import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataproviderService {

  constructor(private http: HttpClient) { }
  serverUrl = 'http://127.0.0.1:8081/?FUNCTION='; //lokalnie

  getScoreData = function () {
    let moduleName = 'Z_DATA_SCORE_GET'
    let url = this.serverUrl + moduleName;
    return this.http.post(url, {});
  }

  setScoreData = function (payload) {
  let moduleName = 'Z_DATA_SCORE_SET'
  let url = this.serverUrl + moduleName;
  return this.http.post(url, payload);
  }

  getPlayerData = function () {
    let moduleName = 'Z_DATA_PLAYERS_GET'
    let url = this.serverUrl + moduleName;
    return this.http.post(url, {});
  }

  setPlayerData = function (payload) {
    let moduleName = 'Z_DATA_PLAYERS_SET'
    let url = this.serverUrl + moduleName;
    return this.http.post(url, payload);
  }

  
  getNumber() {
    return 1
  }
}
