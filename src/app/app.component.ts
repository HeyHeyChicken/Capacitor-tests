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
import { PluginListenerHandle } from '@capacitor/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  //#region Attributes

  protected accelerometer?: AccelListenerEvent;
  protected rotation?: RotationRate;
  protected photoURL?: string;

  //#endregion

  //#region Functions

  protected async showCurrentPosition(): Promise<void> {
    await Dialog.alert({
      title: 'Current position',
      message: JSON.stringify(await Geolocation.getCurrentPosition()),
    });
  }

  protected async showDeviceInfos(): Promise<void> {
    await Dialog.alert({
      title: 'Device infos',
      message: JSON.stringify(await Device.getInfo()),
    });
  }

  protected async showNetworkInfos(): Promise<void> {
    await Dialog.alert({
      title: 'Device infos',
      message: JSON.stringify(await Network.getStatus()),
    });
  }

  protected async testDialog(): Promise<void> {
    const { value, cancelled } = await Dialog.prompt({
      title: 'Hello',
      message: `What's your name?`,
    });
    if(!cancelled){
      await Dialog.alert({
        title: 'Result',
        message: 'So, you name is :"' + value + '" right?',
      });
    }
  }

  protected testVibration(): void{
    Haptics.vibrate();
  }

  protected openKeyboard(): void {
    Keyboard.show();
  }

  protected showToast(): void{
    this._toast("Hello, I'm a toast!");
  }

  protected async askPhoto(): Promise<void>{
    const PHOTO = await Camera.getPhoto({
      quality: 100,
      allowEditing: true,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });
    this.photoURL = PHOTO.webPath;
  }

  protected async createFile(): Promise<void>{
    const { value, cancelled } = await Dialog.prompt({
      title: 'Write a file',
      message: `What do you want to store?`,
    });
    if(!cancelled){
      await Filesystem.writeFile({
        path: 'secrets/text.txt',
        data: value,
        directory: Directory.External,
        encoding: Encoding.UTF8,
        recursive: true
      }).then(result => {
        this._toast("The file is created!");
      }).catch(err => {
        this._toast("Error : " + JSON.stringify(err));
      });
    }
  }

  protected async readFile(): Promise<void>{
    const contents = await Filesystem.readFile({
      path: 'secrets/text.txt',
      directory: Directory.External,
      encoding: Encoding.UTF8,
    }).then(result => {
      this._toast(JSON.stringify(result));
    }).catch(err => {
      console.log(err);
      this._toast("Error : " + JSON.stringify(err));
    });
  }
  



  

  

  

















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

  private _toast(value: string){
    Toast.show({
      text: value,
    });
  }
  
  //#endregion
}
