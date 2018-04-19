import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { WalletService } from '../../../../services/wallet.service';
import { DoubleButtonActive } from '../../../layout/double-button/double-button.component';
import { OnboardingSafeguardComponent } from './onboarding-safeguard/onboarding-safeguard.component';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-onboarding-create-wallet',
  templateUrl: './onboarding-create-wallet.component.html',
  styleUrls: ['./onboarding-create-wallet.component.scss'],
})
export class OnboardingCreateWalletComponent implements OnInit {
  @Output() onLabelAndSeedCreated = new EventEmitter<[string, string]>();
  showNewForm = true;
  form: FormGroup;
  doubleButtonActive = DoubleButtonActive.LeftButton;

  constructor(
    private dialog: MatDialog,
    private walletService: WalletService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.form = this.formBuilder.group({
        label: new FormControl('', Validators.compose([
          Validators.required, Validators.minLength(2),
        ])),
        seed: new FormControl('', Validators.compose([
          Validators.required, Validators.minLength(2),
        ])),
        confirm_seed: new FormControl('',
          Validators.compose(this.showNewForm ? [Validators.required, Validators.minLength(2)] : [])
        ),
      },
      this.showNewForm ? { validator: this.seedMatchValidator.bind(this) } : {},
    );

    if (this.showNewForm) {
      this.generateSeed();
    }
  }

  changeForm(newState) {
    this.showNewForm = newState === DoubleButtonActive.LeftButton;
    this.initForm();
  }

  createWallet() {
    this.showSafe().afterClosed().subscribe(result => {
      if (result) {
        this.emitCreatedData();
      }
    });
  }

  loadWallet() {
    this.emitCreatedData();
  }

  generateSeed() {
    this.walletService.generateSeed().subscribe(seed => {
      this.form.get('seed').setValue(seed);
    });
  }

  private emitCreatedData() {
    this.onLabelAndSeedCreated.emit([this.form.get('label').value, this.form.get('seed').value]);
  }

  private seedMatchValidator(g: FormGroup) {
    return g.get('seed').value === g.get('confirm_seed').value
      ? null : { mismatch: true };
  }

  private showSafe(): MatDialogRef<OnboardingSafeguardComponent> {
    const config = new MatDialogConfig();
    config.width = '450px';
    return this.dialog.open(OnboardingSafeguardComponent, config);
  }
}
