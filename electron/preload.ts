const { ipcRenderer } = require('electron');

const { contextBridge } = require('electron');

const electronHandler = {
  help: {
    helper() {
      console.log('helped!');
    },
  },
  handleRoute: (callback: Function) => {
    ipcRenderer.on('change-route', callback);
  },
  addItems: (callback: Function) => {
    ipcRenderer.on('add-to-cart', callback);
  },
  showNotification: (title: string, body: string, icon: string) => {
    ipcRenderer.send('show-notification', { title, body, icon });
  },
  actionNotification: (callback: Function) => {
    ipcRenderer.on('notification-clicked', callback);
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);
export type ElectronHandler = typeof electronHandler;

// const { ipcRenderer } = require('electron');
// const { contextBridge } = require('electron');

// const electronHandler = {
//   help: {
//     helper() {
//       console.log('helped!');
//     },
//   },
//   handleRoute: {
//     routeChange() {
//       let route;
//       ipcRenderer.on('change-route', (event: any, data: any) => {
//         route = data;
//       });
//       return route;
//     },
//   },
//   addItems: {
//     addProducts() {
//       let isAdded;
//       ipcRenderer.on('add-cart', (event: any, data: any) => {
//         isAdded = data;
//       });
//       return isAdded;
//     },
//   },
// };

// contextBridge.exposeInMainWorld('electron', electronHandler);
// export type ElectronHandler = typeof electronHandler;

// // const { contextBridge, ipcRenderer } = require('electron');

// // contextBridge.exposeInMainWorld('electron', {
// //   doThing: () => ipcRenderer.send('do-a-thing'),
// // });

// // contextBridge.exposeInMainWorld('electronAPI', {
// //   notificationApi: {
// //     sendNotification(title, body) {
// //       ipcRenderer.send('notify', title, body);
// //     },
// //   },
// //   batteryApi: {},
// //   filesApi: {},
// //   handleRoute: {
// //     routeChange(_event, path) {
// //       console.log('clicked');
// //       ipcRenderer.on('change-route', path);
// //     },
// //   },
// // });

// // handleCounter: {
// //   Counter() {
// //     ipcRenderer.on('update-counter', counter);
// //   },
// // },
// // doThing: () => ipcRenderer.send('do-a-thing'),
// // notificationApi: {
// //   sendNotification(title:string, body:string) {
// //     ipcRenderer.send('notify', title, body);
// //   },
// // },
