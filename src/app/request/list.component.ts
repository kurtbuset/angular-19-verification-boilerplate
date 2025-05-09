import { Component } from "@angular/core";
import { AccountService } from '../_services/account.service'

@Component({ templateUrl: 'list.component.html'})
export class ListComponent{
  account = this.accountService.accountValue
  
  constructor(private accountService: AccountService) { }
} 