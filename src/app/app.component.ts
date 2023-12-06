import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Device, DeviceInfo } from '@capacitor/device';
import { Dialog } from '@capacitor/dialog';
import { Haptics } from '@capacitor/haptics';
import { Keyboard } from '@capacitor/keyboard';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ConnectionStatus, Network } from '@capacitor/network';
import { Toast } from '@capacitor/toast';
import { AccelListenerEvent, Motion, RotationRate } from '@capacitor/motion';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  //#region Attributes

  protected currentPosition?: Position;
  protected deviceInfo?: DeviceInfo;
  protected name?: string;
  protected accelerometer?: AccelListenerEvent;
  protected rotation?: RotationRate;
  protected photo?: Photo;
  protected network?: ConnectionStatus;
  protected photoURL?: string;

  //#endregion
  
  constructor() {
    this.getCurrentPosition();
    this.getDeviceInfo();
    this.getNetworkInfo();
  }

  //#region Functions

  protected jsonPrint(value: any): string{
    return JSON.stringify(value);
  }

  protected async requestPermissions(): Promise<void>{
    try {
      //@ts-ignore
      await DeviceMotionEvent.requestPermission();
      this.listenAccelerometer();
    } catch (e) {
      Toast.show({
        text: this.jsonPrint(e),
      });
      return;
    }
  }

  protected async listenAccelerometer(): Promise<void>{
    await Motion.addListener('accel', (event: AccelListenerEvent) => {
      this.accelerometer = event;
    });
    await Motion.addListener('orientation', (event: RotationRate) => {
      this.rotation = event;
    });
  }

  protected async getCurrentPosition(): Promise<void>{
    this.currentPosition = await Geolocation.getCurrentPosition();
  }

  protected async getNetworkInfo(): Promise<void>{
    this.network = await Network.getStatus();
  }

  protected async getDeviceInfo(): Promise<void>{
    this.deviceInfo = await Device.getInfo();
  }

  protected async showAlert(): Promise<void> {
    const { value, cancelled } = await Dialog.prompt({
      title: 'Hello',
      message: `What's your name?`,
    });
    this.name = value;
  };

  protected async vibrate(): Promise<void> {
    await Haptics.vibrate();
  };

  protected showKeyboard(): void {
    Keyboard.show();
  };

  protected showToast(){
    this._toast("Hello, I'm a toast");
  }

  protected showNotification(): void {
    LocalNotifications.schedule({
      notifications: [
        {
          id: new Date().getTime(),
          title: "Test",
          body: "That's a notif"
        }
      ]
    })
  };

  protected async openCamera(): Promise<void>{
    this.photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });
    this.photoURL = this.photo.webPath;
  }

  protected async createFile(): Promise<void>{
    // Get value
    /*
    const { value, cancelled } = await Dialog.prompt({
      title: 'Hello',
      message: `What's your name?`,
    });
    */

    // Make file
      await Filesystem.writeFile({
        path: 'secrets/text.txt',
        data: "toto",
        directory: Directory.External,
        encoding: Encoding.UTF8,
        recursive: true
      }).then(result => {
        console.log(result)
        this._toast("The file is created");
      }).catch(err => {
        console.log(err);
        this._toast("Error : " + JSON.stringify(err));
      });
  }

  protected async readFile(): Promise<void>{
    const contents = await Filesystem.readFile({
      path: 'secrets/text.txt',
      directory: Directory.External,
      encoding: Encoding.UTF8,
    }).then(result => {
      console.log(result)
      this._toast(JSON.stringify(contents));
    }).catch(err => {
      console.log(err);
      this._toast("Error : " + JSON.stringify(err));
    });
  }

  private _toast(value: string){
    Toast.show({
      text: value,
    });
  }
  
  //#endregion
}
