import { Grade } from "../entity/Grade";
import { Skill } from "../entity/Skill";
import { Wilder } from "../entity/Wilder";
import { IController } from "../interfaces/IController";
import dataSource from "../utils";

export const gradeController: IController = {
  create: async (req, res) => {
    try {
      const wilderId = parseInt(req.body.wilderId);
      const skillId = parseInt(req.body.skillId);
      const grades = parseInt(req.body.grades);

      if (isNaN(wilderId) || isNaN(skillId) || isNaN(grades)) {
        res.status(500).send({
          message:
            "No valid skill ID, Wilder ID or valid Grade specified in the route",
        });
        return;
      }

      const addRes = await createGradeForWilder(wilderId, skillId, grades);

      if (addRes === null) {
        res.status(400).send({
          message: "No wilder or skill found with the provided IDs",
        });
        return;
      }

      res.send({ message: "Grade added", newGrade: addRes });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Error while adding the new grade" });
    }
  },
  getAll: async (req, res) => {
    try {
      const allGrades = await dataSource.getRepository(Grade).find();
      res.status(200).send({ message: "Success", grades: allGrades });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Error while getting all grades" });
    }
  },
  getAllGradesForWilderById: async (req, res) => {
    try {
      const wilderId = parseInt(req.params.wilderid);

      if (isNaN(wilderId)) {
        res.status(500).send({
          message: "No valid Wilder ID specified in the route",
        });
        return;
      }

      const wilderSelected = await dataSource
        .getRepository(Wilder)
        .findOneBy({ id: wilderId });

      if (wilderSelected === null) {
        res.status(400).send({
          message: "No Wilder found with the ID specified in the route",
        });
        return;
      }

      const allGrades = await dataSource.getRepository(Grade).find({
        relations: {
          skill: true,
        },
        where: {
          wilder: {
            id: wilderId,
          },
        },
      });

      const formattedGrades = allGrades.map((grade) => {
        return {
          skillName: grade.skill.name,
          gradeValue: grade.grade,
        };
      });

      res.status(200).send({
        message: "Success",
        wilder: wilderSelected,
        grades: formattedGrades,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Error while getting all grades" });
    }
  },
};

export const createGradeForWilder = async (
  wilderId: number,
  skillId: number,
  grade: number
): Promise<Grade | null> => {
  const wilderToAddGrade = await dataSource
    .getRepository(Wilder)
    .findOneBy({ id: wilderId });

  const skillToAddGrade = await dataSource
    .getRepository(Skill)
    .findOneBy({ id: skillId });

  if (wilderToAddGrade === null || skillToAddGrade === null) {
    return null;
  }

  const addRes = await dataSource.getRepository(Grade).save({
    grade,
    skill: skillToAddGrade,
    wilder: wilderToAddGrade,
  });

  return addRes;
};
