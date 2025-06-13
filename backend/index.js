const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const {Server} = require("socket.io");

const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const { initRepo } = require("./controllers/init");
const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const { pushRepo } = require("./controllers/push");
const { pullRepo } = require("./controllers/pull");
const { revertRepo } = require("./controllers/revert");

const mainRouter = require("./routes/main.router");

yargs(hideBin(process.argv))
  .command("start", "Start a new server", {}, startServer)
  .command("init", "Initialise a new Repository", {}, initRepo)
  .command(
    "add <file>",
    "Add a file to the Repository",
    (yargs) => {
      yargs.positional("file", {
        describe: "File to add to the staging area",
        type: "string",
      });
    },
    (argv) => {
      addRepo(argv.file);
    }
  )
  .command(
    "commit <message>",
    "Commit the stage file",
    (yargs) => {
      yargs.positional("message", {
        describe: "Commit messages",
        type: "string",
      });
    },
    (argv) => {
      commitRepo(argv.message);
    }
  )
  .command("push", "Push commit to S3", {}, pushRepo)
  .command("pull", "pull commits from S3", {}, pullRepo)
  .command(
    "revert <commitID>",
    "Revert to specific commit",
    (yargs) => {
      yargs.positional("commitID", {
        describe: "Commit ID to revert to",
        type: "string",
      });
    },
    (argv) => {
      revertRepo(argv.commitID);
    }
  )
  .demandCommand(1, "You need atlist one command")
  .help().argv;

function startServer() {
  const app = express();
  const port = process.env.PORT || 7000;

  app.use(bodyParser.json());
  app.use(express.json());
  app.use(cors({origin: "*"}));

  const mongoURI = process.env.MONGODB_URI;
  mongoose
    .connect(mongoURI)
    .then(() => {
      console.log("MongoDb Connected");
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
    });

    app.use("/", mainRouter);

    let user = "test";
    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection",(socket)=>{
        socket.on("joinRoom",(userId)=>{
            user = userId;
            console.log("====");
            console.log(user);
            console.log("====");
            socket.join(userId);
        });
    });

    const db = mongoose.connection;

    db.once("open",async ()=>{
        console.log("crud operations started");
        //crud
    });

    httpServer.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
}
