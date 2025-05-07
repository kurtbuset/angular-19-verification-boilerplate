import { Component } from "@angular/core";
import { DatePipe } from '@angular/common';
import { EmployeeService } from '@app/_services'
import { first } from "rxjs/operators";

@Component({ templateUrl: 'list.component.html', providers: [DatePipe]})
export class ListComponent{
  employees: any[]
 
  constructor(
    private employeeService: EmployeeService
  ){ }

  ngOnInit(){
    this.employeeService.getAll()
      .pipe(first())  
      .subscribe(employee => {
        // console.log(employee) 
        this.employees = employee
      })
  }

  deleteEmployee(id: string){
    const employee = this.employees.find(x => x.id === id)
    console.log(employee)
    employee.isDeleting = true

    this.employeeService.delete(id)
      .pipe(first())
      .subscribe(() => {
        this.employees = this.employees.filter(x => x.id !== id)
      })
  }
} 