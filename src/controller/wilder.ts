import { Wilder } from "../entity/Wilder";
import { createGradeForWilder } from "./grade";
import dataSource from "../utils";
import { IController } from "../interfaces/IController";

const wilderController: IController = {
  create: async (req, res) => {
    try {
      const { name, city, description, skills } = req.body;

      const createdWilder = await dataSource.getRepository(Wilder).save({
        name,
        city,
        description,
      });

      let isNotFoundAndBreak = false;
      if (typeof skills !== "undefined" && skills.length > 0) {
        for (const skill of req.body.skills) {
          const addRes = await createGradeForWilder(
            createdWilder.id,
            skill.skillId,
            skill.grades
          );

          if (addRes === null) {
            isNotFoundAndBreak = true;
            break;
          }
        }
      }

      if (isNotFoundAndBreak) {
        res.status(400).send({
          message: "No wilder or skill found with the provided IDs",
        });
        return;
      }

      res
        .status(201)
        .send({ message: "Created wilder", newWilder: createdWilder });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Error while creating wilder" });
    }
  },
  getAll: async (req, res) => {
    try {
      const allWilders = await dataSource.getRepository(Wilder).find();

      const formattedResponse = allWilders.map((el) => {
        const elSkills = el.grades.map((grade) => {
          return {
            title: grade.skill.name,
            grades: grade.grade,
          };
        });

        return {
          id: el.id,
          name: el.name,
          description: el.description,
          city: el.city,
          skills: elSkills,
        };
      });

      res.status(200).send({ message: "Success", wilders: formattedResponse });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Error while getting all wilders" });
    }
  },
  updateById: async (req, res) => {
    try {
      const wilderId = parseInt(req.params.wilderid);
      if (isNaN(wilderId)) {
        res
          .status(400)
          .send({ message: "No valid wilder ID specified in the route" });
        return;
      }

      const updateRes = await dataSource
        .getRepository(Wilder)
        .update({ id: wilderId }, req.body);

      if (updateRes.affected === 0) {
        res.status(400).send({
          message:
            "No update could be effectued. Please check the wilder id and your request body.",
        });
      } else {
        res.status(204).send({ message: "Wilder updated successfully" });
      }
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error while updating the requested wilder" });
    }
  },
  deleteById: async (req, res) => {
    try {
      const wilderId = parseInt(req.params.wilderid);
      if (isNaN(wilderId)) {
        res
          .status(500)
          .send({ message: "No valid wilder ID specified in the route" });
        return;
      }

      const deleteRes = await dataSource
        .getRepository(Wilder)
        .delete({ id: wilderId });

      if (deleteRes.affected === 0) {
        res.status(400).send({
          message: "No delete could be effectued. Please check the wilder id.",
        });
      } else {
        res.status(200).send({ message: "Wilder deleted successfully" });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send({ message: "Error while deleting the requested wilder" });
    }
  },
};

export default wilderController;
