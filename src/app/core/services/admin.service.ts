import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DemandReport } from '../model/stats.model';
import { ModerationBody, Report, ReportStatus, UserModeration } from '../model/report.model';

@Service()
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/admin`;

  private range(from: string, to: string) {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return params;
  }

  demand(from = '', to = '') {
    return this.http.get<DemandReport>(`${this.api}/reports/demand`, { params: this.range(from, to) });
  }

  exportDemand(format: 'xlsx' | 'pdf', from = '', to = '') {
    return this.http.get(`${this.api}/reports/demand/export`, {
      params: this.range(from, to).set('format', format),
      responseType: 'blob',
    });
  }

  reports(status?: ReportStatus) {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Report[]>(`${this.api}/moderation/reports`, { params });
  }

  moderate(id: number, body: ModerationBody) {
    return this.http.patch<Report>(`${this.api}/moderation/reports/${id}`, body);
  }

  userHistory(userId: number) {
    return this.http.get<UserModeration>(`${this.api}/moderation/users/${userId}`);
  }
}