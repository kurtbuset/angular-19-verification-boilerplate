import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { first } from 'rxjs/operators';
import {
  EmployeeService,
  AlertService,
  AccountService,
  DepartmentService,
} from '@app/_services';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent {
  form: UntypedFormGroup;
  id: string;
  isAddMode: boolean;
  loading = false;
  submitted = false;

  accounts: any[] = [];
  departments: any[] = [];

  constructor(
    private employeeService: EmployeeService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private accountService: AccountService,
    private departmentService: DepartmentService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.isAddMode = !this.id;

    this.form = this.formBuilder.group({
      userId: ['', Validators.required],
      departmentId: ['', Validators.required],
      position: ['', Validators.required],
      isActive: [true, Validators.required],
    });

    this.departmentService.getAll().subscribe((data) => {
      this.departments = data;
    });


    // edit mode
    if (!this.isAddMode) {
      this.employeeService
        .getById(this.id)
        .pipe(first())
        .subscribe((x) => {
          this.form.patchValue(x)

          this.accountService.getAll()
            .pipe(first())
            .subscribe((data) => {
              const filtered = data.filter((account) => account.role === 'User' && account.isActive && !account.employee)
              
              console.log(x.userId)
              const current = data.find(account => account.id === x.userId)
              console.log(current)
              const alreadyIncluded = filtered.some(account => account.id === x.userId)
              console.log(alreadyIncluded)

              if(current && !alreadyIncluded){
                filtered.push(current)
              }

              this.accounts = filtered
            })
        });
    }
    // add mode
    else{
      this.accountService.getAll()
      .pipe(first())
      .subscribe((data) => {
          this.accounts = data.filter((account) => account.role === 'User' && account.isActive && !account.employee)
      })
    }

    
  } 
  

  get f() {
    return this.form.controls;
  }

  

  onSubmit() {
    this.submitted = true;

    this.alertService.clear();

    if (this.form.invalid) return;

    this.loading = true;

    if (this.isAddMode) {
      this.createAccount();
    } else {
      this.editAccount();
    }
  }

  createAccount() {
    this.employeeService
      .create(this.form.value)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Employee created successfully', {
            keepAfterRouteChange: true,
          });
          this.router.navigate(['admin/employees']);
        },
        error: (error) => {
          this.alertService.error(error);
          this.loading = false;
        },
      });
  }

  editAccount() {}
}
