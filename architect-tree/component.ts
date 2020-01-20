import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  ChangeDetectorRef,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NzMessageService, NzModalService, NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd';
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
  activeNode
  action='add'

  constructor(private msg: NzMessageService,private nzContextMenuService: NzContextMenuService, public modalSrv: NzModalService, private cdr: ChangeDetectorRef) {}

  ngOnChanges(e): any {
    this.isVisible = e && e.show && e.show.currentValue;
    // tslint:disable-next-line: no-unused-expression
    this.isVisible && this.getData();
  }

  onChange(e){
    selectedRow.parentId=e
  }

  contextMenu($event: MouseEvent, menu: NzDropdownMenuComponent,node): void {
    this.action='edit'
    this.activeNode=node;
    this.nzContextMenuService.create($event, menu);
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

  addOrEditOrView(tpl: TemplateRef<{}>): any {
    if(this.activeNode&&this.action==='edit'){
      this.selectedRow.name=this.activeNode.origin.title;
      this.selectedRow.id=this.activeNode.origin.key;
      this.selectedRow.parentId=this.activeNode.origin.parentId;
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
              this.activeNode=null
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

  delete(): any {
    this.modalSrv.confirm({
      nzTitle: '是否确定删除该项？',
      nzOkType: 'danger',
      nzOnOk: () => {
        this.deleteApi({
          id: this.activeNode.origin.key
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
    }, 0)

    this.closeEvent.emit();
  }
}
