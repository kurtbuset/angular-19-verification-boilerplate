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
  public employee: Observable<Employee>
  
  constructor(
    private http: HttpClient
  ){ 
    this.employeeSubject = new BehaviorSubject<Employee>(null)
    this.employee = this.employeeSubject.asObservable()
  }

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

  update(id, params){
    return this.http.put(`${baseUrl}/${id}`, params)
      .pipe(map((employee: any) => {
        console.log(employee)
        this.employeeSubject.next(employee) 
        return employee
      }))
  }

  delete(id){
    return this.http.delete(`${baseUrl}/${id}`)
  }
}