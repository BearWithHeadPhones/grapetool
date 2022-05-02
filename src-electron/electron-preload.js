import { contextBridge, ipcRenderer, app } from "electron";
var fs = require("fs");
import path from "path";

contextBridge.exposeInMainWorld("myAPI", {
  doAThing: () => {
    return path.resolve(__dirname, process.env.QUASAR_PUBLIC_FOLDER);
  },
  readFile: (filepath) => {
    console.log(path.resolve(__dirname, process.env.QUASAR_PUBLIC_FOLDER));
    return fs.readFileSync(filepath).toString();
  },
  readFileFromPublicFolder: (fileName) => {
    
      let pathToFile = path.resolve(__dirname + "/../../"+fileName)
    
    return fs
      .readFileSync(
        pathToFile
      )
      .toString();
  },

  getFileNameFromArgv: () => ipcRenderer.invoke('filesystem:getArgv'),

  getFIREBASEAPIKEY: () => {return process.env.FIREBASE}
  ,
});
