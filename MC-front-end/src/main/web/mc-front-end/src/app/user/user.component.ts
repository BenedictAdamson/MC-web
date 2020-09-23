import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../user.service';
import { User } from '../user';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

    user: User;

    constructor(
        private route: ActivatedRoute,
        private userService: UserService) { }

    ngOnInit() {
        this.getUser();
    }


    getUser(): void {
        const username = this.route.snapshot.paramMap.get('username');
        this.userService.getUser(username)
            .subscribe(user => this.user = user);
    }
}
