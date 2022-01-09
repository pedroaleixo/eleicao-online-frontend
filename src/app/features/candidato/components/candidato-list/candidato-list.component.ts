import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';
import { CPF_MASK } from 'src/app/core/util/masks';
import { FormBuilder, FormGroup } from '@angular/forms';
import { somenteNumeros } from 'src/app/core/util/string.util';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from 'src/app/shared/delete-dialog/delete-dialog.component';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { FiltroPessoa } from 'src/app/features/pessoa/interfaces/filtro-pessoa';
import { StorageService } from 'src/app/core/services/storage.service';
import { ELEICAO_ATIVA } from 'src/app/core/util/constants';
import { Candidato } from '../../interfaces/candidato';
import { CandidatoService } from '../../services/candidato.service';

@Component({
  selector: 'app-candidato-list',
  templateUrl: './candidato-list.component.html',
  styleUrls: ['./candidato-list.component.css']
})
export class CandidatoListComponent implements OnInit {

  idEleicaoAtiva:number;
  cpfMask = CPF_MASK;
  filtro:FiltroPessoa = {};
  displayedColumns: string[] = ['nome', 'cpf', 'cargo', 'acoes'];
  dataSource = new MatTableDataSource<Candidato>();
  filtroForm!: FormGroup;
  pageEvent!: PageEvent;
  pageIndex: number = 0;
  pageSize:number = 5;
  length!:number;

  @ViewChild(MatPaginator)paginator!: MatPaginator;

  constructor(private formBuilder: FormBuilder,
    private userService: UserService,
    private candidatoService: CandidatoService,
    private snackbarService: SnackbarService,
    private storageService:StorageService,
    public dialog: MatDialog,
    private router: Router) { }



  ngOnInit() {

    this.idEleicaoAtiva = Number(this.storageService.getItem(ELEICAO_ATIVA));

    this.filtroForm = this.formBuilder.group({
      nome: [''],
      cpf: ['']
    });

    this.filtrar();
  }

  filtrar(){
    const cpf = this.filtroForm.get('cpf').value ? somenteNumeros(this.filtroForm.get('cpf').value) : null;
    const nome = this.filtroForm.get('nome').value ? this.filtroForm.get('nome').value : null;
    this.filtro = {cpf, nome, idEleicao: this.idEleicaoAtiva};

    this.candidatoService.listarCandidatosPorFiltro(this.filtro, this.pageIndex, this.pageSize)
    .subscribe(page => {
      this.dataSource.data = page.content;
      this.pageIndex = (page.pageable ? page.pageable.pageNumber : 0);
      this.pageSize = (page.pageable ? page.pageable.pageSize : 5);
      this.length = page.totalElements;
    });
  }

  limpar(){
    this.filtroForm.reset();
    this.pageIndex = 0;
    this.filtrar();
  }

  buscarCandidatos(event:PageEvent){
    this.userService.getUser().subscribe(user => {
      if(user?.pessoa) {
        this.candidatoService.listarCandidatosPorFiltro(this.filtro, event.pageIndex,
          event.pageSize)
        .subscribe(page => {
          this.dataSource.data = page.content;
          this.pageIndex = event.pageIndex;
          this.pageSize = event.pageSize;
          this.length = page.totalElements;
        });
      }
    });

    return event;
  }


  redirecionarParaCadastro(){
    this.router.navigate(['/candidato/form']);
  }

  redirecionarParaEdicao(id:number){
    this.router.navigate([`/candidato/form/${id}`]);
  }

  confirmarRemocao(id:number){
    const dialogRef = this.dialog.open(DeleteDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.candidatoService.remover(id).subscribe(resp => {
          window.scroll(0,0);
          this.snackbarService.success('Candidato removido com sucesso');
          this.limpar();
        });
      }
    });
  }

  voltar(){
    this.router.navigate(['/admin']);
  }


}
