import { Component } from "@angular/core";
import { DepartmentService } from '@app/_services'
import { first } from "rxjs/operators";

@Component({ templateUrl: 'list.component.html'})
export class ListComponent{
  departments: any[]

  constructor(private departmentService: DepartmentService){ }

  ngOnInit(){
    this.departmentService.getAll()
      .pipe(first())
      .subscribe(departments => this.departments = departments)
  }

  deleteDepartment(id: string){
    const department = this.departments.find(x => x.id === id)
    department.isDeleting = true  

    this.departmentService.delete(id)
      .pipe(first())
      .subscribe(() => {
        this.departments = this.departments.filter(x => x.id !== id)
      })
  }
}