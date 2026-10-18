import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private activeModalSignal = signal<string | null>(null);
  activeModal = this.activeModalSignal.asReadonly();

  private modalDataSignal = signal<any>(null);
  modalData = this.modalDataSignal.asReadonly();

  open(modalId: string, data?: any): void {
    this.modalDataSignal.set(data || null);
    this.activeModalSignal.set(modalId);
  }

  close(): void {
    this.activeModalSignal.set(null);
    this.modalDataSignal.set(null);
  }

  isOpen(modalId: string): boolean {
    return this.activeModalSignal() === modalId;
  }
}
