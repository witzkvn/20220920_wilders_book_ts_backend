import Skill from "../entity/Skill";
import { IController } from "../interfaces/IController";
import dataSource from "../utils";

const skillController: IController = {
  create: async (req, res) => {
    try {
      const createdSkill = await dataSource
        .getRepository(Skill)
        .save(req.body.name);

      res.status(201).send({
        message: "Created skill",
        newSkill: createdSkill,
      });
    } catch (error) {
      res.status(500).send({ message: "Error while creating skill" });
    }
  },
  getAll: async (req, res) => {
    try {
      const allSkills = await dataSource.getRepository(Skill).find();
      res.status(200).send({ message: "Success", skills: allSkills });
    } catch (error) {
      res.status(500).send({ message: "Error while creating skill" });
    }
  },
  updateById: async (req, res) => {
    try {
      const skillId = parseInt(req.params.skillid);
      if (isNaN(skillId)) {
        res.status(400).send({
          message: "No valid skill ID specified in the route",
        });
        return;
      }

      const updateRes = await dataSource
        .getRepository(Skill)
        .update({ id: skillId }, req.body);

      if (updateRes.affected === 0) {
        res.status(400).send({
          message:
            "No update could be effectued. Please check the skill id and your request body.",
        });
      } else {
        res.status(204).send({ message: "Skill updated successfully" });
      }
    } catch (error) {
      res.status(500).send({
        message: "Error while updating the requested skill",
      });
    }
  },
  deleteById: async (req, res) => {
    try {
      const skillId = parseInt(req.params.skillid);
      if (isNaN(skillId)) {
        res.status(500).send({
          message: "No valid skill ID specified in the route",
        });
        return;
      }

      const deleteRes = await dataSource
        .getRepository(Skill)
        .delete({ id: skillId });

      if (deleteRes.affected === 0) {
        res.status(400).send({
          message: "No delete could be effectued. Please check the skill id.",
        });
      } else {
        res.status(200).send({ message: "Skill deleted successfully" });
      }
    } catch (error) {
      res.status(500).send({
        message: "Error while deleting the requested skill",
      });
    }
  },
};

export default skillController;
