import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-contacts',
    templateUrl: './contacts.component.html',
    styleUrls: ['./contacts.component.css'],
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule]
})
export class ContactsComponent {
    contactForm: FormGroup;
    submitted = false;
    success = false;

    constructor(private fb: FormBuilder) {
        this.contactForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            message: ['', Validators.required]
        });
    }

    onSubmit() {
        this.submitted = true;
        if (this.contactForm.valid) {
            this.success = true;
            // Here you would typically send the form data to your backend
            this.contactForm.reset();
            setTimeout(() => this.success = false, 4000);
        }
    }
} 