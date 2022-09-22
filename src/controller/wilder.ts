import { Wilder } from "../entity/Wilder";
import { createGradeForWilder } from "./grade";
import dataSource from "../utils";
import { IController } from "../interfaces/IController";
import { Grade } from "../entity/Grade";
import { IGrade } from "../interfaces/IGrade";
import ISkillWithGrade from "../interfaces/ISkillWithGrade";
import Skill from "../entity/Skill";

const wilderController: IController = {
  create: async (req, res) => {
    try {
      const { name, city, description, grades } = req.body;

      const createdWilder = await dataSource.getRepository(Wilder).save({
        name,
        city,
        description,
      });

      let isNotFoundAndBreak = false;
      if (grades.length > 0) {
        for (const grade of req.body.grades) {
          const addRes = await createGradeForWilder(
            createdWilder.id,
            grade.skillId,
            grade.grades
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

      res.status(201).send({
        message: "Created wilder",
        newWilder: createdWilder,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Error while creating wilder" });
    }
  },
  getAll: async (req, res) => {
    try {
      const allWilders = await dataSource.getRepository(Wilder).find({
        relations: {
          grades: {
            skill: true,
          },
        },
      });

      const formattedResponse = allWilders.map((el) => {
        const elGrades = el.grades.map((grade) => {
          return {
            id: grade.id,
            name: grade.skill.name,
            skillId: grade.skill.id,
            grades: grade.grade,
          };
        });

        return {
          id: el.id,
          name: el.name,
          description: el.description,
          city: el.city,
          grades: elGrades,
        };
      });

      res.status(200).send({
        message: "Success",
        wilders: formattedResponse,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error while getting all wilders",
      });
    }
  },
  updateById: async (req, res) => {
    try {
      const wilderId = parseInt(req.params.wilderid);
      if (isNaN(wilderId)) {
        res.status(400).send({
          message: "No valid wilder ID specified in the route",
        });
        return;
      }

      const wilderToUpdate = await dataSource
        .getRepository(Wilder)
        .findOneBy({ id: wilderId });
      if (wilderToUpdate === null || wilderToUpdate === undefined) {
        res.status(404).send({
          message: "No wilder found with that ID.",
        });
        return;
      }

      await dataSource.getRepository(Wilder).update(
        { id: wilderId },
        {
          name: req.body.name,
          city: req.body.city,
          description: req.body.description,
        }
      );

      if (typeof req.body.grades === "undefined") {
        req.body.grades = [];
      }

      const wilderGradesInDb = await dataSource.getRepository(Grade).find({
        where: {
          wilder: {
            id: wilderId,
          },
        },
        select: {
          id: true,
        },
      });

      // delete grades not present in req.body.grades
      const bodyGradesIds: number[] = req.body.grades.map(
        (el: IGrade) => el.id
      );
      const wilderGradesIds: number[] = wilderGradesInDb.map((el) => el.id);
      const gradeIdsToDelete: number[] = wilderGradesIds.filter(
        (id) => !bodyGradesIds.includes(id)
      );

      gradeIdsToDelete.forEach(async (grade) => {
        await dataSource.getRepository(Grade).delete(grade);
      });

      await Promise.all(
        req.body.grades.map(async (gradeToAdd: ISkillWithGrade) => {
          // get the existing grades for the wilder
          const existingGrade = await dataSource.getRepository(Grade).findOne({
            where: {
              skill: {
                id: gradeToAdd.skillId,
              },
              wilder: {
                id: wilderToUpdate.id,
              },
            },
          });

          // verify if skill exists in DB
          const newSkill = await dataSource
            .getRepository(Skill)
            .findOneBy({ id: gradeToAdd.skillId });

          if (newSkill === null) {
            res.status(500).send({
              message:
                "Error while updating the requested wilder : skill not existing",
            });
          } else {
            if (existingGrade !== null) {
              // grade already exists : UPDATE
              existingGrade.grade = gradeToAdd.grades;
              existingGrade.skill = newSkill;
              await dataSource.getRepository(Grade).save(existingGrade);
            } else {
              // grade does not exists : CREATE
              const newGrade = new Grade();
              newGrade.grade = gradeToAdd.grades;
              newGrade.skill = newSkill;
              newGrade.wilder = wilderToUpdate;
              await dataSource.getRepository(Grade).save(newGrade);
            }
          }
        })
      );

      res.status(204).send({
        message: "Wilder updated successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error while updating the requested wilder",
      });
    }
  },
  deleteById: async (req, res) => {
    try {
      const wilderId = parseInt(req.params.wilderid);
      if (isNaN(wilderId)) {
        res.status(500).send({
          message: "No valid wilder ID specified in the route",
        });
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
        res.status(200).send({
          message: "Wilder deleted successfully",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error while deleting the requested wilder",
      });
    }
  },
};

export default wilderController;
