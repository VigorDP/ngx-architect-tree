import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { DelonABCModule } from '@delon/abc';
import { DelonFormModule } from '@delon/form';
import { ArchitectTreeComponent } from './component';

@NgModule({
  imports: [NgZorroAntdModule, DelonABCModule, DelonFormModule, CommonModule, FormsModule],
  declarations: [ArchitectTreeComponent],
  exports: [ArchitectTreeComponent],
})
export class NgxArchitectTreeModule {}
