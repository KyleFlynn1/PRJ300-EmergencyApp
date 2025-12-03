import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Defib as DefibInterface } from 'src/app/interfaces/defib.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Defib {

}
