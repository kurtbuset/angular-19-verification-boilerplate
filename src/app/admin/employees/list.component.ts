import { Component } from "@angular/core";
import { DatePipe } from '@angular/common';
import { EmployeeService } from '@app/_services'
import { first } from "rxjs/operators";

@Component({ templateUrl: 'list.component.html', providers: [DatePipe]})
export class ListComponent{
  employees: any[]
 
  constructor(
    private employeeService: EmployeeService,
  ){ }

  ngOnInit(){
    this.employeeService.getAll()
      .pipe(first())  
      .subscribe(employee => {
        // console.log(employee) 
        this.employees = employee
      })
  }
} 