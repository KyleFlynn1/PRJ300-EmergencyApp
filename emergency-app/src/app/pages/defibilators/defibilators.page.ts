import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController } from '@ionic/angular';
import { AddDefibModalComponent } from 'src/app/components/add-defib-modal/add-defib-modal.component';
import { DefibService } from 'src/app/services/defib/defib';
import { MapComponent } from 'src/app/components/map/map.component';

@Component({
  selector: 'app-defibilators',
  templateUrl: './defibilators.page.html',
  styleUrls: ['./defibilators.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, AddDefibModalComponent, MapComponent]
})
export class DefibilatorsPage implements OnInit {
  @ViewChild(MapComponent) mapComponent!: MapComponent;
  showAddDefibModal: boolean = false;
  
  // Sample defibrillator locations in Ireland
  defibLocations: any[] = [];
  pins: any[] = [];
  activeDefibsCount: number = 0;

  constructor(
    private menuController: MenuController, 
    private defibService: DefibService) {}

  async ngOnInit() {
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
    });
  }
  ionViewDidEnter() {
    if (this.mapComponent) {
      this.mapComponent.refreshPins();
    }
  }

  // Open and close add defibrillator modal
  openAddDefibModal() {
    this.showAddDefibModal = true;
  }

  closeAddDefibModal() {
    this.showAddDefibModal = false;
  }

  // Handle submission of new defibrillator data
  handleDefibSubmit(data: any) {
    this.closeAddDefibModal();
    if (data && data.location) {
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
        this.mapComponent?.refreshPins();
      });
    }
  }

  openMenu() {
    this.menuController.open();
  }
}
