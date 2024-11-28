import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface DTMember {
  fMemberId: number;
  fName: string;
}

@Injectable({
  providedIn: 'root'
})
export class FTMemberService {
  private apiUrl = 'https://localhost:7201/api/FTMembers';

  constructor(private http: HttpClient) { }

  getMemberById(id: number): Observable<DTMember> {
    return this.http.get<DTMember>(`${this.apiUrl}/${id}`);
  }
}
