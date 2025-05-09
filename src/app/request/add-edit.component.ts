import { Component } from "@angular/core";
import { AccountService } from '../_services/account.service'
import { AlertService } from '../_services/alert.service'
import { ActivatedRoute, Router } from "@angular/router";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { identifierName } from "@angular/compiler";

@Component({ templateUrl: 'add-edit.component.html'})
export class AddEditComponent{
  account = this.accountService.accountValue

  form: UntypedFormGroup
  id: string
  loading = false
  submitted = false
  isAddMode: boolean
  
  constructor(
    private formBuilder: UntypedFormBuilder,
    private accountService: AccountService,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService
  ){}

  ngOnInit(){
    this.form = this.formBuilder.group({
      //  equipment || resources
      name: ['', Validators.required],
      quantity: ['', Validators.required] 
    })  
  }

  get f() { return this.form.controls}

  onSubmit(){
    this.submitted = true
    this.alertService.clear()

    if(this.form.invalid){
      console.log('error brad')
      return
    }

    this.loading = true

    console.log('success')
  }
} 