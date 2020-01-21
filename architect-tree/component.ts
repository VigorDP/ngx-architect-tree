import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  ChangeDetectorRef,
  TemplateRef,
} from '@angular/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { data, selectedRow } from './interface';

@Component({
  selector: 'ngx-architect-tree',
  templateUrl: './index.html',
  styles: [],
})
export class ArchitectTreeComponent implements OnChanges {
  @Input() show = false;
  @Input() label = '标签';
  @Input() listApi;
  @Input() saveApi;
  @Input() deleteApi;
  @Output() public closeEvent = new EventEmitter<any>();

  loading =false
  data=data
  isVisible = false;
  selectedRow = selectedRow;
  action='add'
  activeMenuTitle=''
  constructor(private msg: NzMessageService,public modalSrv: NzModalService, private cdr: ChangeDetectorRef) {}

  ngOnChanges(e): any {
    this.isVisible = e && e.show && e.show.currentValue;
    // tslint:disable-next-line: no-unused-expression
    this.isVisible && this.getData();
  }

  onChange(e){
    selectedRow.parentId=e
  }

  getData(): any {
    this.loading = true;
    this.listApi().subscribe(res => {
      this.loading = false;
      this.data = this.transformToTreeData(res.data)
      this.cdr.detectChanges();
    });
  }

  transformToTreeData(data){
    if(!data) return []
    const result = data.map(item=>{
      return {
        key:item.id,
        title:item.name,
        parentId:item.parentId,
        children:this.transformToTreeData(item.vos),
        isLeaf:!item.vos
      }
    })
    return result;
  }

  addOrEditOrView(tpl: TemplateRef<{}>,node): any {
    if(this.action==='edit'){
      this.selectedRow.name=node.origin.title;
      this.selectedRow.id=node.origin.key;
      this.selectedRow.parentId=node.origin.parentId;
    }
    this.modalSrv.create({
      nzTitle: this.action === 'add' ? '新建' + this.label : '编辑' + this.label,
      nzContent: tpl,
      nzWidth: 450,
      nzOnOk: () => {
        if (this.checkValid()) {
          return new Promise(resolve => {
            this.saveApi({...this.selectedRow,parentId:this.selectedRow.parentId||0}).subscribe(res => {
              if (res.code === '0') {
                resolve();
                this.getData();
              } else {
                resolve(false);
              }
            });
          });
        } else {
          return false;
        }
      },
    });
  }

  checkValid(): boolean {
    const { name } = this.selectedRow;
    if (!name) {
      this.msg.info('请输入' + this.label + '名称');
      return false;
    }
    return true;
  }

  delete(node): any {
    this.modalSrv.confirm({
      nzTitle: '是否确定删除该项？',
      nzOkType: 'danger',
      nzOnOk: () => {
        this.deleteApi({
          id: node.origin.key
        }).subscribe(() => {
          this.getData();
        });
      },
    });
  }

  handleClose(): void {
    this.isVisible = false;
    setTimeout(() => {
      this.data=[]
      this.activeMenuTitle=''
    }, 0)
    this.closeEvent.emit();
  }

  handleMouseEnter(e){
    this.action='edit'
    this.activeMenuTitle=e.target.innerHTML
  }
}
