import { ServerWebSocket } from "bun"
import {exec} from "child_process"
import fs from "fs";


function execute(command: string, callback: any) {
    exec(command, function (error, stdout, stderr) {
      callback(stdout);
    });
}

function logResult(output: any) {
  console.log("LOG: ",output);
}



const server = Bun.serve({
    port: 3001,
    fetch (request, server) {
        if (server.upgrade(request)){
            return;
        }

        
        return new Response("Hello Bun");
    }, 
    websocket: {
        open(ws) {
            console.log("connection open");
            ws.send("Connected");
        },
        message(ws, message) {
            
            let body = JSON.parse(String(message));
            console.log("incoming message",body.emit);

            switch (body.emit) {
                
                case "new-project":
                    execute(
                        "mkdir projects && cd projects && cargo stylus new project > output.txt",
                        logResult
                    );

                    ws.send("code compiled");
                    break;


                case "compile-project":
                    fs.writeFileSync("./projects/project/src/main.rs", body.main);
                    fs.writeFileSync("./projects/project/src/lib.rs", body.lib);

                    execute(
                        "cd projects && cd project && cargo stylus check > output.txt 2>&1",
                        logResult
                    );

                    ws.send("Completed");
                    break;
                
                case "get-abi":
                    execute(
                        "cd projects && cd project && cargo stylus export-abi --json > abi.json",
                        logResult
                    );
                    ws.send("Created");
                    break;

                
                default:
                    ws.send("Invalid Event");

            }


        },
        close(ws){
            console.log("connection closed");
            ws.send("Closed");
        }
    }
})
