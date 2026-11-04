import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Report, ReportBody } from '../model/report.model';

@Service()
export class ReportService {
  private readonly http = inject(HttpClient);

  create(body: ReportBody) {
    return this.http.post<Report>(`${environment.apiUrl}/reports`, body);
  }
}