import express from "express";
import cors from "cors";
import "reflect-metadata";
import dataSource from "./utils";
import wilderController from "./controller/wilder";
import skillController from "./controller/skill";
import { gradeController } from "./controller/grade";
const app = express();
const port = 3000;

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/wilders", wilderController.getAll);
app.patch("/api/wilders/:wilderid", wilderController.updateById);
app.delete("/api/wilders/:wilderid", wilderController.deleteById);
app.post("/api/wilders", wilderController.create);

app.post("/api/grades", gradeController.create);
app.get("/api/grades/:wilderid", gradeController.getAllGradesForWilderById);

app.get("/api/skills", skillController.getAll);
app.patch("/api/skills/:skillid", skillController.updateById);
app.delete("/api/skills/:skillid", skillController.deleteById);
app.post("/api/skills", skillController.create);

app.use(function (req, res, next) {
  res.status(404).send("Sorry cant find that!");
});

const start = async (): Promise<void> => {
  await dataSource.initialize();
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

void start();
