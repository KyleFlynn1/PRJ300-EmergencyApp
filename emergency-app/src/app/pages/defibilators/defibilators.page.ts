import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController } from '@ionic/angular';
import { AddDefibModalComponent } from 'src/app/components/add-defib-modal/add-defib-modal.component';
import { DefibService } from 'src/app/services/defib/defib';
import { MapComponent } from 'src/app/components/map/map.component';
import { DefibDetailModalComponent } from 'src/app/components/defib-detail-modal/defib-detail-modal.component';
import { ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-defibilators',
  templateUrl: './defibilators.page.html',
  styleUrls: ['./defibilators.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, AddDefibModalComponent, MapComponent, DefibDetailModalComponent]
})
export class DefibilatorsPage implements ViewWillEnter {
  @ViewChild(MapComponent) mapComponent!: MapComponent;
  showAddDefibModal: boolean = false;
  addDefibLocation?: { lat: number; lng: number; address: string };
  
  // Sample defibrillator locations in Ireland
  defibLocations: any[] = [];
  pins: any[] = [];
  activeDefibsCount: number = 0;
  
      
  // Modal state if they are opened or closed
  defibModalLocation?: { lat: number, lng: number, address: string };
  selectedDefib: any = null;
  showDefibDetailModal: boolean = false;

  // Filters
  selectedStatus = 'all';
  
  constructor(
    private menuController: MenuController, 
    private defibService: DefibService) {}

  async ionViewWillEnter() {
    this.defibService.getDefibs().subscribe(defibs => {
      this.defibLocations = defibs.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      this.activeDefibsCount = defibs.length;
      this.pins = defibs
        .filter(defib => defib.location?.lng && defib.location?.lat)
        .map(defib => ({
          lon: defib.location.lng,
          lat: defib.location.lat,
          title: defib.accessInstructions || 'Defibrillator',
          data: defib
        }));
      if (this.mapComponent) {
        this.mapComponent.refreshPins();
      }
    });
  }

  

  ionViewDidEnter() {
    if (this.mapComponent) {
      this.mapComponent.refreshPins();
    }
  }

  filterDefibs() {
    const filtered = this.defibLocations
      .filter(defib => {
        if (this.selectedStatus === 'all') return true;
        if (this.selectedStatus === 'working') return defib.working === true;
        if (this.selectedStatus === 'notWorking') return defib.working === false;
        return true;
      })
      .filter(defib => defib.location?.lng && defib.location?.lat);
    this.pins = filtered.map(defib => ({
      lon: defib.location.lng,
      lat: defib.location.lat,
      title: defib.accessInstructions || 'Defibrillator',
      data: defib
    }));
    if (this.mapComponent) {
      this.mapComponent.refreshPins();
    }
  }

  
  // Open and close add defibrillator modal
  openAddDefibModal(location?: { lat: number; lng: number; address: string }) {
    this.addDefibLocation = location;
    this.showAddDefibModal = true;
  }

  // Open modal with pin location (from map)
  openAddDefibModalWithLocation(lat: number, lng: number, address: string) {
    this.defibModalLocation = { lat, lng, address };
    this.showAddDefibModal = true;
  }  

  closeAddDefibModal() {
    this.showAddDefibModal = false;
    this.addDefibLocation = undefined;
  }

  // Handle submission of new defibrillator data
  handleDefibSubmit(date: any) {
      this.closeAddDefibModal();
      if (date) {
        // Delay to ensure the defib is saved on the backend before fetching
        setTimeout(() => {
          this.defibService.getDefibs().subscribe({
            next: (defibs) => {
              this.defibLocations = defibs.sort((a, b) => 
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              );
              this.activeDefibsCount = this.defibLocations.length;
              this.pins = defibs
                .filter(defib => defib.location?.lng && defib.location?.lat)
                .map(defib => ({
                  lon: defib.location.lng,
                  lat: defib.location.lat,
                  title: defib.accessInstructions || 'Defibrillator',
                  data: defib
                }));
              // Refresh map pins and update map size after modal closes
              this.mapComponent.refreshPins();
            }
          });
        }, 500);
      }
    }

  openMenu() {
    this.menuController.open();
  }
  // Open and close defib detail modal methods
  openDefibDetailModal(defib?: any) {
    this.selectedDefib = defib;
    this.showDefibDetailModal = true;
  }
  
  closeDefibDetailModal(){
    this.showDefibDetailModal = false;
    this.selectedDefib = null;
  }
}
