import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopBarComponent } from '../../components/common/top-bar/top-bar.component';
import { CvAnalyzerService } from '../../services/cv-analyzer.service';
import { finalize, timeout } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import {
  CvAnalyzeResponse,
  CvHistoryItem,
  CvSectionScores,
} from '../../models/cv-analysis.model';

@Component({
  selector: 'app-cv-analyzer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TopBarComponent,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatIconModule,
    MatExpansionModule,
    MatTabsModule,
  ],
  templateUrl: './cv-analyzer.html',
  styleUrls: ['./cv-analyzer.css'],
})
export class CvAnalyzerPageComponent implements OnInit {
  selectedFile: File | null = null;
  targetRole = '';
  jobDescription = '';
  analyzing = false;
  historyLoading = false;
  errorMessage = '';
  result: CvAnalyzeResponse | null = null;
  history: CvHistoryItem[] = [];
  latestAnalysis: CvHistoryItem | null = null;
  selectedTabIndex = 0;

  constructor(
    private cvAnalyzerService: CvAnalyzerService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  onFilePicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile = file;
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  onTabIndexChange(index: number): void {
    this.selectedTabIndex = index;
    this.cdr.detectChanges();
  }

  switchToHistoryTab(): void {
    this.selectedTabIndex = 1;
    this.cdr.detectChanges();
  }

  private setLatestFromResult(res: CvAnalyzeResponse): void {
    this.latestAnalysis = {
      id: res.analysisId,
      originalFilename: this.selectedFile?.name || 'Latest Upload',
      overallScore: res.overallScore,
      createdAt: res.createdAt,
      analysis: res.analysis,
    };
  }

  analyzeCv(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please choose a PDF or DOCX file first.';
      return;
    }

    this.analyzing = true;
    this.errorMessage = '';
    this.result = null;

    this.cvAnalyzerService
      .analyzeCv(this.selectedFile, this.targetRole, this.jobDescription)
      .pipe(
        timeout(120000),
        finalize(() => {
          this.analyzing = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (res) => {
          if (!res?.success) {
            this.errorMessage = 'CV analysis failed. Please try again.';
            this.cdr.detectChanges();
            return;
          }
          this.result = res;
          this.setLatestFromResult(res);
          this.selectedTabIndex = 0;
          this.loadHistory();
          this.cdr.detectChanges();
        },
        error: (err) => {
          if (err?.name === 'TimeoutError') {
            this.errorMessage = 'Analysis timed out. Please try again with a smaller or clearer CV.';
            this.cdr.detectChanges();
            return;
          }
          this.errorMessage =
            err?.error?.error ||
            err?.error?.message ||
            'Failed to analyze CV. Please try again.';
          this.cdr.detectChanges();
        },
      });
  }

  getSectionScores(scores: CvSectionScores): { label: string; value: number }[] {
    return [
      { label: 'Structure', value: scores.structure },
      { label: 'Impact', value: scores.impact },
      { label: 'Skills Alignment', value: scores.skillsAlignment },
      { label: 'ATS Readability', value: scores.atsReadability },
      { label: 'Clarity', value: scores.clarity },
    ];
  }

  scoreClass(score: number): string {
    if (score >= 75) return 'score-high';
    if (score >= 50) return 'score-mid';
    return 'score-low';
  }

  private loadHistory(): void {
    this.historyLoading = true;
    this.cdr.detectChanges();
    this.cvAnalyzerService
      .getMyAnalyses(8)
      .pipe(
        finalize(() => {
          this.historyLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (res) => {
          this.history = res.analyses || [];
          if (!this.result && this.history.length > 0) {
            this.latestAnalysis = this.history[0];
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.cdr.detectChanges();
        },
      });
  }
}
