import { Injectable } from "@angular/core";
import { environment } from '@environments/environment';
import { BehaviorSubject, Observable } from "rxjs";
import { map, finalize } from "rxjs/operators";
import { Employee } from '../_models/employee'
import { HttpClient } from "@angular/common/http";

const baseUrl = `${environment.apiUrl}/employees`;

@Injectable({ providedIn: 'root'})
export class EmployeeService{
  private employeeSubject: BehaviorSubject<Employee>
  public department: Observable<Employee>
  
  constructor(private http: HttpClient){ }

  public get employeeValue(): Employee {
    return this.employeeSubject.value
  }

  create(params){
    return this.http.post(`${baseUrl}`, params)
  }
  
  getAll(){
    return this.http.get<Employee[]>(baseUrl)
  }

  getById(id: string){
    return this.http.get<Employee>(`${baseUrl}/${id}`)
  }
}